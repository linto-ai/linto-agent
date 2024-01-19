#!/bin/sh

. ../.dockerenv 

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

set -e

echo 'Chosse the desired docker to backup : '$GREEN'\n'
docker ps --filter "name=bls" --format '{{.Names}}'
echo $NC 'Docker id : '
read -r DOCKER_IMAGE_NAME
echo

DOCKER_IMAGE_ID=`docker ps | grep $DOCKER_IMAGE_NAME| awk '{print $1;}'`

BACKUP_NAME=$DOCKER_IMAGE_NAME-`date +%F`
BACKUP_PATH=${LINTO_SHARED_MOUNT}/.bls/backup
mkdir -p ${BACKUP_PATH}

cd ${LINTO_SHARED_MOUNT}/.bls
sudo tar -zcvf $BACKUP_PATH/$BACKUP_NAME.tar.gz  --exclude='*.tar.gz' ./