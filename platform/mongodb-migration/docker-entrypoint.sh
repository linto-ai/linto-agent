#!/bin/bash
set -e
[ -z "$LINTO_STACK_MONGODB_TARGET_VERSION" ] && {
    echo "Missing LINTO_STACK_MONGODB_TARGET_VERSION"
    exit 1
}
echo "Waiting mongo..."
/wait-for-it.sh $LINTO_STACK_MONGODB_SERVICE:$LINTO_STACK_MONGODB_PORT --timeout=20 --strict -- echo " $LINTO_STACK_MONGODB_SERVICE:$LINTO_STACK_MONGODB_PORT is up"

while [ "$1" != "" ]; do
    case $1 in
    --migrate)
        cd /usr/src/app/linto-platform-mongodb-migartion
        npm install && npm run migrate
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
cd /usr/src/app/linto-platform-mongodb-migration

eval "$script"
