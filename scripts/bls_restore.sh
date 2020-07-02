#!/bin/sh

. ../.dockerenv

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

set -e
HOST_BLS_DIR=${LINTO_SHARED_MOUNT}/.bls/
HOST_BLS_BACKUP_DIR=${HOST_BLS_DIR}/backup # Host backup folder

echo Available backup file : $GREEN
find ${HOST_BLS_BACKUP_DIR} -name "*.tar.gz" -printf "\t%f\n"
echo $NC
read -r BACKUP_NAME



echo ${GREEN}`date` Restoring from $DOCKER_BACKUP_FILE${NC}

cd $HOST_BLS_DIR
if [ -f $HOST_BACKUP_FILE ]
then
  echo Uncompressing backup tarball $HOST_BACKUP_FILE
  sudo rm -r ./lib
  sudo rm -r ./node_modules
  sudo rm *.json
  sudo tar -C . -zxvf $HOST_BLS_BACKUP_DIR/$BACKUP_NAME

  echo ${GREEN}`date` Restore successful${NC}
  echo `date` Mongo backup complete for $MONGO_IMAGE
else
  echo ${RED}`date` Backup tarball $HOST_BACKUP_FILE.tar.gz not found!${NC}
fi