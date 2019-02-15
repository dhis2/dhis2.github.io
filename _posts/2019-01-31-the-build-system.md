---
title: The Build System
layout: post
categories: [blog]
tags: [build system,architecture]
authors: [varl, jennifer]
---

The last year has seen some significant changes to how the build system
operates and this post will walk through the technical aspects of the
system. The release and development processes which drive the build
system is out of scope for this post and subsequently left out.

There are a few moving pieces, so let's get started!

## Meet the services

[![](/assets/build_arch/build_arch_services.png)](/assets/build_arch/build_arch_services.png)

This is a diagram of the services and their links which make up the
system. For now focus on the containers and let us walk through each
system's responsibility.

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

[![](/assets/build_arch/app-commit.png)](/assets/build_arch/app-commit.png)

Given a code change in any of those types, it all starts as a commit on
the machine it was made on. The system at this point is idle.

When the commit is pushed to the DHIS2 source repository on github, the interaction between the
GitHub and Travis services is triggered.

[![](/assets/build_arch/github-travis.png)](/assets/build_arch/github-travis.png) 

Travis follows the recipe described in the repository's .travis.yml file. This recipe will vary depending on the end product: _App_, _Lib_, or the _Core_.

### Core recipe

The Core recipe describes task to verify, test and build the code in a PR to indicate
whether or not the PR is good to merge. Only the result, success or failure, is
used. This result will be manually reviewd by the developer before merging the PR to the master branch.

[![](/assets/build_arch/github-travis-core.png)](/assets/build_arch/github-travis-core.png)

### App recipe

The App recipe is used by Travis on each commit, regardless of
branch, tag, or whether the commit is attached to a PR. The app recipe includes the following steps: 
1. verification (run tests and quality checks)
2. create the build artifact
3. trigger the `deploy-build` script

The `deploy-build` script creates a BUILD_INFO file containing the commit hash and timestamp, and commits the build artifact and BUILD_INFO file to the respective _build artifact repository_.

[![](/assets/build_arch/github-travis-d2-ci-app.png)](/assets/build_arch/github-travis-d2-ci-app.png)


### Lib recipe

