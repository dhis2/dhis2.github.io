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

Let's walk through the responsibilities of each service (container) in the above diagram.

### GitHub

DHIS2 has two organisations on GitHub, *DHIS2* and *D2-CI*.

#### DHIS2 organisation

*DHIS2* is where our source code repositories for dhis2 core, front-end apps and libraries live, in a neighbourhood
much like any other on GitHub, The source code is here, PRs are done
here, etc.

#### D2-CI organisation

The *D2-CI* organisation is less conventional. Each front-end
library or app in the dhis2 organisation that utilises the [deploy-build](dhis2/deploy-build) scripts (more on this below) will have a corresponding repository under the *D2-CI* organisation. The corresponding d2-ci repository is automatically created if it doesn't already exist. Examples:

> The 
[dhis2/dashboards-app](dhis2/dashboards-app) repository has a single build definition, and therefore has a single corresponding repository [d2-ci/dashboards-app](d2-ci/dashboards-app). 

> The data-visualizer repository [dhis2/data-visualizer-app](dhis2/data-visualizer-app) defines two different builds: one for the app and one for the plugin. Each of these builds has its own respective d2-ci repository: [d2-ci/data-visualizer-app](d2-ci/data-visualizer-app) and [d2-ci/data-visualizer-plugin](d2-ci/data-visualizer-plugin)

The purpose of the d2-ci repository is to store and track each build artifact of the corresponding dhis2 library/app. While the dhis2 repositories store and track the _source code per commit_, since each commit results in a build (artifact), we can store and track the _build artifact per commit_ by copying each artifact of the dhis2 library/app to the corresponding d2-ci repository. Let's call these d2-ci repositories _build artifact repositories_ from now on.

Having the artifacts in Git allows us to do other interesting things. Read
on.

### Travis CI

We use Travis to run a series of tasks on a source repository (_App_, _Lib_ and _Core_). These tasks are described in a recipe, which is contained in the `.travis.yml` configuration file in each source repository. Together with _what_ to do, and _how_ to do it, the recipe defines what environment it should do so _with_.

A recipe typically contains steps that verify (with automated tests and other verifcation measures) and build the library or front-end app. The tasks will vary slightly for the core and the front-end applications and libraries.

### Jenkins CI

We use Jenkins to verify, build, and deploy [DHIS2 core](dhis2/dhis2-core). Much like Travis does for the front-end apps/libs, it follows a recipe that describes the _what_ to do, _how_ to do it, and what environment to do it in. 

### Amazon S3

We use a S3 bucket as an artifact repository for core build artifacts.

### NPM

NPM is where the front-end libraries are published and made available for apps that want to use them.

## The lifecycle of a commit

Now that we have a clear idea of what each service is responsible for, we can trace the path a commit takes through the build system for a given _App_, _Lib_, or the _Core_.

![](/assets/build_arch/app_commit.png)

Given a code change in any of those types, it all starts as a commit on
the machine it was made on. The system at this point is idle.

When the commit is pushed to the DHIS2 source repository on github, the interaction between the
GitHub and Travis services is triggered.

![](/assets/build_arch/github-travis.png)

Travis follows the recipe described in the repository's .travis.yml file. This recipe will vary depending on the end product: _App_, _Lib_, or the _Core_.

### Core recipe

The Core recipe describes task to verify, test and build the code in a PR to indicate
whether or not the PR is good to merge. Only the result, success or failure, is
used. This result will be manually reviewd by the developer before merging the PR to the master branch.

### App recipe

The App recipe is used by Travis on each commit, regardless of
branch, tag, or whether the commit is attached to a PR. The app recipe includes the following steps: 
1. verification (run tests and quality checks)
2. create the build artifact
3. trigger the `deploy-build` script

The `deploy-build` script creates a BUILD_INFO file containing the commit hash and timestamp, and commits the build artifact and BUILD_INFO file to the respective _build artifact repository_.

![](/assets/build_arch/travis-d2-ci.png)


### Lib recipe

The library recipe starts out identical to the App recipe: it
verifies, builds, and deploys the build artifact to the respective _build artifact repository_ for all commits across all branches, tags, PRs. But the library recipe has one additional step (#4):

1. verification (run tests and quality checks)
2. create the build artifact
3. trigger the `deploy-build` script
4. conditionally trigger the `publish-build` script


In step #4, if a *tag* is pushed to the source repository, it runs the final `publish-build` script, which publishes the library build to NPM, making it available to apps that want to use it.

This final `publish-build` step is only used for libraries, not apps, as it makes little sense to deploy the App artifact to NPM. Nobody is going to do `npm install @dhis2/maintenance-app` in another project.

![](/assets/build_arch/travis-npm.png)


## Where are we now?

Let's take a look at what we have and where we are:

- A build of a front-end application, stored and tracked on *D2-CI*
- A build of a library, stored and tracked on *D2-CI*, and if it was built from a
  tag, published to *NPM*
- A verification that a PR against dhis2 core is safe to merge

Ok, so our library has been released into the wild. But our front-end application artifact
is just sitting there in a _build artifact repository_. How does it go from there into a
DHIS2 build?

Let's see.

First, once Travis indicates that the PR against the
[dhis2-core](dhis2/dhis2-core) is safe to merge, we merge it. It's a new
feature so we merge it to the _master_ branch and do not backport to previous versions (branches).

![](/assets/build_arch/github-jenkins.png)

When Jenkins sees a commit on a branch it monitors (e.g., _master_) it
joins the fray. The butler has a job to do, and like any good butler,
starts to do it without fuss or ado.

The first step is simple, it does much the same work as Travis did
before it, by executing tests and compiling the source code.

The second step is actually internal to the build process, but it is
important to visualise. It is to fetch all the application artifacts that are going
to be bundled into the WAR-file from the _build artifact
repositories_. The list of applications to bundle, and version thereof, resides in the
[`apps-to-bundle.json`](https://github.com/dhis2/dhis2-core/blob/master/dhis-2/dhis-web/dhis-web-apps/apps-to-bundle.json)
file inside of the [dhis2-core](dhis2/dhis2-core) repository.

![](/assets/build_arch/jenkins-d2-ci.png)


> By using the artifacts stored in the _build artifact repositories_ for the official DHIS2 release, we prevent artifacts created on non-sanctioned build environments (e.g., developer's machine) from making their way into production.

The third step is to write a file [`apps-bundle.son`](https://play.dhis2.org/dev/dhis-web-apps/apps-bundle.json) into the bundle that indicates the commitish of each app that was bundled, thereby creating a deterministic build.

Once all the apps have been bundled in the resulting WAR file, the
artifact is complete, and now all that remains is the final step: to
upload the `dhis.war` file to Amazon S3.

![](/assets/build_arch/jenkins-s3.png)

... And Bob's your uncle!
