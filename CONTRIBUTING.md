# Contribute to the Developer Portal

## Setup

### Install Ruby and Bundler

There are many ways to install Ruby on a system, but as we do not
generally use Ruby it might be preferred to not install it globally as
then all commands need to be run with `sudo`.

Instead it is recommended to install Ruby and Bundler in user-space. It
can be done manually or through a tool that sets it up in a virtual env:

- [rbenv](https://github.com/rbenv/rbenv)
- [RVM](https://github.com/rvm/rvm)

You should be able to run the commands:

```
ruby --version
ruby 2.6.3p62 (2019-04-16 revision 67580) [x86_64-linux]

bundle --version
Bundler version 1.17.2
```

Other Ruby and Bundler versions might work, however these are tried and true.

### NodeJS and NPM

NodeJS and NPM are not strictly required, they are just used as a
convenient way to remember the useful commands for working on the
Develop Portal.

If you are more comfortable with the raw Jekyll workflow, and have the
`d2-style` command available locally, feel free to forgo installing
Node and NPM and just refer to `package.json` to see what scripts are
defined to be able to run Jekyll locally, how to generate tags, and how
to format the code.

---

## Local preview

### NPM

The easiest is using the scripts defined in `package.json`:

- `npm install`
- `npm start`
- `npm run build`
- `npm run format`

`npm start` starts up the platform and serves it on http://localhost:4000. It
automatically rebuilds the site when a file changes, though a refresh in
the browser will need to be done manually.

Before committing, make sure to run `npm run build` and `npm run format`
to ensure that any new tags are generated and added to the site.

### Manually with Bundler/Ruby

- `bundle install`
- `bundle exec jekyll serve`

This will serve the platform on http://localhost:4000 as before. Now to
the tricker stuff before committing your work:

- Generate tags and build site:
  ```
  bundle exec jekyll build && \
  bundle exec ruby archive/_generator.rb && \
  bundle exec jekyll build
  ```
- Apply style format: `d2-style structured-text apply --pattern '**/*.{yaml,yml,md,markdown,json}'`

---

## Add yourself as an author

In `_data/members.yml` add a corresponding section for yourself:

```
{shortname}:
  name: {full name}
  github: {github username}
  blurb: {a blurb about yourself, e.g. title or responsibilities}
```

E.g.

```
jane:
  name: Jane Doe
  github: janedoe
  blurb: Master & Commander
```

The `{shortname}` will be used as a reference in the frontmatter for a
post to pull out the information and fill out the "about the author"
section.

This is the one-time setup that is required to work with the Developer
Portal, now you can proceed to produce content.

---

## Producing content

### Writing a Post

Create a new file under `_posts/` with a filename with the format:
`{yyyy-mm-dd}-{title}`. All lowercase. The title is not going to be
rendered, though the convention makes it easier to find the right post.

Some examples:

```
_posts/2018-10-19-dhis2-developer-portal.md
_posts/2018-10-29-build-repos-migrated-to-d2-ci.md
_posts/2018-12-07-packages-and-conventions.md
_posts/2019-02-24-the-build-system.md
```

Next up is adding frontmatter to your post, this is metadata that is
used by the platform to add additional information about your post in a
decoupled way.

Everything at the top of the file between the triple dashes `---` is
considered frontmatter and will not be rendered as part of of the
article.

```
---
title: {title of article}
layout: {layout to use when rendering}
categories: [{list of categories}]
tags: [{list of tags}]
authors: [{list of authors' shortnames}]
---
```

A full example of the most common frontmatter you will want to use for a
post:

```
---
title: Title of the Post
layout: post
categories: [blog]
tags: [first tag, second tag]
authors: [janedoe]
---
```

The first paragraph is used as an excerpt (see the main page for an
example), so use that paragraph to provide an overview of what the post
is about.

Then you may use heading levels 1-6 to organise your thoughts. After a
major section closes you may want to use a horizontal break (`---`) to
signify to the user that she is about to jump to the next section.

```
This a quick introduction to the post, and will be used as the excerpt.

# Section 1

The first large section in the post.

---

# Section 2

Second large section.
```

That should cover the basics. Check out some of the other posts for
more.
