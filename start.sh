#!/bin/bash
set -uea
SUDO=''
. .dockerenv # Source all env

echo "Generating configuration file in ${LINTO_SHARED_MOUNT}"

[[ "$LINTO_STACK_USE_SSL" == true ]] && echo -e "SSL : \e[32mON\e[0m" || echo -e "SSL : \e[31mOFF\e[0m"
[[ "$LINTO_STACK_USE_ACME" == true ]] && echo -e "Request for let's encrypt certs for ${LINTO_STACK_DOMAIN} : \e[32mON\e[0m" || echo -e "Request for let's encrypt certs for ${LINTO_STACK_DOMAIN} : \e[31mOFF\e[0m"
[[ "$LINTO_STACK_HTTP_USE_AUTH" == true ]] && echo -e "HTTP Basic Auth : \e[32mON\e[0m" || echo -e "HTTP Basic Auth : \e[31mOFF\e[0m"
[[ "$LINTO_STACK_MQTT_USE_LOGIN" == true ]] && echo -e "MQTT Login : \e[32mON\e[0m" || echo -e "MQTT Login : \e[31mOFF\e[0m"

###########################################
### Traefik dynamic files configuration ###
###########################################

# Purge config files before redeploying
rm -rf ${LINTO_SHARED_MOUNT}/config/traefik/
mkdir -p ${LINTO_SHARED_MOUNT}/config/traefik/

mkdir -p ${LINTO_SHARED_MOUNT}/certs/

if [[ "$LINTO_STACK_HTTP_USE_AUTH" == true ]]
    then
    [[ -z "$LINTO_STACK_HTTP_USER" ]] && { echo "Missing LINTO_STACK_HTTP_USER"; exit 1; }
    [[ -z "$LINTO_STACK_HTTP_PASSWORD" ]] && { echo "Missing LINTO_STACK_HTTP_PASSWORD"; exit 1; }
    if (( $EUID != 0 )); then SUDO='sudo'; fi
    which htpasswd >/dev/null || ($SUDO apt-get update && $SUDO apt-get install apache2-utils)
    LINTO_STACK_HTTP_HASH_STRING=$(htpasswd -nb ${LINTO_STACK_HTTP_USER} ${LINTO_STACK_HTTP_PASSWORD})
    export LINTO_STACK_HTTP_HASH_STRING
    envsubst < ./config/traefik/http-auth.toml > ${LINTO_SHARED_MOUNT}/config/traefik/http-auth.toml
fi

