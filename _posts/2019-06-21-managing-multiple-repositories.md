---
title: Manage a plethora of repositories
layout: post
categories: [blog]
author: varl
---

As a developer you operate on many repositories. To keep all of the
repositories up-to-date there are as many strategies as there are
developers. Personally I have gone from doing it manually, to writing
scripts, trying different tools, and the latter is what this post is
about.

## Enter, stage left: _myrepos_

[myrepos](https://myrepos.branchable.com/) is a command-line tool which
adds the `mr` command to your environment. `mr` does not care about
different version control systems, it supports all of them.

The standard way to use `mr` is to go into each one of your repositories
and run the command `mr register` for `mr` to add it to your
configuration file in `~/.mrconfig`.

This is a bit tedious, though it can easily be automated. After all the
repositories have been registered with `mr`, then it can pull off its
party tricks. :tada:

## Find-up logic out of the box
            
If a command, for example `mr nuke` is run in e.g. `~/dev/dhis2/apps`,
then `mr` only runs it on the registered repositories in that folder.

If it is run in a specific repo, e.g.
`~/dev/dhis2/apps/usage-analytics`, then it only runs the `nuke` command
in that single repo.

If the command is run on a higher level, e.g. in `~/dev/dhis2` then the
command applies to all registered repositories in `dhis2/`. So it is
possible to manage all of your repositories using a single configuration
file, both personal and work related, simply by running your commands in
the relevant directory.

## Standard operation

The primary commands you will want to use are:

- `mr checkout` clones any repositories which don't already exist
- `mr update` updates all the repositories
- `mr push` pushes all the repositories to remote
- `mr status` shows you the status of each repo; handy to figure out if
  any repos have pending changes
- `mr diff` shows you the diffs from all repos

## Custom operation

This is where the tool starts to shine, not only is this a full-featured
repository manager; it also gives you tools to do batch operations
across multiple repositories.

To save on space I have a `mr nuke` command set up which removes the
`node_modules` from all repositories:

```
[DEFAULT]
nuke = if [ -d ./node_modules ]; then rm -rf ./node_modules; else echo "Skipping ... No node_modules/"; fi
```

Custom commands under the `[DEFAULT]` section only apply to the
repositories which are _under_ that section. This is why it is placed at
the very top of the `.mrconfig` file.

It is easy to extend this to e.g. run `yarn install` in all
repositories. Or, generate bundle reports of all the apps using
[`source-map-explorer`](https://github.com/danvk/source-map-explorer):

```
report =
    yarn
    GENERATE_SOURCEMAP=true yarn build
    source-map-explorer build/**/*.js --html "${HOME}/tmp/$(basename $(pwd))-$(git rev-parse --short HEAD).html"
```

It is possible to teach `mr` a lot of tricks, some handier than others,
for example [figuring out the merge-base for different branches](/guides/git-workflow):

```
octo = git checkout $(git merge-base --octopus $(for b in "$@"; do echo "origin/${b}"; done))
```

Which can be used as: `mr octo master v32` and it will give you the
merge-base between `origin/master` and `origin/v32`.

## Future work

At some point it might make sense to integrate this type of
functionality into `d2`, but for now, `mr` is a very handy tool for
developers who have to deal with multiple repositories.

## Sharable configuration

This is my full configuration at the time of writing.

<script src="https://gist.github.com/varl/4a853e6394ad2ebcf4a77c5ea0ff623a.js"></script>

Do you have any useful ideas for a command? Please comment on the Gist. :kissing_heart:

Go forth and clone all the things!
