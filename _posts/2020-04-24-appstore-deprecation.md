---
title: App Store has been renamed to App Hub
layout: post
categories: [blog]
tags: [app hub]
authors: [birk]
---

The App Store has been renamed to **App Hub** and moved to a new URL: [https://apps.dhis2.org](https://apps.dhis2.org). We've also made some changes that you as an app-developer (and consumer!) should be aware of.


We've had a longstanding goal of decoupling apps from DHIS2 core and moving towards continuous delivery of apps. 
In light of this, we've rewritten the backend from scratch to improve the maintenability and ease of adding new features. This is a big step towards that goal.

### Why the name change?

*App Store* is simply not the most descriptive name for the service. It's not a *store* as there is no way of paying for anything - everything is open source and free. Additonally, we don't want the name to be confused with other App Stores out there. There's also been some concerns of trademark ingringement as Apple has a [history](https://en.wikipedia.org/wiki/App_store#%22App_Store%22_trademark) of suing companies that use their trademarks.
We hope that the new name is clear and will stick in the community.


### Why do I need to care?

[**App Hub**](https://apps.dhis2.org) is now the default repository for DHIS2 versions **2.34 and above**.
All approved apps and their users in the App Store has been moved to the new App Hub so in theory you shouldn't have to do anything. Having said that, software always comes with bugs - so we will keep the App Store running during a transition period before we plan on redirecting all traffic to the App Hub. Just be aware that DHIS 2 versions **2.33 and below** will still use the old App Store by default, so if you notice that a particular app on App Hub is missing in *App Management* that is probably why.

### New features?

While we don't have many new features yet, we do have one new notable feature: organisation memberships. Previously only the user that uploaded an app had access to it, and anyone could upload apps to any organisation (it was actually just a string). Now you can create an organisation that can have multiple users. All users in an organisation have access to all apps in that organisation. Note that the `Developer email`-address will also be added to the organisation of the uploaded app. All users that previously had an approved app in an organisation should have access to all apps with that organisation name.

Please reach out if you find any bugs or don't have access to your apps!