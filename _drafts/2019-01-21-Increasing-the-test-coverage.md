---
title: Increasing the test coverage of our apps
layout: post
categories: [blog]
tags: [js, packages, code-style, test-coverage]
author: Mohammer5
---

Refactoring code with poor test coverage is always difficult.
The front end apps have a few tests in place but by far not enough,
so we'll need to do something about it.

We talked about this on the 17th Jan 2019 on in the #team-apps Slack channel
and this is a summary on what we agreed.

## Add tests

We agreed on the following things:

* Each PR should contain a few tests when appropriate
* React (or other view) components don't need to be tested
  * This can be done by e2e tests, with cypress or should be done in component libraries

Ideally you'll add tests that make sense, don't test everything just for the sake
of having everything tested, it'll make the code resilient to change 
(thanks for pointing that out @varl).<br>
Also adding a few tests when you encounter old code can be of use,
but like I said, you don't need to overdo it.

This way we'll get towards a better test coverage slowely without stopping
implementing bugs/features.

## Reviewing PRs

When you're reviewing a PR and you see that it doesn't add any tests whatsoever,
but you feel that it needs some, do not accept the PR.<br>
Send it back and request a few tests, add a constructive comment and explain
what needs to be tested.
