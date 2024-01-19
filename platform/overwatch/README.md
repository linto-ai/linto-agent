# LinTO-Platform-Overwatch

This service is mandatory in a complete LinTO platform stack.
These covered process are :
- MQTT global subscriber for a fleet of LinTO clients
- Register every events in a persistent storage
- Enable different authentication system

## Usage
See documentation : [doc.linto.ai](https://doc.linto.ai)

## API
Overwatch API has the following feature
- Customizable api base path (setting the environment variable : `LINTO_STACK_OVERWATCH_BASE_PATH`)
- Authentication module can be enable or disable (environement `LINTO_STACK_OVERWATCH_AUTH_TYPE`, note that only local authentication method is supported for the moment)

More information about there API can be found :

**Default API** :
- [Overwatch API](doc/api/default.md)

**Authentication APIC**:
- [Local](doc/api/auth/local.md)

# Deploy

With our proposed stack [linto-platform-stack](https://github.com/linto-ai/linto-platform-stack)

# Develop

## Getting Started
These instructions will get you a copy of the project up and running on your local machine for development. Thise module require at least for working :
* Mqtt server
* Mongodb

Nodejs shall be installed `sudo apt-get install nodejs`, also npm shall be installed `sudo apt-get install npm`

## Install project
```
git clone https://github.com/linto-ai/linto-platform-overwatch.git
cd linto-platform-overwatch
npm install
```

### Configuration environement
`cp .envdefault .env`
Then update the `.env` to manage your personal configuration

### Run project
Normal : `npm run start`
Debug : `DEBUG=* npm run start`

# Docker
## Install Docker
You will need to have Docker installed on your machine. If they are already installed, you can skip this part.
Otherwise, you can install them referring to [https://docs.docker.com/engine/installation/](https://docs.docker.com/engine/installation/ "Install Docker")

## Build
Next step is to build the docker image with the following command `docker build -t linto-overwatch .`
Then you just need to run bls image`docker run -d -it linto-overwatch`

## Stack
You will find the full process to deploy the LinTO platform here : [LinTO-Platform-Stack](https://github.com/linto-ai/linto-platform-stack) or on the website [doc.linto.ai](https://doc.linto.ai/#/services/nlu?id=installation)