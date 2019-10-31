---
title: DHIS2 with Docker
layout: post
categories: [blog, Docker]
author: gintare
---

# DHIS2 with Docker
The DHIS2 Core Team uses Docker to make development and testing efforts easier every day! It allows us to spin up various environments with any DHIS2 version, numerous tomcat versions and different components, such as Redis, NGINX, in no time. Because we wanted to share Docker with community, we made publishing Docker images a part of our delivery pipeline. This guide aims to provide some guidelines on how to use Docker to quickly set up DHIS2. 

## Prerequisites
This guide is aimed at people with at least minimal knowledge about Docker. If you don't know too much about Docker just yet, but think that it might be useful to you, I encourage you to take a look at resources listed in [resources](#Resources) section. 

In addition to minimal Docker-knowledge, you will need: 
- Docker downloaded and installed on your machine. 
- Docker-compose downloaded and installed on your machine. 

## Introduction

### Vocabulary
*Image* - a template that contains the application and all the dependencies that are required to run that application. 
*Container* - a running instance of Docker image. 
*Dockerfile* - text file, with lines and instructions on how to build the Docker image. 

### Docker Hub

Docker Hub is the official cloud-based repository where Docker users store and distribute their images. DHIS2 has its organization on [Docker Hub](https://hub.Docker.com/u/dhis2/). At the time of writing this guide, we have 4  **active** repositories: base-dev, base, core-dev, core.

#### Repositories
Sometimes we categorize repositories in _channels_ and say that we have 2 image channels: _dev_ and _stable_. 
##### dev
Repositories suffixed with `-dev` contains images for _latest_ DHIS2 versions. That means, that we can't fully guarantee its quality and we recommend to use it only for testing purposes. Also, for curious souls, wanting to peek into the latest DHIS2 development efforts. The `-dev` repositories are ideologically the same as `dev` demo instances on [_play_](https://play.dhis2.org/dev). Images in this channel will be overwritten multiple times a day. 

##### stable
Repositories **not** suffixed by `dev` contains images for **stable** and **released** DHIS2 versions. These images represent the stable dhis2 versions, meaning it won't t be rebuilt in the future. 

##### core
Core repositories (core, core-dev) contains tomcat images that already have DHIS2 war baked-in.  That means, that starting this image will result in a running DHIS2 instance. 

##### base
Base repositories (base, base-dev) contains only DHIS2 war. Starting this image will not result in a running DHIS2 instance. 

#### Versioning and tags
Docker tags are meant to convey useful information about a specific version/variant of the image. In DHIS2 repositories, we combine DHIS2 and tomcat versions with image variants into a tag to be as transparent as possible about what you will find in the image.

`tag = dhis2 version + image variant`

##### DHIS2 versions
*dev* channels images are versioned the same way we version branches in GitHub: 
- `master` tag will correspond to the latest *major* DHIS2 version being developed. At the time of writing this guide, the last version we released is 2.33, which means that we are currently working on the 2.34 version and that's what the version image `dhis2/core-dev:master` will contain. 
- `2.31` to `2.33` tags will have the war of the latest *minor* dhis2 version. So, if we released 5 patches for 2.31 version in total, we are working on the 6th patch and that will be represented by `dhis2/core-dev:2.31` tag. 

Versioning of *stable* images corresponds to the versioning scheme we use for DHIS2 releases and you might be already familiar with it. Examples: `2.31.5`, `2.32.1`, `2.33.0`and etc. 


##### Image variants
This part tells what is the image based on and what environment DHIS2 will be running in. At the time of writing this guide, we create the following image variants: 

Debian: 
- `tomcat-9.0-jdk8-openjdk-slim`
- `tomcat-8.5-jdk8-openjdk-slim`
- `tomcat-8.5.46-jdk8-openjdk-slim`
- `tomcat-8.0-jre8-slim`

Alpine: 
-  `tomcat-8.5.34-jre8-alpine`

For more information, see [notes for versioning schemes](https://github.com/dhis2/notes/blob/master/decisions/2019/05/25-war-docker-schemes.md).

#### Pulling images
When you decide which DHIS2 version and image variant you are interested in, here's how you can pull it from Docker hub: 

- `Docker pull dhis2/core-dev:master-tomcat-9.0-jdk8-openjdk-slim` - this command will pull the image from `core-dev` repository. The image has the DHIS2 war build from the `master` branch. The image is built on top of ```tomcat-9.0-jdk8-openjdk-slim``` base image. 

- `Docker pull dhis2/core:2.32.2-tomcat-8.5.34-jre8-alpine` - this command will pull the image from `core` repository. The image has DHIS2 version 2.32.2 and is based on `tomcat-8.5.34-jre8-alpine` tomcat image. 

If you don't care about image variant, you can use default one and pull the image like this: 
- ```Docker pull dhis2/core:2.31.6 ``` - this will pull the image with DHIS2 version 2.31.6. Before 2.33, the default image was based on `tomcat-8.5.34-jre8-alpine`, but we decided that `8.5-jdk8-openjdk-slim` will suite us better. Note, that you should use this option only when you don't care about the tomcat version, java environment or OS variant. If you want more control, use the explicit image variants. 
 
## How-To's 
Now that you know how to find the images you are looking for, we can go through the basic use cases you might have for DHIS2. If you have another use case that is not covered by this guide, let us know in the [CoP](https://community.dhis2.org/). We will use [Docker-compose](https://docs.Docker.com/compose/) to simplify the process. 

### DHIS2 Docker instance
DHIS2 instance running inside Docker container is not different from traditionally set up DHIS2 instance. The basic requirement for the instance is dhis.conf file where you define your database configuration and additional DHIS2 properties.   To successfully run DHIS2 instance inside Docker you will need to attach this file as a volume to /DHIS2_home directory inside the Docker container. Here's the Docker command to achieve that: 

`Docker run -v $pathToYourDhisConf:/DHIS2_home/dhis.conf dhis2/core:2.32.0`

$pathToYourDhisConf should be a relative path of dhis.conf file in the machine you are running Docker on. 

### DHIS2 with empty postgres database using Docker-compose
Here's an example `Docker-compose.yml` file which will help you to run both DHIS2 and postgres database instances inside separate Docker containers in no time. 

    version: '3'  
	  services:  
	    db:  
	      image: mdillon/postgis:10-alpine  
		  command: postgres -c max_locks_per_transaction=100  
		  environment:  
	        POSTGRES_USER: dhis  
            POSTGRES_DB: dhis2  
            POSTGRES_PASSWORD: dhis  
        web:  
          image: dhis2/core:2.33.0  
		  volumes:  
		    - ./config/dhis2_home/dhis.conf:/DHIS2_home/dhis.conf  
	      ports:  
		    - "8080:8080"
		  depends_on: 
		    - db

Make sure, that your dhis.conf then includes the following properties: 

    connection.dialect = org.hibernate.dialect.PostgreSQLDialect  
	connection.driver_class = org.postgresql.Driver  
	
	# "db" maps to service name defined in Docker-compose
	# "dhis2" maps to POSTGRES_DB defined in Docker-compose
	connection.url = jdbc:postgresql://db/dhis2 
	
	# maps to POSTGRES_USER environment variable in Docker-compose.
	connection.username = dhis 
	
	# maps to POSTGRES_PASSWORD environment variable in Docker-compose.
	connection.password = dhis 


To run this file with Docker compose, execute the following command: 
`Docker-compose -f /pathToDockerComposeFile up`

or, if the file is on your current directory: 
`Docker-compose up`

**Outcome**: Docker-compose will start 2 containers for you, db and web and when tomcat fully starts up, you will be able to reach DHIS2 at http://localhost:8080. The database will be empty, so you will have a clean DHIS2 instance. 

To destroy the instance, run `Docker-compose down`. 
### DHIS2 with pre-populated postgres database using Docker-compose

To achieve this, you will need an SQL file with the schema and data you want to pre-populate postgres with. You will attach that file to postgres container as a volume. Here's an example of the `Docker-compose.yml` file. 

    version: '3'  
	  services:  
	    db:  
	      image: mdillon/postgis:10-alpine  
		  command: postgres -c max_locks_per_transaction=100  
		  environment:  
	        POSTGRES_USER: dhis  
            POSTGRES_DB: dhis2  
            POSTGRES_PASSWORD: dhis
          volumes:
            - ./config/init.sql:/Docker-entrypoint-initdb.d/init.sql
        web:  
          image: dhis2/core:2.33.0  
		  volumes:  
		    - ./config/dhis2_home/dhis.conf:/DHIS2_home/dhis.conf
		  environment:
		    - WAIT_FOR_DB_CONTAINER=db:5432 -t 0
	      ports:  
		    - "8080:8080"
		  depends_on: 
		    - db

You probably noticed, that most of the file is the same as in the previous step, but we added _volumes_ and _environment_ properties for _db_ and _web_ containers. 

Attaching the SQL file to the _db_ container will tell postgres to pre-populate db before starting the container. Depending on the file size, postgres might take a while to do this and we might run into race conditions when DHIS2 starts earlier than postgres and fails to connect. To solve this, we tell the _web_  container that it has to wait for postgres to finish before starting. We do this by using the WAIT_FOR_DB_CONTAINER environment variable.  
You will notice the -t  option. The -t option stands for  _timeout_. 0  means that _web_ container will wait as long as it takes for _db_ container to become ready, but you can set any timeout (in seconds) you want.  

Note, that you still need to configure connection properties in dhis.conf: 

    connection.dialect = org.hibernate.dialect.PostgreSQLDialect  
	connection.driver_class = org.postgresql.Driver  
	
	# "db" maps to service name defined in Docker-compose
	# "dhis2" maps to POSTGRES_DB defined in Docker-compose
	connection.url = jdbc:postgresql://db/dhis2 
	
	# maps to POSTGRES_USER environment variable in Docker-compose.
	connection.username = dhis 
	
	# maps to POSTGRES_PASSWORD environment variable in Docker-compose.
	connection.password = dhis 


To run this file with Docker compose, execute the following command: 
`Docker-compose -f /pathToDockerComposeFile up`

or, if the file is on your current directory: 
`Docker-compose up`

**Outcome**: Docker-compose will start 2 containers: _db_ and _web_ and when tomcat fully starts up, you will be able to reach DHIS2 at http://localhost:8080. The database will be pre-populated. 

To destroy the instance, run `Docker-compose down`. 


## Q&A 
Q:  **How can I use your Docker images in production?** 
A: We can't recommend using Docker in production yet. We know that there are implementations that runs DHIS2 in Docker successfully, but we can't recommend doing so just yet. If you decide to go for it, make sure you perform enough security, performance and stress tests. 

Q: **How can I contribute?** 
A: Great question! We value all contributions and we want to have as many as possible! Firstly, you can contribute by testing our images and raising feature requests as well as bugs. You have ideas on how to make images more secure, performant or functional? We want to hear it! If you are using your own Docker images, give our images a try and tell us how can we improve. We also accept code contributions. Docker stuff is located in [dhis2-core](https://github.com/dhis2/dhis2-core) git repository. 

Q: **Can I use this with d2 CLI?** 
A: Of course! D2 cluster supports --image flag, which allows you to do just that. 

Example: 
`d2 cluster up myimage --image dhis2/core:2.32.2-tomcat-8.5.34-jre8-alpine`

More information on [d2 cli README page](https://github.com/dhis2/cli/tree/master/packages/cluster).


## Resources: 

- [https://docker.com: Official Docker webpage](https://Docker.com)
- [https://github.com/dhis2/docker-compose](https://github.com/dhis2/docker-compose)

Great hands-on resources to help you to become true Dockerist! 

- [https://docs.docker.com/get-started/](https://docs.Docker.com/get-started/)

- [https://docker-curriculum.com/](https://Docker-curriculum.com/)

- [https://www.freecodecamp.org/news/docker-simplified-96639a35ff36/](https://www.freecodecamp.org/news/docker-simplified-96639a35ff36/)

- [https://github.com/docker/labs](https://github.com/docker/labs)