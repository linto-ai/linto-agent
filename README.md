# LinTO-Agent

## Platform
LinTO-Agent contain all tools allowing to play with LinTO
- linto-admin : central manager for a given fleet of LinTO clients
- business-logic-server : deploy and executes a linto workflow
- overwatch : handle the authentification and loging aspect of a linto fleet
- service-broker : the communication pipeline between services and subservices
- stt-service-manager : deploy speech to text service

## Setup

LinTO Agent is meant to get deployed on a Docker Swarm cluster. Please read thouroughly the [infrastructure setup guide](https://doc.linto.ai/) and the following documentation located on `stack/docs/README.md` BEFORE you run the startup script.