LABELS=""
if [[ "$LINTO_STACK_USE_SSL" == true ]]; then
    [[ "$LINTO_STACK_USE_ACME" == false ]] && cp -rp ./devcerts/* ${LINTO_SHARED_MOUNT}/certs/
    cp ./config/traefik/ssl-redirect.toml ${LINTO_SHARED_MOUNT}/config/traefik/ssl-redirect.toml
    LABELS="${LABELS}, *ssl"
    [[ "$LINTO_STACK_USE_ACME" == true ]] && LABELS="${LABELS}, *acme"
    [[ "$LINTO_STACK_HTTP_USE_AUTH" == true ]] && LABELS="${LABELS}, *basic-auth-ssl"
else
    [[ "$LINTO_STACK_HTTP_USE_AUTH" == true ]] && LABELS="${LABELS}, *basic-auth"
fi

# Stack deployment using correct labels
sed -e "s/<<: \[ \(.*\) \]/<<: [ \1${LABELS} ]/" ./stack-files/linto-edge-router.yml \
| docker stack deploy --resolve-image always --compose-file - linto_stack


###########################################
###        Mosquitto MQTT Broker        ###
###########################################
mkdir -p ${LINTO_SHARED_MOUNT}/config/mosquitto/
mkdir -p ${LINTO_SHARED_MOUNT}/data/mosquitto/
chmod o+wrx ${LINTO_SHARED_MOUNT}/data/mosquitto/ # Fix permissions rights for 1883:1883 UID:GUID used by mosquitto docker image
cp -rp ./config/mosquitto ${LINTO_SHARED_MOUNT}/config/
if [[ "$LINTO_STACK_MQTT_USE_LOGIN" == true ]]
    then
    [[ -z "$LINTO_STACK_MQTT_USER" ]] && { echo "Missing LINTO_STACK_MQTT_USER"; exit 1; }
    [[ -z "$LINTO_STACK_MQTT_PASSWORD" ]] && { echo "Missing LINTO_STACK_MQTT_PASSWORD"; exit 1; }

    rm -f ${LINTO_SHARED_MOUNT}/config/mosquitto/conf.d/go-auth.conf
    rm -f ${LINTO_SHARED_MOUNT}/config/mosquitto/auth/acls

    envsubst < ./config/mosquitto/conf-tempalte/go-auth-template.conf > ${LINTO_SHARED_MOUNT}/config/mosquitto/conf.d/go-auth.conf
    htpasswd -nbBC 10 ${LINTO_STACK_MQTT_USER} ${LINTO_STACK_MQTT_PASSWORD} >${LINTO_SHARED_MOUNT}/config/mosquitto/auth/users
    envsubst < ./config/mosquitto/auth/acls > ${LINTO_SHARED_MOUNT}/config/mosquitto/auth/acls
fi


LABELS=""
if [[ "$LINTO_STACK_USE_SSL" == true ]]; then
    LABELS="${LABELS}, *ssl"
    [[ "$LINTO_STACK_USE_ACME" == true ]] && [[ "$LINTO_STACK_MQTT_OVER_WS" == true ]] && LABELS="${LABELS}, *acme-wss"
    [[ "$LINTO_STACK_USE_ACME" == true ]] && [[ "$LINTO_STACK_MQTT_OVER_WS" == false ]] && LABELS="${LABELS}, *acme"
    [[ "$LINTO_STACK_MQTT_OVER_WS" == true ]] && LABELS="${LABELS}, *wss" # Secure Websocket support for MQTT
else
    [[ "$LINTO_STACK_MQTT_OVER_WS" == true ]] && [[ "$LINTO_STACK_MQTT_OVER_WS" == true ]] && LABELS="${LABELS}, *ws" # Non-secure websocket support for MQTT
fi

# Stack deployment using correct labels
sed -e "s/<<: \[ \(.*\) \]/<<: [ \1${LABELS} ]/" ./stack-files/linto-mqtt-broker.yml \
| docker stack deploy --resolve-image always --compose-file - linto_stack

###########################################
###          Docker visualizer          ###
###########################################

LABELS=""
if [[ "$LINTO_STACK_USE_SSL" == true ]]; then
    LABELS="${LABELS}, *ssl"
    [[ "$LINTO_STACK_USE_ACME" == true ]] && LABELS="${LABELS}, *acme"
    [[ "$LINTO_STACK_HTTP_USE_AUTH" == true ]] && LABELS="${LABELS}, *basic-auth-ssl"
else
    [[ "$LINTO_STACK_HTTP_USE_AUTH" == true ]] && LABELS="${LABELS}, *basic-auth"
fi

# Stack deployment using correct labels
sed -e "s/<<: \[ \(.*\) \]/<<: [ \1${LABELS} ]/" ./stack-files/linto-docker-visualizer.yml \
| docker stack deploy --resolve-image always --compose-file - linto_stack

###########################################
###       LinTO Platform database       ###
###########################################

# Physical Data is stored on the cluster node flagged with "dbstorage = true" as we do not want to store physical db data on the glusterFS shared storage
# Mongo database is used for storing :
# - LinTO admin database
# - STT-Service-Manager models meta-data and services definition + service usage metrics

# Db initialization using JS scripts
# copy seed init scripts to shared folder for deployment
rm -rf ${LINTO_SHARED_MOUNT}/mongoseeds
mkdir -p ${LINTO_SHARED_MOUNT}/mongoseeds
cp -rp ./config/mongoseeds/* ${LINTO_SHARED_MOUNT}/mongoseeds

MONGO_ENV=""
# if [[ "$LINTO_STACK_MONGODB_USE_LOGIN" == true ]]; then
#     MONGO_ENV="${MONGO_ENV}, *mongo-auth"
# fi

envsubst < ./config/mongoseeds/admin-users.js > ${LINTO_SHARED_MOUNT}/mongoseeds/admin-users.js

# create main directories (they musn't be removed)
mkdir -p $HOME/${LINTO_STACK_MONGODB_VOLUME_NAME}/.dbdata
mkdir -p $HOME/${LINTO_STACK_MONGODB_VOLUME_NAME}/.dbbackup

sed -e "s/<<: \[ \(.*\) \]/<<: [ \1${MONGO_ENV} ]/" ./stack-files/linto-platform-mongo.yml \
| docker stack deploy --resolve-image always --compose-file - linto_stack

###########################################
###  LinTO Platform redis session store ###
###########################################

sed -e "s/<<: \[ \(.*\) \]/<<: [ \1${LABELS} ]/" ./stack-files/linto-platform-redis.yml \
| docker stack deploy --resolve-image always --compose-file - linto_stack

###########################################
###       LinTO Mongodb migration       ###
###########################################
rm -rf ${LINTO_SHARED_MOUNT}/mongodb-schemas
mkdir -p ${LINTO_SHARED_MOUNT}/mongodb-schemas

LABELS=""
sed -e "s/<<: \[ \(.*\) \]/<<: [ \1${LABELS} ]/" ./stack-files/linto-mongo-migration.yml \
| docker stack deploy --resolve-image always --compose-file - linto_stack

id=$(docker create lintoai/linto-platform-mongodb-migration:$LINTO_STACK_IMAGE_TAG)
docker cp $id:/usr/src/app/linto-platform-mongodb-migration/migrations ${LINTO_SHARED_MOUNT}/mongodb-schemas && mv ${LINTO_SHARED_MOUNT}/mongodb-schemas/migrations ${LINTO_SHARED_MOUNT}/mongodb-schemas/version
docker rm -v $id
###########################################
###         LinTO Platform Admin        ###
###########################################

LABELS=""
if [[ "$LINTO_STACK_USE_SSL" == true ]]; then
    LABELS="${LABELS}, *ssl"
    [[ "$LINTO_STACK_USE_ACME" == true ]] && LABELS="${LABELS}, *acme"
fi

# Stack deployment using correct labels
sed -e "s/<<: \[ \(.*\) \]/<<: [ \1${LABELS} ]/" ./stack-files/linto-platform-admin.yml \
| docker stack deploy --resolve-image always --compose-file - linto_stack


###########################################
###         LinTO Platform BLS          ###
###########################################

mkdir -p ${LINTO_SHARED_MOUNT}/.bls/
if [[ ! -e ${LINTO_SHARED_MOUNT}/.bls/flowsStorage.json ]]; then
    cp ./config/bls/flowsStorage.json ${LINTO_SHARED_MOUNT}/.bls/flowsStorage.json
fi

LABELS=""
if [[ "$LINTO_STACK_USE_SSL" == true ]]; then
    LABELS="${LABELS}, *ssl"
    [[ "$LINTO_STACK_USE_ACME" == true ]] && LABELS="${LABELS}, *acme"
fi

# Stack deployment using correct labels
sed -e "s/<<: \[ \(.*\) \]/<<: [ \1${LABELS} ]/" ./stack-files/linto-platform-bls.yml \
| docker stack deploy --resolve-image always --compose-file - linto_stack

###########################################
###      LinTO Platform Overwatch       ###
###########################################


LABELS=""
if [[ "$LINTO_STACK_USE_SSL" == true ]]; then
    LABELS="${LABELS}, *ssl"
    [[ "$LINTO_STACK_USE_ACME" == true ]] && LABELS="${LABELS}, *acme"
fi

# Stack deployment using correct labels
sed -e "s/<<: \[ \(.*\) \]/<<: [ \1${LABELS} ]/" ./stack-files/linto-platform-overwatch.yml \
| docker stack deploy --resolve-image always --compose-file - linto_stack

###########################################
###          LinTO Stack Tock           ###
###########################################
mkdir -p ${LINTO_SHARED_MOUNT}/config/tock/scripts
mkdir -p $HOME/${LINTO_STACK_MONGODB_TOCK_VOLUME_NAME}/.dbdata
mkdir -p $HOME/${LINTO_STACK_MONGODB_TOCK_VOLUME_NAME}/.dbbackup

cp ./config/traefik/tock-path.toml ${LINTO_SHARED_MOUNT}/config/traefik/tock-path.toml

cp ./config/tock/scripts/setup.sh ${LINTO_SHARED_MOUNT}/config/tock/scripts/setup.sh
cp ./config/tock/scripts/admin-web-entrypoint.sh ${LINTO_SHARED_MOUNT}/config/tock/scripts/admin-web-entrypoint.sh

LABELS=""
middlewares=""
secure_middlewares=""
if [[ "$LINTO_STACK_USE_SSL" == true ]]; then
    LABELS="${LABELS}, *ssl-xxx"
    middlewares="ssl-redirect@file, "
    [[ "$LINTO_STACK_USE_ACME" == true ]] && LABELS="${LABELS}, *acme-xxx"
    [[ "$LINTO_STACK_HTTP_USE_AUTH" == true ]] && secure_middlewares="basic-auth@file, "
else
    [[ "$LINTO_STACK_HTTP_USE_AUTH" == true ]] && middlewares="basic-auth@file, "
fi


if [[ "$LINTO_STACK_TOCK_BOT" == true ]]; then
sed -e "s/<<: \[ \*labels\-nlu \]/<<: [ *labels-nlu${LABELS} ]/" -e "s/\-xxx/-nlu/" -e "s/\-xxx/-nlu/" \
    -e "s/<<: \[ \*labels\-nlp \]/<<: [ *labels-nlp${LABELS} ]/" -e "s/\-xxx/-nlp/" -e "s/\-xxx/-nlp/" \
    -e "s/\(traefik.http.routers.linto-tock-nl[up]-[a-z]*.middlewares: \"\)\(.*\)\"/\1$middlewares\2\"/" \
    -e "s/\(traefik.http.routers.linto-tock-nl[up]-[a-z]*-secure.middlewares: \"\)\(.*\)\"/\1$secure_middlewares\2\"/" \
    ./stack-files/linto-platform-tock-tchatbot.yml \
| docker stack deploy --resolve-image always --compose-file - linto_stack
else
sed -e "s/<<: \[ \*labels\-nlu \]/<<: [ *labels-nlu${LABELS} ]/" -e "s/\-xxx/-nlu/" -e "s/\-xxx/-nlu/" \
    -e "s/<<: \[ \*labels\-nlp \]/<<: [ *labels-nlp${LABELS} ]/" -e "s/\-xxx/-nlp/" -e "s/\-xxx/-nlp/" \
    -e "s/\(traefik.http.routers.linto-tock-nl[up]-[a-z]*.middlewares: \"\)\(.*\)\"/\1$middlewares\2\"/" \
    -e "s/\(traefik.http.routers.linto-tock-nl[up]-[a-z]*-secure.middlewares: \"\)\(.*\)\"/\1$secure_middlewares\2\"/" \
    ./stack-files/linto-platform-tock.yml \
| docker stack deploy --resolve-image always --compose-file - linto_stack
fi


###########################################
###  LinTO Platform STT service manager ###
###########################################

cp ./config/traefik/stt-manager-path.toml ${LINTO_SHARED_MOUNT}/config/traefik/stt-manager-path.toml

# Db initialization using JS scripts
# copy seed init scripts to shared folder for deployment
rm -rf ${LINTO_SHARED_MOUNT}/stt-service-manager
mkdir -p ${LINTO_SHARED_MOUNT}/stt-service-manager
cp -rp ./config/servicemanager/* ${LINTO_SHARED_MOUNT}/stt-service-manager

envsubst < ./config/servicemanager/user.js > ${LINTO_SHARED_MOUNT}/stt-service-manager/user.js

# configurer le swagger.yml
if [[ "$LINTO_STACK_HTTP_USE_AUTH" == true ]]; then
    LINTO_STACK_LINSTT_PREFIX=$(echo $LINTO_STACK_LINSTT_PREFIX | sed "s:/::")
    sed -i -e "s:\${{LINTO_STACK_DOMAIN}}:$LINTO_STACK_DOMAIN:g" \
        -e "s:\${{PathPrefix}}:stt-manager:g" \
        -e "s:\${{linsttPathPrefix}}:${LINTO_STACK_LINSTT_PREFIX}:g" \
        ${LINTO_SHARED_MOUNT}/stt-service-manager/swagger.yml
    which base64 >/dev/null || ($SUDO apt-get update && $SUDO apt-get install base64)
    baseAuth=$(echo "$LINTO_STACK_HTTP_USER:$LINTO_STACK_HTTP_PASSWORD" | base64)
    sed -i -e "s:#{{BASIC_AUTH}} ::g" -e "s:\${{BASIC_AUTH}}:${baseAuth}:g" ${LINTO_SHARED_MOUNT}/stt-service-manager/swagger.yml
else
    LINTO_STACK_LINSTT_PREFIX=$(echo $LINTO_STACK_LINSTT_PREFIX | sed "s:/::")
    sed -i -e "s:#{{BASIC_AUTH}} .*::g" \
        -e "s:\${{LINTO_STACK_DOMAIN}}:$LINTO_STACK_DOMAIN:g" \
        -e "s:\${{PathPrefix}}:stt-manager:g" \
        -e "s:\${{linsttPathPrefix}}:${LINTO_STACK_LINSTT_PREFIX}:g" \
        ${LINTO_SHARED_MOUNT}/stt-service-manager/swagger.yml
fi


if [[ "$LINTO_STACK_USE_SSL" == true ]]; then
    sed -i "s:\${{http}}:https:g" ${LINTO_SHARED_MOUNT}/stt-service-manager/swagger.yml
else
    sed -i "s:\${{http}}:http:g" ${LINTO_SHARED_MOUNT}/stt-service-manager/swagger.yml
fi


# create main directories (they musn't be removed)
mkdir -p ${LINTO_SHARED_MOUNT}/models
mkdir -p ${HOME}/${LINTO_STACK_STT_SERVICE_MANAGER_VOLUME_NAME}/dbdata
mkdir -p ${HOME}/${LINTO_STACK_STT_SERVICE_MANAGER_VOLUME_NAME}/dbbackup

# pull stt-standealone-worker images
docker pull ${LINTO_STACK_LINSTT_OFFLINE_IMAGE}:$LINTO_STACK_IMAGE_TAG
docker pull ${LINTO_STACK_LINSTT_STREAMING_IMAGE}:$LINTO_STACK_IMAGE_TAG

LABELS=""
middlewares=""
secure_middlewares=""
if [[ "$LINTO_STACK_USE_SSL" == true ]]; then
    LABELS="${LABELS}, *ssl"
    middlewares="ssl-redirect@file, "
    [[ "$LINTO_STACK_USE_ACME" == true ]] && LABELS="${LABELS}, *acme"
    [[ "$LINTO_STACK_HTTP_USE_AUTH" == true ]] && secure_middlewares="basic-auth@file, "
else
    [[ "$LINTO_STACK_HTTP_USE_AUTH" == true ]] && middlewares="basic-auth@file, "
fi

# Run nginx if it is used as ingress controller
if [[ "$LINTO_STACK_STT_SERVICE_MANAGER_INGRESS_CONTROLLER" == "nginx" ]]; then
    sed -e "s/<<: \[ \(.*\) \]/<<: [ \1${LABELS} ]/" \
        -e "s/\(traefik.http.routers.linto-platform-stt-service-manager-nginx.middlewares: \"\)\(.*\)\"/\1$middlewares\2\"/" \
        -e "s/\(traefik.http.routers.linto-platform-stt-service-manager-nginx-secure.middlewares: \"\)\(.*\)\"/\1$secure_middlewares\2\"/" \
        ./stack-files/linto-platform-stt-service-manager-nginx.yml \
    | docker stack deploy --resolve-image always --compose-file - linto_stack
fi

sed -e "s/<<: \[ \(.*\) \]/<<: [ \1${LABELS} ]/" \
    -e "s/\(traefik.http.routers.linto-platform-stt-service-manager.middlewares: \"\)\(.*\)\"/\1$middlewares\2\"/" \
    -e "s/\(traefik.http.routers.linto-platform-stt-service-manager-secure.middlewares: \"\)\(.*\)\"/\1$secure_middlewares\2\"/" \
    ./stack-files/linto-platform-stt-service-manager.yml \
| docker stack deploy --resolve-image always --compose-file - linto_stack


set +a
