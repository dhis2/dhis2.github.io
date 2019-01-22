---
title: Increasing the test coverage of our apps
layout: post
categories: [blog]
tags: [js, packages, test-coverage]
author: Mohammer5
---

## Why we're talking about this now

Refactoring code with poor test coverage is always difficult.
When I was starting to work with the code,
I quickly realised that many parts of our codebase are untested
and we do manual tests every time we change existing behavior only.

So I talked to the other developers starting a discussion about how we can improve
the current situation. We all agreed that tests are important
and that the cost of neglecting tests is higher than the cost
of writing tests, the following is a summary of what we came up with
and how we'll solve having more tests to increase our codebase quality.

## Add tests

Follwing the conventions we'll get towards a better test coverage
slowely without stopping implementing bugs/features.

**Each PR should contain a few tests when appropriate**<br>
This doesn't mean that a PR must include tests, but if adding
tests makes sense, it should contain tests.

**React (or other view) components don't need to be tested**<br>
Testing view components can take a lot of time, involves testing
the actual DOM structure which will make it a lot harder to change
existing code as it often means a complete rewrite of the test scenarios.
Testing components can be done by e2e tests, with cypress or 
should be done in component libraries

**Only write tests when it makes sense**<br>
Don't test everything just for the sake of having everything tested,
it'll make the code resistent to change  (thanks for pointing that out @varl).
Also adding a few tests when you encounter old code can be of use,
but you don't need to overdo it.

## Reviewing PRs

When you're reviewing a PR and you see that it doesn't add any tests whatsoever,
but you feel that it needs some, do not accept the PR.
Send it back and request a few tests, add a constructive comment and explain
what needs to be tested.
