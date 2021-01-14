---
title: Spin up a DHIS2 local instance
category: guide
layout: page
---

This is a quick guide on how to easily create a DHIS2 instance on your local machine and setup the DHIS2 CLI.

> These steps will help you quickly spin up a server and get you started with DHIS2 application development!

## 1. Installation

First, make sure to install the following 👇

-   Install [yarn](https://classic.yarnpkg.com/en/docs/install/){:target="\_blank"} and [Node.js](https://nodejs.org/en/){:target="\_blank"}
-   Download [Docker](https://www.docker.com/){:target="\_blank"}
-   Install the DHIS2 [CLI](https://cli.dhis2.nu/#/getting-started){:target="\_blank"} globally:

```
yarn global add @dhis2/cli
```

-   Check the `d2` command-line tool with `d2 --help` for more information on available commands.

## 2. Run d2 cluster

-   The [d2 cluster](https://cli.dhis2.nu/#/commands/d2-cluster){:target="\_blank"} command will allow you to launch a new cluster and create a DHIS2 instance using Docker containers. In your terminal, run the following:

```
d2 cluster up <name>

# or:

d2 cluster up 2.35.0 --db-vesion 2.35 —-seed

# this will populate a database with sample data
```

-   You can check your newly created cluster that's running locally with `d2 cluster list` as the example below:

![Cluster List](/assets/images/cluster-list.png)

> If you want to test against different DHIS2 and database versions or build your own custom DHIS2 Docker image, please refer to the [DHIS2 CLI](https://cli.dhis2.nu/#/commands/d2-cluster){:target="\_blank"} docs.

-   For more d2 cluster commands, run `d2 cluster --help`.

-   Finally, go to [http://localhost:8080/](http://localhost:8080/){:target="\_blank"} and login to your instance:

```
username: admin
password: district
```

### Congratulations! Now you're all set! 🎊

---

> Follow this simple guide for creating a DHIS2 application from scratch using DHIS2 App Platform.
