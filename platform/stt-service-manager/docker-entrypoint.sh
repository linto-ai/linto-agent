#!/bin/bash
set -e

echo "Waiting mongo..."
./wait-for-it.sh $LINTO_STACK_STT_SERVICE_MANAGER_MONGODB_HOST:$LINTO_STACK_STT_SERVICE_MANAGER_MONGODB_PORT --timeout=20 --strict -- echo " $LINTO_STACK_STT_SERVICE_MANAGER_MONGODB_HOST:$LINTO_STACK_STT_SERVICE_MANAGER_MONGODB_PORT is up"

if [ ${LINTO_STACK_STT_SERVICE_MANAGER_INGRESS_CONTROLLER} == "nginx" ]; then
    echo "Waiting nginx..."
    ./wait-for-it.sh $LINTO_STACK_STT_SERVICE_MANAGER_NGINX_HOST:80 --timeout=20 --strict -- echo " $LINTO_STACK_STT_SERVICE_MANAGER_NGINX_HOST:80 is up"
fi

while [ "$1" != "" ]; do
    case $1 in
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
cd /usr/src/app

eval "$script"