The library recipe starts out identical to the App recipe: it
verifies, builds, and deploys the build artifact to the respective _build artifact repository_ for all commits across all branches, tags, PRs. But the library recipe has one additional step (#4):

1. verification (run tests and quality checks)
2. create the build artifact
3. trigger the `deploy-build` script
4. conditionally trigger the `publish-build` script

In step #4, if a *tag* is pushed to the source repository, it runs the final `publish-build` script, which publishes the library build to NPM, making it available to apps that want to use it.

This final `publish-build` step is only used for libraries, not apps, as it makes little sense to deploy the App artifact to NPM. Nobody is going to do `npm install @dhis2/maintenance-app` in another project.

[![](/assets/build_arch/github-travis-d2-ci-lib.png)](/assets/build_arch/github-travis-d2-ci-lib.png)

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

[![](/assets/build_arch/github-jenkins.png)](/assets/build_arch/github-jenkins.png)

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

[![](/assets/build_arch/jenkins-d2-ci.png)](/assets/build_arch/jenkins-d2-ci.png)


> By using the artifacts stored in the _build artifact repositories_ for the official DHIS2 release, we prevent artifacts created on non-sanctioned build environments (e.g., developer's machine) from making their way into production.

The third step is to write a file [`apps-bundle.son`](https://play.dhis2.org/dev/dhis-web-apps/apps-bundle.json) into the bundle that indicates the commitish of each app that was bundled, thereby creating a deterministic build.

Once all the apps have been bundled in the resulting WAR file, the
artifact is complete, and now all that remains is the final step: to
upload the `dhis.war` file to Amazon S3.

[![](/assets/build_arch/jenkins-s3.png)](/assets/build_arch/jenkins-s3.png)

> Note that all builds may be published to Amazon S3, but not all builds
> are considered an official release.

## The Full System

And here is the full system in a single image.

[![](/assets/build_arch/build_arch.png)](/assets/build_arch/build_arch.png)

## What can we do with it?

That is a lot of words, boxes, and arrows to keep track of. The question is,
what is it all for?

The three most important reasons are these:

- Flexibility to create different builds
- Ability to reproduce builds
- Exact information about what a build contains

Below are some examples of use cases, and if you want to cross-reference the
build system diagrams, the services interacting from this point are:

- Jenkins
- GitHub (D2-CI)
- GitHub (DHIS2)

## Answer questions about a build

### What are the bundled applications in a build?

The root `dhis-web-apps` module serves all the apps which were bundled into the
WAR at build time and includes the time the WAR-file was assembled and from
which commit it was created from.

#### Example URL

[https://play.dhis2.org/dev/dhis-web-apps/](https://play.dhis2.org/dev/dhis-web-apps/)

#### Example build information

```
Wed Nov 28 2018 11:53:15 GMT+0000 (UTC)
87d4970f66bf23d782499e1f00ab0d281cc88a7a
```

### Exactly what versions of the apps does a build contain?

To get a list of applications along with a reference to the exact build of the
application you can query the `dhis-web-apps` module for the `apps-bundle.json`
file.

#### Example URL

[https://play.dhis2.org/dev/dhis-web-apps/apps-bundle.json](https://play.dhis2.org/dev/dhis-web-apps/apps-bundle.json)

#### Example `apps-bundle.json`

```
[
    "https://github.com/d2-ci/app-management-app#97862203ef37d8a69d51b8eb556a5958148e6b72",
    "https://github.com/d2-ci/cache-cleaner-app#1e6ce2230b6f4e00402d41057a9054d23e0029b3",
    "https://github.com/d2-ci/capture-app#05ed5635654f6542637dcf04ec332467c9d32066",
    "https://github.com/d2-ci/charts-app#ceab8f259e812b4683bdc871e4bce85fb9632331",
    "https://github.com/d2-ci/core-resource-app#0d6099a0b3e88f03735d7284b662cbeb7ed0aae5",
    "https://github.com/d2-ci/dashboards-app#1eb94a4df386b3c695df1dc458d761b29c33c3c5",
    "https://github.com/d2-ci/data-administration-app#8c6aeb2552143a868e883218fde416e2b3306832",
    "https://github.com/d2-ci/data-visualizer-app#ecaf7dbd6a906b79461d945c3ba70fe346de2979",
    "https://github.com/d2-ci/data-quality-app#3166be606054bb7f5a979c041048450d97e1e6fe",
    "https://github.com/d2-ci/datastore-app#8f38acb9cf3f97e13310c21ccf4bc4a585fedab5",
    "https://github.com/d2-ci/event-capture-app#889463e56df7072399d410474f9292aa69c3f2d1",
    "https://github.com/d2-ci/event-reports-app#31ac64d73063c33b501961d0373a0e754532c3ec",
    "https://github.com/d2-ci/event-charts-app#cc9d4364ad84abbcd2a64a0cbf99382f10bc9ca8",
    "https://github.com/d2-ci/import-export-app#ebc5a7c0c92890433880f82cdacb28b8c78fcf87",
    "https://github.com/d2-ci/interpretation-app#fd0693d79cede942a4d6f61a47f0138ae816ee3f",
    "https://github.com/d2-ci/maintenance-app#2d1b789c709344398fc28731189e4bef7865db7b",
    "https://github.com/d2-ci/gis-app#f84373dc97b441a1e32d9a68307631fe6bfc99e4",
    "https://github.com/d2-ci/maps-app#5840ec14e92e5f1cf6d54136da114a8844fe6318",
    "https://github.com/d2-ci/menu-management-app#6f218875dcfd199d9ff40ff105e6de5012599b3a",
    "https://github.com/d2-ci/messaging-app#632212396dd5d58600748c95cbec6ae836b9837e",
    "https://github.com/d2-ci/pivot-tables-app#8afe54cc833370aa55f3bc14e3e82f4f6616fad0",
    "https://github.com/d2-ci/scheduler-app#8ac36309919f9cfd8bda5c2610c36802a3229f49",
    "https://github.com/d2-ci/settings-app#5f1b31099754395885c1adc650fbb3bd8eeae521",
    "https://github.com/d2-ci/tracker-capture-app#40717db9fbb6bdc9a006a148114fb764951a4e7c",
    "https://github.com/d2-ci/translations-app#5612f5392b1ae0134b0024604f0d33bf726a5e63",
    "https://github.com/d2-ci/usage-analytics-app#23effbc623c62c346dc75d18648162d788cea30d",
    "https://github.com/d2-ci/user-app#94d08dca9ab1dccb1f0dc031d5e3de79e17748f6",
    "https://github.com/d2-ci/user-profile-app#0671f19a4cedf95a19c873cc014f08af3d17f73f"
]
```

Each of the `refspec` points to the [d2-ci repo of the
application](https://github.com/d2-ci/data-quality-app) which stores all the
build artifacts for apps:

E.g. for the **Data Quality App** the build included is:
[https://github.com/d2-ci/data-quality-app/commits/3166be606054bb7f5a979c041048450d97e1e6fe](https://github.com/d2-ci/data-quality-app/commits/3166be606054bb7f5a979c041048450d97e1e6fe)

### What is the source commit for a given application build?

The `apps-bundle.json` file references the commit of the build artifact. This
is useful for referencing specific builds, but as a developer you might be more
interested in the source code commit from which the build was created.

Each application exposes a `BUILD_INFO` file which is available through the
module name.

The commit hash in `BUILD_INFO` points to the source repo in the DHIS2 organisation:

[https://github.com/dhis2/dashboards-app/commits/fb596620b6e5a6d5af730c793baffd423ecb23d8](https://github.com/dhis2/dashboards-app/commits/fb596620b6e5a6d5af730c793baffd423ecb23d8)

#### Example URL

[https://play.dhis2.org/dev/dhis-web-dashboard/BUILD_INFO](https://play.dhis2.org/dev/dhis-web-dashboard/BUILD_INFO)

#### Example `BUILD_INFO`

```
Fri Nov  9 23:19:00 UTC 2018
fb596620b6e5a6d5af730c793baffd423ecb23d8
```

## Create custom builds

To change which apps and respective versions for the apps a single file needs
to be modified in dhis2-core:

[https://github.com/dhis2/dhis2-core/blob/master/dhis-2/dhis-web/dhis-web-apps/apps-to-bundle.json](https://github.com/dhis2/dhis2-core/blob/master/dhis-2/dhis-web/dhis-web-apps/apps-to-bundle.json)

This is a JSON file which contains an array with Git repositories. The
build scripts for `dhis-web-apps` then use Git to clone the respective
element in the list.

The Git repos we use to bundle applications is a **build artifact repository**.
For every app repo on the [github.com/dhis2](https://github.com/dhis2) org, we
have a build repo on [github.com/d2-ci](https://github.com/d2-ci) to store the
build artifacts for each build (one per commit).

- [https://github.com/dhis2/maintenance-app](https://github.com/dhis2/maintenance-app)
- [https://github.com/d2-ci/maintenance-app](https://github.com/d2-ci/maintenance-app)

> N.B. `https://` is used for the apps to avoid the build environment
> having a git+ssh set up. If you know that you can clone from a `git://`
> URL then that is fine to use as well.

For each of the referenced Git URLs it is possible to specify what [tree-ish](https://mirrors.edge.kernel.org/pub/software/scm/git/docs/gitrevisions.html#_specifying_revisions)
should be used for the build. The syntax for that is:

```
<git url>#<treeish>
``` 

A treeish:

- Can be a commit: `5840ec14e92e5f1cf6d54136da114a8844fe6318`
- Or a branch: `v30`
- Or a tag: `2.31.1`

Some example use cases below:

### Replicate a specific build

Say that you are running **2.31.0** in production today, and you know that the
applications in that version are good. Then version **2.31.1** is released and the
pre-built WAR-file comes with application updates which you do not want. This
might be due to your test procedures of having to do a full regression test on
all updated applications.

So you decide that you want to keep the applications versions in their known
good state and see if you can update only the core from **2.31.0** to **2.31.1**.

First you download the
[https://play.dhis2.org/2.31.0/dhis-web-apps/apps-bundle.json](https://play.dhis2.org/2.31.0/dhis-web-apps/apps-bundle.json)
file, which includes the exact build artifact refspecs for the applications
which were bundled with the WAR-file when it was originally built.

Then checkout the branch for **2.31.1** in the `dhis2-core` repository and put
the contents of `apps-bundle.json` into `apps-to-bundle.json` in
`dhis2-core/dhis-2/dhis-web/dhis-web-apps` to bundle the specified application
build artifacts.

Execute the build and you will get a **2.31.1** build with the applications you
had in your **2.31.0** instance.

### Customize your build 

Remember the syntax outlined above: `<git url>#<treeish>`

Here is a deeper dive into how to use the part following the hash (`#`).

#### Default: use master branch

If the `#<treeish>` is left out, then the default behaviour is to fetch the
latest build from the `master` branch:

```
[
    "https://github.com/d2-ci/dashboards-app",
]
```

Append a `#master` to the app URL to do so explicitly.

```
[
    "https://github.com/d2-ci/dashboards-app#master",
]
```

#### Use arbitrary branches

To test the latest build from a branch append it to the URL after the hash
(`#`):

```
[
    "https://github.com/d2-ci/dashboards-app#v31",
]
```

This allows your build to track the latest build from a specific branch, and is
what we do for our development environments, for example. It is also handy when
you are working on a feature branch and want to be able to deploy it for
testing/verification/sharing, etc.

#### Lock to a specific commit

Sometimes there is a need to lock the core to track a specific commit, either
to reproduce a build or to lock the build to a known good commit while a broken
application is being fixed to stop the broken build from being put into a production build.

Any tree-ish will do after the hash (`#`), so a commit SHA is also fine:

```
[
    "https://github.com/d2-ci/dashboards-app#5afaf70e8b7e427bc064fa025610eea2c0e195e5",
]
```

#### Lock to a tag

A tag also works as a tree-ish, so the formal DHIS2 releases track an
application tag, so the **2.31.0** version would track the **2.31.1** tags of
the applications.

```
[
	"https://github.com/d2-ci/dashboards-app#2.31.1",
]
```

## Remarks

Ah, finally. The end. The most appreciated part of any article.

By now you should have an idea of how the build system operates and some tricks
you can pull off with it.

Want a minimal `dhis2-core` build? Remove all the apps from the
`apps-to-bundle.json` file!

Want to share a single app with a feature branch? Create a build with a single
app referencing that feature branch!

And so on.

As a final note, this build system is available for DHIS2 from **2.29** going
forward.

Hope this was helpful to read and reach out if you have any questions about it.
