# linto-platform-admin

## Description
This web interface is used as a central manager for a given fleet of LinTO clients (voice-enabled apps or devices)

You might :
- Create a "room context" (node-red workflow paired with a specific LinTO device)
- Create, edit, mock and template workflows for later usage
- Create an "application context" (node-red workflow paired with a dynamic number of connected LinTO clients)
- Install or uninstall LinTO skills (node-red nodes)
- Monitor LinTO clients (client devices or client applications)
- Edit/train a NLU model (natural language understanding)
- And many more

## Usage

See documentation : [https://doc.linto.ai](https://doc.linto.ai)

# Deploy

With our proposed stack [https://github.com/linto-ai/linto-platform-stack](https://github.com/linto-ai/linto-platform-stack)

# Develop

## Prerequisites
To lauch the application, you'll have to launch associated services :
- redis-server : [Installation guide](https://www.npmjs.com/package/redis-server)
- mongodb [installation guide](https://www.npmjs.com/package/mongodb)
- linto-platform-business-logic-server : [Documentation](https://github.com/linto-ai/linto-platform-business-logic-server)
- linto-platform-logic-mqtt-server : [LINK]
- linto-platform-nlu : [LINK]
- linto-platform-overwatch : [LINK]

## Download and setup

#### Download git repository
```
cd YOUR/PROJECT/PATH/
git clone git@github.com:linto-ai/linto-platform-admin.git
cd linto-platform-admin
```

#### Setup packages/depencies
```
cd /webserver
npm install
cd ../vue_app
npm install
```

## Front-end settings
You will need to set some environment variables to connect services like "Business Logic Server", "NLU/Tock"

### Set front-end variables
Go to the **/vue_app** folder and edit the following files: `.env.devlopment`, `.env.production`

- `.env.devlopment` : if you want to set custom port or url, replace **VUE_APP_URL** and **VUE_APP_NLU_URL** values
```
(example)
VUE_APP_URL=http://localhost:9000
VUE_APP_NLU_URL=http://my-nlu-service.local
```
- `.env.production` : set your "application url" and "Tock interface url" for production mode 
```
(example)
VUE_APP_URL=http://my-linto-platform-admin.com
VUE_APP_NLU_URL=http://my-nlu-service.com
```

## Back-end and services settings

### Set global and webserver variables
Go to the **/webserver** folder, you'll see a `.env_default` file.
Rename this file as `.env` and edit the environment variables.

```
cd YOUR/PROJECT/PATH/linto-platform-admin/webserver
cp .env_default .env
```

#### Server settings

- If you want to start linto-platform-admin as a stand-alone service: *Edit **/webserver/.env***
- If you want to start linto-platform-admin with docker swarm mode: *Edit **/.docker_env***

| Env variable| Description | example |
|:---|:---|:---|
| TZ | Time-zone value | Europe/Paris |
| LINTO_STACK_DOMAIN | Linto admin host/url | localhost:9000, http://my-linto_admin.com |
| LINTO_STACK_ADMIN_HTTP_PORT | linto admin port | 9000 |
|LINTO_STACK_ADMIN_COOKIE_SECRET | linto admin cookie secret phrase | mysecretcookie | 
| LINTO_STACK_ADMIN_API_WHITELIST_DOMAINS | CORS auhtorized domains list (separator ',') | http://localhost:10000,http://my-domain.com |
| LINTO_STACK_REDIS_SESSION_SERVICE | Redis store service host/url | localhost, linto-platform-stack-redis |
| LINTO_STACK_REDIS_SESSION_SERVICE_PORT | Redis store service port | 6379 |
| LINTO_STACK_TOCK_SERVICE | Tock (nlu service) host/url | localhost, http://my-tock-service.com |
| LINTO_STACK_TOCK_USER | Tock (nlu service) user | admin@app.com |
| LINTO_STACK_TOCK_PASSWORD | Tock (nlu service) user | password |
| LINTO_STACK_STT_SERVICE_MANAGER_SERVICE | STT service host/url | localhost, http://my-s
tt-service.com |
| LINTO_STACK_MONGODB_SERVICE | MongoDb service host/url | localhost, linto-platform-stack-service |
| LINTO_STACK_MONGODB_PORT | MongoDb service port | 27017 |
| LINTO_STACK_MONGODB_DBNAME | MongoDb service database name | lintoAdmin |
| LINTO_STACK_MONGODB_USE_LOGIN | Enable/Disable MongoDb service authentication | true,false |
| LINTO_STACK_MONGODB_USER | MongoDb service username | user | 
| LINTO_STACK_MONGODB_PASSWORD |  MongoDb service username | password |
| LINTO_STACK_MQTT_HOST | MQTT broker host | localhost |
| LINTO_STACK_MQTT_PORT | MQTT broker port | 1883 |
| LINTO_STACK_MQTT_USE_LOGIN | Enable/Disable MQTT broker authentication | true,false |
| LINTO_STACK_MQTT_DEFAULT_HW_SCOPE | MQTT broker "hardware" scope | blk |
| LINTO_STACK_MQTT_USER | MQTT broker user | user |
| LINTO_STACK_MQTT_PASSWORD | MQTT broker user | password |
| LINTO_STACK_BLS_SERVICE | Business logic server (nodered instance) | localhost,  http://my-bls.com |
| LINTO_STACK_BLS_USE_LOGIN | Enable/Disable Business logic server authentication | true,false |
| LINTO_STACK_BLS_USER | Business logic server user | user |
| LINTO_STACK_BLS_PASSWORD | Business logic server | password |
