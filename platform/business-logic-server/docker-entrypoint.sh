#!/bin/bash
set -e

install_linto_node_module(){
  npm install @linto-ai/node-red-linto-core
  npm install @linto-ai/node-red-linto-calendar @linto-ai/node-red-linto-datetime @linto-ai/node-red-linto-definition @linto-ai/node-red-linto-meeting @linto-ai/node-red-linto-memo @linto-ai/node-red-linto-news @linto-ai/node-red-linto-pollution @linto-ai/node-red-linto-weather @linto-ai/node-red-linto-welcome
}

install_by_node_registry(){
  npm set registry $1
  install_linto_node_module
}

set_node_registry(){
  npm set registry $1
}

[ -z "$LINTO_STACK_DOMAIN" ] && {
    echo "Missing LINTO_STACK_DOMAIN"
    exit 1
}
[ -z "$LINTO_STACK_BLS_SERVICE_UI_PATH" ] && {
    echo "Missing LINTO_STACK_BLS_SERVICE_UI_PATH"
    exit 1
}



while [ "$1" != "" ]; do
    case $1 in
    --default-registry-npmrc)
         install_by_node_registry https://registry.npmjs.com/
        ;;
    --set-custom-registry-npmrc)
          [ -z "$LINTO_STACK_NPM_CUSTOM_REGISTRY" ] && {
            echo "Missing LINTO_STACK_NPM_CUSTOM_REGISTRY"
            exit 1
          }
          set_node_registry $LINTO_STACK_NPM_CUSTOM_REGISTRY
        ;;
    --custom-registry-npmrc)
          [ -z "$LINTO_STACK_NPM_CUSTOM_REGISTRY" ] && {
            echo "Missing LINTO_STACK_NPM_CUSTOM_REGISTRY"
            exit 1
          }
          install_by_node_registry $LINTO_STACK_NPM_CUSTOM_REGISTRY
        ;;
    --reinstall)
          install_linto_node_module
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
cd /usr/src/app/business-logic-server
eval "$script"