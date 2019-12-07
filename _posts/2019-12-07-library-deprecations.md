---
title: Web Application Library deprecations
categories: [news]
tags: [deprecation, libraries, webapp]
author: varl
---

2019 has been a year where we have established a strong direction with
the App Platform which is an umbrella term for all the parts of a DHIS2
Web App and as a result, it is time to deprecate a few libraries.

This does not mean that they will cease to work right now, nor that they
should _immediately_ be replaced everywhere. Consider it simply as
guidance to what libraries you are discouraged from using in new
applications.

Unless, of course, there is good reason to use them, e.g. a component
you must have is missing in the replacement.

# Replace before 2.34

-   [core-resource-app](https://github.com/dhis2/core-resource-app) is a
    "poor man's CDN" that worked for a long time, but is fundamentally
    incompatible with the way we want to develop distinct isolated web
    apps. It adds quite a bit of bloat to the WAR-file and will be
    removed in 2.34.

-   [d2-manifest](https://github.com/dhis2/d2-manifest) generates a
    `manifest.webapp` which is quite confusing, as the standard
    `d2-manifest` uses is the Open Web App standard currently only
    supported by Firefox OS.

    It predates the W3c Progressive Web App standard, and that is why
    DHIS2 historically implemented the OWA standard and not the PWA
    manifest standard.

    We are moving to the W3c manifest standard though, so that should be
    used going forward.

# Not actively developed

While we are not actively developing these libraries, they are in use by
our applications and as such we provide some bug fixes.

-   [d2-ui](https://github.com/dhis2/d2-ui) is being replaced by new user
    interface libraries ([ui-core](https://github.com/dhis2/ui-core) and
    [ui-widgets](https://github.com/dhis2/ui-widgets)). Please refer to
    those.

-   [d2-i18n-generate](https://github.com/dhis2/d2-i18n-generate) and
    [d2-i18n-extract](https://github.com/dhis2/d2-i18n-extract) are a
    part of the way we do internationalisation, and while these are in
    use, we want to provide this out of the box in the [App
    Platform](https://github.com/dhis2/app-platform) instead of as
    distinct libraries.

-   [d2-charts-api](https://github.com/dhis2/d2-charts-api) and
    [d2-analysis](https://github.com/dhis2/d2-analysis) has been
    superseded by [analytics](https://github.com/dhis2/analytics).

# Development entirely ceased

-   [cli-packages](https://github.com/dhis2/cli-packages) has been
    thoroughly been replaced by using Yarn Workspaces and being strict
    about single-entry point libraries.

-   [d2-i18n-monitor](https://github.com/dhis2/d2-i18n-monitor) a
    stand-alone site for monitoring the translation status of our apps.
    This has been superseded by [Transifex](https://transifex.com).
