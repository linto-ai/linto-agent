# Linto-platform-stack

A LinTO Platform Server stack is composed of the following services :

-  __Admin__ is a web interface used for monitoring a fleet of LinTO's devices, deployed on a technical scope.
- __Business-Logic-Server__ called also *BLS*, it's a workflow manager allowing to edit any LinTO process.
- __MQTT-Broker__, used to communicate between LinTo-Client and LinTO-Platform by using the publish/subscribe method.
- __NLU__, based on *Tock*, it's a toolkit used for : detecting intention, building conversational agents.
- __Overwatch__ listen and update LinTO-Admin database for any status change 
- __STT__ this is the speech recognition toolkit that converts the voice into a sequence of words

You'll find here a docker-compose file per service wrapped-up in their corresponding folder
- nginx-ingress/docker-compose.yml
- admin/docker-compose.yml
- business-logic-server/docker-compose.yml
- mqtt-broker/docker-compose.yml
- nlu/docker-compose.yml
- overwatch/docker-compose.yml
- stt-*/docker-compose.yml

## Getting started

### Install Docker and Docker Compose

You will need to have Docker and Docker Compose installed on your machine. If they are already installed, you can skip this part.
Otherwise, you can install them referring to [https://docs.docker.com/engine/installation/](https://docs.docker.com/engine/installation/ "Install Docker"), and to [https://docs.docker.com/compose/install/](https://docs.docker.com/compose/install/ "Install Docker Compose").

## ENV
WIP: TODO CONFIG ENV (can found data on each github repository)

## RELEASE MODEL STT
LinSTT Model can be found here : [https://github.com/linto-ai/linto-platform-stt-server-worker-client/releases](https://github.com/linto-ai/linto-platform-stt-server-worker-client/releases). This will contain an empty model that can be populate. You can check the [documentation](https://github.com/linto-ai/linto-platform-stt-server-worker-client) or deploy the swagger for API description.

Last step is to unzip the model in the models unzip.

Default name :
 * `en` : English model
 * `fr` : French model
Path can be check on the main .env.

## Usage

First of all, create an attachable network which will enables inter-services communication

`linto_network=linto_net docker network create --attachable $linto_network`
`docker network create --attachable linto_net`

Then the second step is to run all by the following command depend on which LinSTT you want

LinSTT with the generation of model and transcription
```shell
docker-compose \
-f nginx-ingress/docker-compose.yml \
-f tock/docker-compose.yml \
-f admin/docker-compose.yml \
-f business-logic-server/docker-compose.yml \
-f mqtt-broker/docker-compose.yml \
-f overwatch/docker-compose.yml \
-f stt-server-worker-client/fr/docker-compose.yml \
-f stt-server-worker-client/en/docker-compose.yml \
-f haproxy/docker-compose.yml up -d
```

LinSTT with only the transcription

```shell
docker-compose \
-f nginx-ingress/docker-compose.yml \
-f tock/docker-compose.yml \
-f admin/docker-compose.yml \
-f business-logic-server/docker-compose.yml \
-f mqtt-broker/docker-compose.yml \
-f overwatch/docker-compose.yml \
-f stt-standalone-worker/docker-compose.yml up
```

We provides all data about the .env file to your specific setup.

## How does this work ?

Docker network provides resolution of domain names for each service. You will be able to get acces to the platform by using the acces defined in the nginx.
