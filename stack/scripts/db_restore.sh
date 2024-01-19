#!/bin/sh

. ../.dockerenv

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

set -e

HOST_BACKUPS_DIR=$HOME/${LINTO_STACK_MONGODB_VOLUME_NAME}/.dbbackup # Host backup folder
DOCKER_BACKUPS_DIR=/data/backup # Docker backup folder Backup desired folder

echo Available backup file : $GREEN
find ${HOST_BACKUPS_DIR} -name "*.tar.gz" -printf "\t%f\n"
echo $NC
read -r BACKUP_NAME

BACKUP_NAME_SIZE=`expr length $BACKUP_NAME - 18` # 18
DOCKER_IMAGE_NAME=`echo $BACKUP_NAME | cut -c 1-$BACKUP_NAME_SIZE`
DOCKER_IMAGE_ID=`docker ps | grep $DOCKER_IMAGE_NAME | awk '{print $1;}'`

# Command line argument by the user to specify the backup version to restore.
HOST_BACKUP_FILE=$HOST_BACKUPS_DIR/$BACKUP_NAME
DOCKER_BACKUP_FILE=$DOCKER_BACKUPS_DIR/$BACKUP_NAME

echo ${GREEN}`date` Restoring from $DOCKER_BACKUP_FILE${NC}

if [ -f $HOST_BACKUP_FILE ]
then
  echo Uncompressing backup tarball $HOST_BACKUP_FILE
  cd $HOST_BACKUPS_DIR
  tar -zxvf $BACKUP_NAME

  echo Restoring from $DOCKER_BACKUP_FILE
  DOCKER_CMD_SUCCES=true
  docker exec -it $DOCKER_IMAGE_ID mongorestore $DOCKER_BACKUP_FILE --drop || DOCKER_CMD_SUCCES=false
  if [ "$DOCKER_CMD_SUCCES" = true ]; then
    echo ${GREEN}`date` Restore successful${NC}
    echo `date` Mongo backup complete for $MONGO_IMAGE
  else
    echo ${RED}`date` Error during restoring $BACKUP_NAME on the image $DOCKER_IMAGE_NAME
  fi

else
  echo ${RED}`date` Backup tarball $HOST_BACKUP_FILE.tar.gz not found!${NC}
fi