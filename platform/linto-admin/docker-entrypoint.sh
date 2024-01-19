#!/bin/bash
set -e
[ -z "$LINTO_STACK_DOMAIN" ] && {
    echo "Missing LINTO_STACK_DOMAIN"
    exit 1
}
[ -z "$LINTO_STACK_USE_SSL" ] && {
    echo "Missing LINTO_STACK_USE_SSL"
    exit 1
}

echo "Waiting redis, MQTT and mongo..."
/wait-for-it.sh $LINTO_STACK_REDIS_SESSION_SERVICE:$LINTO_STACK_REDIS_SESSION_SERVICE_PORT --timeout=20 --strict -- echo " $LINTO_STACK_REDIS_SESSION_SERVICE:$LINTO_STACK_REDIS_SESSION_SERVICE_PORT is up"
/wait-for-it.sh $LINTO_STACK_MONGODB_SERVICE:$LINTO_STACK_MONGODB_PORT --timeout=20 --strict -- echo " $LINTO_STACK_MONGODB_SERVICE:$LINTO_STACK_MONGODB_PORT is up"
/wait-for-it.sh $LINTO_STACK_MQTT_HOST:$LINTO_STACK_MQTT_PORT --timeout=20 --strict -- echo " $LINTO_STACK_MQTT_HOST:$LINTO_STACK_MQTT_PORT is up"

while [ "$1" != "" ]; do
    case $1 in
    --rebuild-vue-app)
        cd /usr/src/app/linto-admin/vue_app
        echo "REBUILDING VUE APP"
        if [[ "$LINTO_STACK_USE_SSL" == true ]]; then
            echo "VUE_APP_URL=
            VUE_APP_TOCK_URL=https://$LINTO_STACK_DOMAIN/tock/
            VUE_APP_TOCK_USER=$LINTO_STACK_TOCK_USER
            VUE_APP_TOCK_PASSWORD=$LINTO_STACK_TOCK_PASSWORD
            VUE_APP_NODERED_RED=https://$LINTO_STACK_DOMAIN/red
            VUE_APP_NODERED=https://$LINTO_STACK_DOMAIN/redui
            VUE_APP_NODERED_USER=$LINTO_STACK_BLS_USER
            VUE_APP_NODERED_PASSWORD=$LINTO_STACK_BLS_PASSWORD
            VUE_APP_DEBUG=$VUE_APP_DEBUG" >.env.production
        else
            echo "VUE_APP_URL=
            VUE_APP_TOCK_URL=http://$LINTO_STACK_DOMAIN/tock/
            VUE_APP_TOCK_USER=$LINTO_STACK_TOCK_USER
            VUE_APP_TOCK_PASSWORD=$LINTO_STACK_TOCK_PASSWORD
            VUE_APP_NODERED_RED=http://$LINTO_STACK_DOMAIN/red
            VUE_APP_NODERED=http://$LINTO_STACK_DOMAIN/redui
            VUE_APP_NODERED_USER=$LINTO_STACK_BLS_USER
            VUE_APP_NODERED_PASSWORD=$LINTO_STACK_BLS_PASSWORD
            VUE_APP_DEBUG=$VUE_APP_DEBUG" >.env.production
        fi
            npm run build-app
        ;;
    --rebuild-vue-app-dev)
        cd /usr/src/app/linto-admin/vue_app
        echo "REBUILDING VUE APP IN DEVELOPMENT MODE"
        if [[ "$LINTO_STACK_USE_SSL" == true ]]; then
            echo "VUE_APP_URL=
            VUE_APP_TOCK_URL=https://$LINTO_STACK_DOMAIN/tock/
            VUE_APP_TOCK_USER=$LINTO_STACK_TOCK_USER
            VUE_APP_TOCK_PASSWORD=$LINTO_STACK_TOCK_PASSWORD
            VUE_APP_NODERED_RED=https://$LINTO_STACK_DOMAIN/red
            VUE_APP_NODERED=https://$LINTO_STACK_DOMAIN/redui
            VUE_APP_NODERED_USER=$LINTO_STACK_BLS_USER
            VUE_APP_NODERED_PASSWORD=$LINTO_STACK_BLS_PASSWORD
            VUE_APP_DEBUG=$VUE_APP_DEBUG" >.env.development
        else
            echo "VUE_APP_URL=
            VUE_APP_TOCK_URL=http://$LINTO_STACK_DOMAIN/tock/
            VUE_APP_TOCK_USER=$LINTO_STACK_TOCK_USER
            VUE_APP_TOCK_PASSWORD=$LINTO_STACK_TOCK_PASSWORD
            VUE_APP_NODERED_RED=http://$LINTO_STACK_DOMAIN/red
            VUE_APP_NODERED=http://$LINTO_STACK_DOMAIN/redui
            VUE_APP_NODERED_USER=$LINTO_STACK_BLS_USER
            VUE_APP_NODERED_PASSWORD=$LINTO_STACK_BLS_PASSWORD
            VUE_APP_DEBUG=$VUE_APP_DEBUG" >.env.development
        fi
            npm run build-dev
        ;;
    --reinstall-vue-app)
        cd /usr/src/app/linto-admin/vue_app
        echo "REINSTALL VUE APP"
        npm install
        ;;
    --reinstall-webserver)
        echo "REBUILDING WEBSERVER APP"
        cd /usr/src/app/linto-admin/webserver
        npm install
        ;;
    --run-cmd)
        if [ "$2" ]; then
            script=$2
            shift
        else
            die 'ERROR: "--run-cmd" requires a non-empty option argument.'
        fi
        ;;
    --run-cmd?*)
        script=${1#*=} # Deletes everything up to "=" and assigns the remainder.
        ;;
    --run-cmd=) # Handle the case of an empty --run-cmd=
        die 'ERROR: "--run-cmd" requires a non-empty option argument.'
        ;;
    *)
        echo "ERROR: Bad argument provided \"$1\""
        exit 1
        ;;
    esac
    shift
done

echo "RUNNING : $script"
cd /usr/src/app/linto-admin/webserver

eval "$script"