# Linto-Platform-STT-Service-Manager

This service is mandatory in a LinTO platform stack as the main process for speech to text toolkit.
It is used with [stt-standalone-worker](https://github.com/linto-ai/linto-platform-stt-standalone-worker) to run an API with docker swarm to manage STT services.

## Usage
See documentation : [doc.linto.ai](https://doc.linto.ai/#/services/stt_manager)

# Deploy

With our proposed stack [linto-platform-stack](https://github.com/linto-ai/linto-platform-stack)

# Develop

## Prerequisites
To use the STT-manager service, you'll have to make sure that dependent services are installed and launched:

- mongodb: `docker pull mongo`
- nginx: `docker pull nginx`
- traefik: `docker pull traefik`

## Download and Install

To install STT Service Manager you will need to download the source code :

```bash
git clone https://github.com/linto-ai/linto-platform-stt-service-manager.git
cd linto-platform-stt-service-manager
```

You will need to have Docker and Docker Compose installed on your machine. Then, to build the docker image, execute:

```bash
docker build -t lintoai/linto-platform-stt-standalone-worker .
```

Or using docker-compose:
```bash
docker-compose build
```

Otherwise, you can download the pre-built image from docker-hub:

```bash
docker pull lintoai/linto-platform-stt-standalone-worker:latest
```

NOTE: To install the service without docker, please follow the instructions defined in the `Dockerfile` (Build kaldi, Install NLP packages, Install npm modules). 

## Configuration
Once all the services are build, you need to manage your environment variables. A default file `.envdefault` is provided to allow a default setup. Please adapt it to your configurations and needs.

```bash
cp .envdefault .env
nano .env
```

| Env variable| Description | example |
|:---|:---|:---|
|LINTO_STACK_DOMAIN|Deployed domain. It is required when traefik controller is used|dev.linto.local|
|LINTO_STACK_STT_SERVICE_MANAGER_HTTP_PORT|STT-manager service port|80|
|LINTO_STACK_STT_SERVICE_MANAGER_DIRECTORY|Folder path where to save the created models|~/linto_shared_memory/|
|LINTO_STACK_STT_SERVICE_MANAGER_CLUSTER_MANAGER|A container orchestration tool (accepted values: DockerSwarm)|DockerSwarm|
|LINTO_STACK_STT_SERVICE_MANAGER_INGRESS_CONTROLLER|Controller ingress used (accepted values: nginx\|traefik)|nginx|
|LINTO_STACK_STT_SERVICE_MANAGER_LINSTT_TOOLKIT|ASR engine used (accepted values: kaldi)|kaldi|
|LINTO_STACK_STT_SERVICE_MANAGER_NGINX_HOST|STT-manager nginx host|localhost|
|LINTO_STACK_STT_SERVICE_MANAGER_MONGODB_HOST|STT-manager mongodb host|localhost|
|LINTO_STACK_STT_SERVICE_MANAGER_MONGODB_PORT|MongoDb service port|27017|
|LINTO_STACK_STT_SERVICE_MANAGER_MONGODB_DBNAME|MongoDb service database name|linSTTAdmin|
|LINTO_STACK_STT_SERVICE_MANAGER_MONGODB_REQUIRE_LOGIN|Enable/Disable MongoDb service authentication|true|
|LINTO_STACK_STT_SERVICE_MANAGER_MONGODB_USER|MongoDb service username|root|
|LINTO_STACK_STT_SERVICE_MANAGER_MONGODB_PSWD|MongoDb service password user|root|
|LINTO_STACK_LINSTT_OFFLINE_IMAGE|LinSTT docker image to use for offline decoding mode|lintoai/linto-platform-stt-standalone-worker|
|LINTO_STACK_LINSTT_STREAMING_IMAGE|LinSTT docker image to use for online decoding mode|lintoai/linto-platform-stt-standalone-worker-streaming|
|LINTO_STACK_LINSTT_NETWORK|LinSTT docker network to connect|linto-net|
|LINTO_STACK_LINSTT_PREFIX|LinSTT service prefix to use with controller ingress|stt|
|LINTO_STACK_IMAGE_TAG|Docker image tag to use|latest|
|LINTO_STACK_LINSTT_NAME|Docker stack name|stt|

If you run STT-manager without docker, you need to change the following environment variables:

| Env variable| Description | example |
|:---|:---|:---|
|SAVE_MODELS_PATH|Saved model path. Set it to the same path as LINTO_STACK_STT_SERVICE_MANAGER_DIRECTORY|~/linto_shared_memory/|
|LINTO_STACK_STT_SERVICE_MANAGER_SWAGGER_PATH|STT-manager swagger file path|~/linto-platform-stt-service-manager/config/swagger.yml|
|LINTO_STACK_STT_SERVICE_MANAGER_NGINX_CONF|STT-manager nginx config file path|~/linto-platform-stt-service-manager/config/nginx.conf|

NOTE: if you want to use the user interface, you need also to configure the swagger file `~/linto-platform-stt-service-manager/config/swagger.yml`. Specifically, in the section `host`, specify the host and the address of the machine in which the service is deployed.

## Execute
In order to run the service alone, you have first to run the ingress controller service (`LINTO_STACK_STT_SERVICE_MANAGER_INGRESS_CONTROLLER`). Then, you only need to execute:

```bash
cd linto-platform-stt-service-manager
docker-compose up
```
Then you can acces it on [localhost:8000](localhost:8000). You can use the user interface on [localhost:8000/api-doc/](localhost:8000/api-doc/)