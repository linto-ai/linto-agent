# Linto-platform-stack

A LinTO Platform Server stack is composed of the following services :

-  __Admin__ is a web interface used for monitoring a fleet of LinTO's devices, deployed on a technical scope.
- __Business-Logic-Server__ called also *BLS*, it's a workflow manager allowing to edit any LinTO process.
- __MQTT-Broker__, used to communicate between LinTo-Client and LinTO-Platform by using the publish/subscribe method.
- __NLU__, based on *Tock*, it's a toolkit used for : detecting intention, building conversational agents.
- __Overwatch__ listen and update LinTO-Admin database for any status change 
- __STT__ this is the speech recognition toolkit that converts the voice into a sequence of words

You'll find here a docker-compose file per service wrapped-up in their corresponding folder
- admin/docker-compose.yml
- business-logic-server/docker-compose.yml
- mqtt-broker/docker-compose.yml
- nlu/docker-compose.yml
- overwatch/docker-compose.yml
- stt/docker-compose.yml

## Usage

First of all, create an attachable network which will enables inter-services communication

`linto_network=linto_net docker network create --attachable $linto_network`
`docker network create --attachable linto_net`

Then the second step is to build all by the following command.
`docker-compose up -f service_name ...`

We provides all data about the .env file to a specific setup.

## How does this work ?

Docker network provides resolution of domain names for each service. You will be able to get acces to the platform by using the acces defined in the nginx.
