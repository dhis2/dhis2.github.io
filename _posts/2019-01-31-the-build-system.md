---
title: The Build System
layout: post
categories: [blog]
tags: [build system,architecture]
author: varl
---

The last year has seen some significant changes to how the build system
operates. There are a few moving pieces, so let's get started!

![](/assets/build_arch/build_arch.png)

This is a diagram of the full system, for now focus on the containers
that encapsulate parts of the flow chart.

## Service responsibilities

Let's walk through what each container does.

### GitHub

DHIS2 has two organisations on GitHub, *DHIS2* and *D2-CI*.

#### DHIS2 organisation

*DHIS2* is where our source code repositories live, in a neighbourhood
much like any other on GitHub, The source code is here, PRs are done
here, etc.

#### D2-CI organisation

The *D2-CI* organisation is less conventional. Each front-end
library or app (any entity that defines its own build) in the dhis2 organisation that utilises the [deploy-build](dhis2/deploy-build) scripts
will have a corresponding repository under the *D2-CI* organisation.

E.g., The 
[dhis2/dashboards-app](dhis2/dashboards-app) repository has a single build definition, and therefore has a single corresponding repository
[d2-ci/dashboards-app](d2-ci/dashboards-app). The d2-ci
repository will be automatically created if it doesn't already exist.

Alternately, in the data-visualizer repository, there are two different builds defined: one for plugin and one for the app. Each of these builds has its own respective d2-ci repository.

The purpose of the d2-ci repository is to store and track each build of the dhis2 library/app. The dhis2 repositories store and track the _source code per
commit_, and since each commit results in a build, we can store and
track the _build artifact per commit_ by copying each build (artifact) of the dhis2 library/app to the corresponding d2-ci repository. It is these artifacts that are then pulled into the official tagged releases of the dhis2 product.

By usig the artifacts stored in d2-ci for the official DHIS2 product, we prevent artifacts created on
non-sanctioned build environments (e.g., developer's machine) from making their way into production.

And having them in Git allows us to do other interesting things. Read
on.

### Travis CI

Travis' job is to follow a recipe for how to build and verify a library/app,
often by executing automated tests and other verification measures
defined in the `.travis.yml` configuration file, which is contained in each dhis2 repository. Together with _what_ to do, and _how_ to do it, we define what environment it should do so
_with_.

Travis is used by all repositories to build the branches when a pull request is
opened. Aside from that, usage of Travis varies slightly for the
back-end and the front-end applications and libraries.

In addition to building the PRs we use Travis to build each commit that
gets pushed to the *DHIS2* repository. The _build artifact_, which is the
result of that commit, gets pushed to the respective *D2-CI* repository.

So each commit is built by Travis, and each of those build artifacts are
stored, across all branches and all tags, in what is in fact a git-based
_build artifact repository_.

Travis also creates a *BUILD_INFO* file that contains the SHA the
artifact is created from, along with a timestamp of when it was built.

Now we have a direct link between each commit in the build repository and
the commit it was created from in the source repository.

### Jenkins CI

The primary function of Jenkins is to build and verify the production
branches of the [DHIS2 core](dhis2/dhis2-core). Much like Travis does
for the front-end apps/libs, it follows a recipe on how to do so in
order to run unit tests, integration tests, or what have you.

After Jenkins is satisified the build is polished gold, it creates the
artifact we know as `dhis.war`. This artifact is then uploaded to the
_build artifact repository_, which in this case isn't *Git* but *Amazon S3*.

### Amazon S3

As mentioned above, we use a S3 bucket as an artifact repository for
core build artifacts.

### NPM

For front-end libraries, Travis will publish the _exact_ same artifact
it creates and stores in our Git-based artifact repository to NPM.

## The lifecycle of a commit

Now that we have a clear idea of what each service is responsible for,
we can trace the path a commit takes through the build system for a
given _App_, _Lib_, or the _Core_.

![](/assets/build_arch/app_commit.png)

Given a code change in any of those types, it all starts as a commit on
the machine it was made on. The system at this point is idle.

![](/assets/build_arch/commit-github.png)

Push the commit to a DHIS2 repo to trigger the interaction between the
GitHub and Travis services.

![](/assets/build_arch/github-travis.png)

Travis follows the recipe described in the repository's .travis.yml file. This recipe will vary depending on the end product: _App_, _Lib_, or the _Core_.

### Core recipe

The Core recipe is used to build and test a PR to indicate
whether or not the PR is good to merge. Only the result, success or failure, is
used.

### App recipe

The App recipe is used by Travis on each commit regardless of
branch, tag, or whether the commit is attached to a PR. The app recipe typically includes the following steps: 
* verification (run tests and quality checks)
* create the build artifact
* trigger the `deploy-build` script

The `deploy-build` script commits the build artifact to the respective d2-ci repository.

![](/assets/build_arch/travis-d2-ci.png)


### Lib recipe

The lib recipe:
* verification (run tests and quality checks)
* create the build artifact
* trigger the `deploy-build` script
* conditionally trigger the `publish-build` script

Note that the library recipe starts out identical to the App recipe: it
verifies, builds, and deploys the build artifact to the respective *D2-CI*
repository for all commits across all branches, tags, PRs.

But the library recipe has one additional step. If a *tag* pushed to the source
repository, it runs the final `publish-build` step in the recipe, which
publishes the library to NPM making it available to apps that want to use it.

This final `publish-build` step is only used for libraries, not apps, as it makes little
sense to deploy the App artifact to NPM. Nobody is going to do `npm
install @dhis2/maintenance-app` in another project.

![](/assets/build_arch/travis-npm.png)


## Where are we now?

Let's take a look at what we have and where we are:

- A build of an application, stored and tracked on *D2-CI*
- A build of a library, stored and tracked on *D2-CI*, and if it was built from a
  tag, published to *NPM*
- A verification that a PR against the Core is safe to merge

Ok, so our library has been released into the wild. But our application artifact
is just sitting there in a d2-ci repository. How does it go from there into a
DHIS2 build?

Let's see.

First, since we know that the PR against the
[dhis2-core](dhis2/dhis2-core) is safe to merge, we merge it. It's a new
feature so we merge it to the _master_ branch.

![](/assets/build_arch/github-jenkins.png)

When Jenkins sees a commit on a branch it monitors (e.g., _master_) it
joins the fray. The butler has a job to do, and like any good butler,
starts to do it without fuss or ado.

The first step is simple, it does much the same work as Travis did
before it, by executing tests and compiling the source code.

The second step is actually internal to the build process, but it is
important to visualise. It is to fetch all the application artifacts that are going
to be bundled into the WAR-file, and it does so from the _build artifact
repository_ we have come to know over the course of this text:
[D2-CI](https://github.com/d2-ci).

![](/assets/build_arch/jenkins-d2-ci.png)

The list of applications to bundle, and version thereof, resides in the
[`apps-to-bundle.json`](https://github.com/dhis2/dhis2-core/blob/master/dhis-2/dhis-web/dhis-web-apps/apps-to-bundle.json)
file inside of the [dhis2-core](dhis2/dhis2-core) repository.

Once all the apps have been bundled in the resulting WAR file, the
artifact is complete, and now all that remains is the final step: to
upload the `dhis.war` file to Amazon S3.

![](/assets/build_arch/jenkins-s3.png)

... And Bob's your uncle!
