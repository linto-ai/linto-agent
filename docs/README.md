
# Infrastructure setup

LinTO Platform stack is meant to get deployed on a Docker Swarm cluster. Please read thouroughly the [infrastructure setup guide](https://doc.linto.ai/#/infra) and the following documentation BEFORE you run the startup script.

If you fancy using kubernetes, or other containers orchestration tools, you might adapt this proposal for your needs... Won't be too much of a hassle as this stack relies mainly on Traefik edge-router which can be deployed as an Ingress controler for K8s.

The benefit we try to raise by chosing Docker Swarm is to stick as much as we can to standard Docker / Docker Compose deployements. We hope that it would be more convinient for LinTO contributors, hackers and makers that wants to quickly deploy LinTO's tooling.

# What's inside linto-platform-stack GitHub repository

This repo provides a tool that *tries* to solve all the burden of  deploying LinTO's server components with our proposed Docker images (quite a complicated task otherwise...)

The tool is available here, [linto-platform-stack](https://github.com/linto-ai/linto-platform-stack). It mainly consists of a bash script, `start.sh`, that feeds Docker Swarm with the provided YML Docker Compose files. The script will also generate files in a shared folder made available on every node of the swarm cluster. Almost every user setups are wrapped in a single environement variable declarative file.

The whole point here is to rationalize all your deployement in few quick steps:
0. Read thouroughly this documentation.
1. Copy the template : `cp dockerenv_template .dockerenv`
2. Configure the service stack options by filling-up all the mandatory environement variables in `.dockerenv`
3. Configure a local Docker Swarm network for your service communications
4. Run the `start.sh` script on a manager node of your cluster

Simple, isn't it ?

Note: `start.sh [-- command args]` have command arguments
```sh
    -f | --force-pull     Force image pull
    -r | --restart        Hard restart of the stack
```

# Ready ? Let's deploy LinTO Platform !

Identify and target the cluster node that will receive the inbound trafic.

1. On a manager node, firstly list nodes and check hostnames :
```
docker node ls
```
2. Add this specific label :
```
docker node update --label-add ip=ingress {Hostname_Of_The_Node_In_Your_Swarm_Cluster}
```
3. Create a Docker Swarm local network to enable communication between services 
```
docker network create \
    -d overlay \
    --attachable \
    linto-net
```

4. Configure .dockerenv and run the start.sh script

NOTE : The bash script relies on htpasswd and envsubst binaries. You might install them with apache2-utils and gettext-base Debian packages.

## Repo's structure explained

```
linto-platform-stack
├── config
│   ├── bls                                             # Node-Red seeds
│   │   └── flowsStorage.json
│   ├── mongoseeds                                      # MongoDB user creation
│   │   └── admin-users.js
│   ├── mosquitto                                       # Mosquitto MQTT broker parameters
│   │   ├── docker-entrypoint.sh
│   │   ├── mosquitto.conf
│   │   └── mosquitto_nologin.conf
│   ├── servicemanager                                  # linto-stt-service-manager inits
│   │   ├── init.js
│   │   ├── swagger.yml
│   │   └── user.js
│   ├── tock                                            # Tock routing overrides
│   │   └── scripts
│   │       ├── admin-web-entrypoint.sh
│   │       └── setup.sh
│   └── traefik                                         # Traefik dynamic configuration files. All in this folder gets loaded when Traefik starts
│       ├── http-auth.toml
│       ├── ssl-redirect.toml
│       ├── stt-manager-path.toml
│       └── tock-path.toml
├── devcerts                                            # Put here your cert.pem and key.pem for SSL termination
│   ├── cert.pem
│   └── key.pem
├── docs                                                # This doc
│   └── README.md
├── optional-stack-files                                # Some tools that you might start on your docker cluster
│   ├── monitoring_stack.yml
│   └── network_tool.yml
├── scripts                                             # LinTO Platform backup and restore tools
│   ├── bls_backup.sh
│   ├── bls_restore.sh
│   ├── db_backup.sh
│   ├── db_restore.sh
│   └── README.md
├── stack-files                                         # Service declaration
│   ├── linto-docker-visualizer.yml
│   ├── linto-edge-router.yml
│   ├── linto-mongo-migration.yml
│   ├── linto-mqtt-broker.yml
│   ├── linto-platform-admin.yml
│   ├── linto-platform-bls.yml
│   ├── linto-platform-mongo.yml
│   ├── linto-platform-overwatch.yml
│   ├── linto-platform-redis.yml
│   ├── linto-platform-stt-service-manager.yml
│   └── linto-platform-tock.yml
└── start.sh                                            # Startup script for the whole stack
```

NOTE : The tool's repository has to get cloned on a *manager node* of your Docker Swarm cluster as running the `start.sh` script should only happen in a manager node of your cluster. 

## LinTO server components - A whole stack of services

LinTO Platform pre-compiled Docker images for Linux docker orchestrated infrastructures are available in our Docker Hub registry. [LinTO's DockerHub](https://hub.docker.com/r/lintoai/)

NOTE : Our deployments currently uses Debian GNU/Linux 10 (buster) machines with Docker Swarm version 19.03.8

Every Docker image available from the hub is compiled by us from our corresponding GitHub repository with a Jenkins CI task.

i.e : [linto-platform-admin docker image](https://hub.docker.com/r/lintoai/linto-platform-admin) is built upon [linto-platform-admin source repository](https://github.com/linto-ai/linto-platform-admin)

NOTE : More information about LinTO services [here](https://doc.linto.ai/#/services/services)

## Docker Swarm Services configured and deployed by this tool

| Services | Description | Vendor |
|:-|:-|:-|
| `linto-edge-router` | Ingress service for your LinTO platform. | [Traefik 2+](https://docs.traefik.io/v2.2/) |
| `linto-docker-visualizer` | A quick monitor of your Docker Swarm Cluster | [dockersamples/vizualizer](https://hub.docker.com/r/dockersamples/visualizer) |
| `linto-mqtt-broker` | MQTT server for LinTO clients connectivity | [eclipse-mosquitto](https://hub.docker.com/_/eclipse-mosquitto) |
| `linto-platform-redis` | Web servers sessions backend | [redis](https://hub.docker.com/_/redis) |
| `linto-tock-nlp-api`, `linto-tock-nlu-web`, `linto-tock-mongo`, `linto-tock-mongo-setup`, `linto-tock-build_worker`, `linto-tock-duckling` | The Open Conversation Kit - LinTO's server-side NLU Engine | [Voyage SNCF's Tock](https://github.com/theopenconversationkit/tock) |
| `linto-platform-mongo`, `linto-platform-mongodb-migration`| MongoDB Datatabase and migrations, stores most of LinTO Platform's business logic| [MongoDB](https://hub.docker.com/_/mongo), [linto-platform-mongodb-migration](https://github.com/linto-ai/linto-platform-mongodb-migration) |
| `linto-platform-stt-service-manager`, `linto-platform-stt-service-manager-mongodb`| Web API that abstracts the cluster's API in order to spawn service instances of Speech To Text transcription workers| [MongoDB](https://github.com/theopenconversationkit/tock), [linto-platform-stt-service-manager](https://github.com/linto-ai/linto-platform-stt-service-manager), [linto-platform-stt-standalone-worker](https://github.com/linto-ai/linto-platform-stt-standalone-worker)|
| `linto-platform-admin`| The main web interface of the LinTO Platform. Monitor your fleet of voice-enabled endpoints, create workflows, deploy skills... | [linto-platform-admin](https://github.com/linto-ai/linto-platform-admin) |
| `linto-platform-overwatch`| LinTO Platform's watchtower, provides authentication, persists connected clients MQTT transactions...| [linto-platform-overwatch](https://github.com/linto-ai/linto-platform-overwatch) |
| `linto-platform-bls`| BLS stands for Business Logic Server, this is mainly a wrapper for Node-RED. This service is the server-side runtime that executes LinTO skills and actions| [linto-platform-bls](https://github.com/linto-ai/linto-platform-business-logic-server), [IBM's Node-RED](https://nodered.org/)|

NOTE : Some services are persistant while some others, like database migrations, will fire once when the stack is started and then stop gracefuly.

NOTE : Some services are bound (constrained) to specific nodes in your cluster, we therefore might use specific docker labels attached to cluster nodes ( i.e : `ip=ingress` label described further in this documentation). 

NOTE : Mongo DB databases volumes are explicitly bound to the cluster manager node, this is our default setup as we want to prevent database file getting sharded on the cluster shared volume. In a production setup you might edit the corresponding YML compose files and invent your own node labels to deploy the databases wherever you want to.

## Web interfaces

Once deployed, some services provides web interfaces to start interacting with the platform.

| Services | Purpose | Route | Protected
|:-|:-|:-|:-|
| `linto-edge-router` | Traefik Dashboard | http(s)://LINTO_STACK_DOMAIN:`4480:4443`/dashboard/#/ | Yes |
| `linto-docker-visualizer` | Cluster Vizualizer Dashboard | http(s)://LINTO_STACK_DOMAIN/viz/ | Yes |
| `linto-platform-admin` | The platform's main web Interface| http(s)://LINTO_STACK_DOMAIN/ | No |
| `linto-platform-stt-service-manager` | Swagger client to start spawning Speech To text services| http(s)://LINTO_STACK_DOMAIN/stt-manager/api-doc | Yes |


NOTE : **Protected** column refers to the `LINTO_STACK_HTTP_USE_AUTH` environement variable. If set to true, the corresponding route will get protected with an HTTP basic auth middleware. This is useful for production as you don't want these routes publicly available.

NOTE : Some port variations appears in the `linto-edge-router` dashboard route and relates to your choice for SSL termination. This choice is set up by the `LINTO_STACK_USE_SSL` environement variable. This weird thingy is due to a Traefik limitation as the dashboard can't benefit from a base-path routing.

NOTE : `linto-platform-admin` Web interface will propose links to other Web interfaces (node Red, Tock...)



## LinTO Platform stack on a local network

You might choose to start the stack on your Linux Laptop right ahead. As we want you to also benefit from SSL termination when thoroughly testing the platform without a costly server deployment, we suggest you to use a self signed certificate :

1. Check this splendid tool : [MkCert](https://github.com/FiloSottile/mkcert) and install it
2. Generate self-signed certs for the chosen `LINTO_STACK_DOMAIN` 
i.e :
```
mkcert "mysuperlintostack.com"
```
3. Move the cert and key .pem file to the `devcerts` folder of this repo. Name it `cert.pem` and `key.pem`
4. Update your /etc/hosts accordingly to the chosen domain (or use some dns resolver like dnsmasq)
5. configure you local network DNS to resolve `LINTO_STACK_DOMAIN` if you want to connect LinTO clients to the local LinTO Platform.

You shall now benefit from a 100% SSL experience on your browser.

## LinTO Platform stack on a publicly available Web Server

The `LINTO_STACK_USE_ACME` paired with `LINTO_STACK_USE_SSL` environement variables, once set to true, will handle Let's encrypt transactions for you.

If you want to benefit from a free ACME SSL certificate issued by Let's Encrypt, simply set this vars to true and don't forget, at least, to point your DNS provider towards the external public IP of your cluster node that has the `ip=ingress` (use an A record maybe ?)

If you don't want to use Let's Encrypt, you shall of course bind-mount the SSL certificates you already own in the `linto-edge-router` service before deploying the stack.

## Start and stop the stack

Once all environement variables configured in `.dockerenv` (double check that), simply invoke the `start.sh` script on a manager node of your swarm cluster.
This will create a Docker stack named `linto_stack`

NOTE : All Docker services we described will get prefixed with this.

If you want to shutdown the stack, simply use Docker commands

```
docker stack rm linto_stack
```

If you want to update services, you might simply reinvoke the `start.sh` script


# Environement Variable Configuration
NOTE : All of this is set up in the declarative hidden file `.dockerenv` at the root of the `linto-platform-stack` repository.

| Env variable| Description | Example |
|:-|:-|:-|
|LINTO_SHARED_MOUNT|Shared mount path on every cluster's node|~/linto_shared_mount/|
|LINTO_STACK_USE_SSL|Enable, disable SSL|true, false|
|LINTO_STACK_USE_ACME|Enable, disable Let's encrypt|true, false|
|LINTO_STACK_ACME_EMAIL|ACME user email|user@linagora.com|
|LINTO_STACK_DOMAIN|Deployed domain of the stack|dev.linto.local|
|LINTO_STACK_HTTP_USE_AUTH|Enable, disable Basic HTTP protection on some critical routes|true, false|
|LINTO_STACK_HTTP_USER|The HTTP basic auth user|user|
|LINTO_STACK_HTTP_PASSWORD|The HTTP basic auth password you wanna use |password|
|LINTO_STACK_IMAGE_TAG|You might use latest or latest-unstable images from our Docker Hub|latest / latest-unstable|
|**Node JS APplication**|
|TZ|Time-zone value|Europe/Paris|
|LINTO_STACK_ADMIN_HTTP_PORT|Leave it 80 unless you want some tweaking|80|
|LINTO_STACK_ADMIN_API_WHITELIST_DOMAINS|CORS auhtorized domains list (separator ','), shall match your LINTO_STACK_DOMAIN at least|http://dev.linto.local,http://my-domain.coml|
|**Redis session store for webapps**|
|LINTO_STACK_REDIS_SESSION_SERVICE|Redis store service host/url|linto-platform-stack-redis|
|LINTO_STACK_REDIS_SESSION_SERVICE_PORT|Redis store service port|6379|
|**MQTT Broker for LinTO clients**|
| LINTO_STACK_MQTT_HOST | MQTT broker host | linto-mqtt-broker |
| LINTO_STACK_MQTT_PORT | MQTT broker port | 1883 |
| LINTO_STACK_MQTT_USE_LOGIN | Enable/Disable MQTT broker authentication | true,false |
| LINTO_STACK_MQTT_DEFAULT_HW_SCOPE | MQTT broker scope for static linto devices, any string | blk |
| LINTO_STACK_MQTT_USER | MQTT broker user | user |
| LINTO_STACK_MQTT_PASSWORD | MQTT broker password | password |
|LINTO_STACK_MQTT_KEEP_ALIVE| TCP keep alive in seconds|60|
|LINTO_STACK_MQTT_OVER_WS|MQTT accesible over websockets or secure ws|true, false|
|LINTO_STACK_MQTT_OVER_WS_ENDPOINT|mqtt over ws/wss endpoint|/mqtt|
|**Database**|
| LINTO_STACK_MONGODB_SERVICE | MongoDb service host/url | linto-platform-mongo |
| LINTO_STACK_MONGODB_PORT | MongoDb service port | 27017 |
| LINTO_STACK_MONGODB_DBNAME | MongoDb service database name | linto-stack |
| LINTO_STACK_MONGODB_USE_LOGIN | Enable/Disable MongoDb service authentication | true,false |
| LINTO_STACK_MONGODB_USER | MongoDb service username | user | 
| LINTO_STACK_MONGODB_PASSWORD |  MongoDb service username | password |
|LINTO_STACK_MONGODB_VOLUME_NAME|Volume name for mongodb|mongodb-admin|
|LINTO_STACK_MONGODB_TARGET_VERSION|Mongodb version for migration backup|1,2,3|
|**Business Logic Server**|
|LINTO_STACK_BLS_SERVICE|BLS service host/url|linto-platform-bls|
|LINTO_STACK_BLS_USE_LOGIN|Enable/disable BLS authentication|true|
|LINTO_STACK_BLS_USER|BLS service username|username|
|LINTO_STACK_BLS_PASSWORD|BLS service password|password|
|LINTO_STACK_BLS_SERVICE_UI_PATH|User interface path|/redui|
|**Tock NLU**|
|LINTO_STACK_TOCK_SERVICE|Tock service host/url|linto-tock-nlu-web|
|LINTO_STACK_TOCK_NLP_API|Tock NLP service host/url|linto-tock-nlp-api|
|LINTO_STACK_MONGODB_TOCK_VOLUME_NAME|Mongodb volume name for tock service|linto-tock-mongo|
|LINTO_STACK_TOCK_SERVICE_PORT|Tock service port|8080|
|LINTO_STACK_TOCK_SERVICE_UI_PATH|TOck user interface path|/tock|
|LINTO_STACK_TOCK_ENV|Running environement type(more log on dev)|dev,prod|
|LINTO_STACK_TOCK_USER|Tock user|tock@linto.ai|
|LINTO_STACK_TOCK_PASSWORD|Tock user password|password|
|LINTO_STACK_TOCK_TAG|Docker image version|19.9.3|
|**STT Service manager**|
|LINTO_STACK_STT_SERVICE_MANAGER_SERVICE|STT-manager service host|linto-platform-stt-service-manager|
|LINTO_STACK_STT_SERVICE_MANAGER_INGRESS_CONTROLLER|Controller ingress used|traefik|
|LINTO_STACK_STT_SERVICE_MANAGER_NGINX_HOST|STT-manager nginx host (used only if nginx is choosed as Controller Ingress)|stack_linto_linto-platform-stt-service-manager-nginx|
|LINTO_STACK_STT_SERVICE_MANAGER_MONGODB_HOST|STT-manager mongodb host|linto-platform-stt-service-manager-mongodb|
|LINTO_STACK_STT_SERVICE_MANAGER_MONGODB_PORT|STT-manager mongodb port|27017|
|LINTO_STACK_STT_SERVICE_MANAGER_MONGODB_DBNAME|MongoDb service database name|linSTTAdmin|
|LINTO_STACK_STT_SERVICE_MANAGER_MONGODB_REQUIRE_LOGIN| Enable/Disable MongoDb service authentication | true,false |
|LINTO_STACK_STT_SERVICE_MANAGER_MONGODB_USER|MongoDb service username | user | 
|LINTO_STACK_STT_SERVICE_MANAGER_MOGODB_PSWD|MongoDb service password user | 
|LINTO_STACK_STT_SERVICE_MANAGER_VOLUME_NAME|Mongodb volume name for STT-manager service|stt-service-manager|
|**LinSTT Service**|
|LINTO_STACK_LINSTT_IMAGE|Docker image to use|lintoai/linto-platform-stt-standalone-worker|
|LINTO_STACK_LINSTT_NETWORK|Docker network to connect|linto-net|
|LINTO_STACK_LINSTT_PREFIX|=|stt|
|**Overwatch**|
|LINTO_STACK_OVERWATCH_LOGS_MONGODB|Enable/Disable mongodb logs|true,false|
|LINTO_STACK_OVERWATCH_BASE_PATH|API rest path location|/overwatch|
|LINTO_STACK_OVERWATCH_AUTH_TYPE|Enable auth type module|basic,ldap,passthrough,...|
|LINTO_STACK_OVERWATCH_AUTH_LDAP_SERVER_URL|Host service LDAP|
|LINTO_STACK_OVERWATCH_AUTH_LDAP_SERVER_SEARCH_BASE|Ldap base search|
|LINTO_STACK_OVERWATCH_AUTH_LDAP_SERVER_SEARCH_FILTER|Ldap filter search|

# Final words

To adapt the following tools to your needs, when you want let's say to deploy some service "à la carte", you might check what's going on in the `stack-files` folder of this repo (YML sources for the Docker Services).
