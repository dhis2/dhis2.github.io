# DHIS2 Developer Portal

See [dhis2.github.io](https://dhis2.github.io)

## Local Development

THe DHIS2 Developer Portal is a static site built with [jekyll](https://jekyllrb.com/) and served on [GitHub Pages](https://pages.github.com/)

### Prerequisites

Ruby must be installed locally ([rbenv](https://github.com/rbenv/rbenv) is recommended, `brew install rbenv && echo 'eval "$(rbenv init -)"' >> ~/.bash_profile && source ~/.bash_profile` on mac)

### Installation

```sh
> git clone https://github.com/dhis2/dhis2.github.io.git
> cd dhis2.github.io
> gem install bundler jekyll
> bundle install
> bundle exec jekyll serve
Configuration file: /Users/me/dhis2.github.io/_config.yml
            Source: /Users/me/dhis2.github.io
       Destination: /Users/me/dhis2.github.io/_site
 Incremental build: disabled. Enable with --incremental
      Generating...
       Jekyll Feed: Generating feed for posts
                    done in 1.975 seconds.
 Auto-regeneration: enabled for '/Users/me/dhis2.github.io'
    Server address: http://127.0.0.1:4000/
  Server running... press ctrl-c to stop.
```

### Writing a Post

Post files are located in the `_posts` directory with the following filename format: `YEAR-MONTH-DAY-title.md`, for example `2019-02-13-my-new-post.md`. See [the jekyll docs](https://jekyllrb.com/docs/posts/) for more information.

You can also add work-in-progress posts to the `_drafts` folder (as `_drafts/my-new-post.md`) and then run `bundle exec jekyll serve --drafts` to view them locally.
