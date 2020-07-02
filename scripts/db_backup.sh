#!/bin/sh

. ../.dockerenv 

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

set -e

echo 'Chosse the desired docker to backup : '$GREEN'\n'
docker ps --filter "name=mongo" --format '{{.Names}}'
echo $NC 'Docker id : '
read -r DOCKER_IMAGE_NAME
echo

# Based on Docker-compose volume
DOCKER_IMAGE_ID=`docker ps | grep $DOCKER_IMAGE_NAME| awk '{print $1;}'`
HOST_BACKUPS_DIR=$HOME/${LINTO_STACK_MONGODB_VOLUME_NAME}/.dbbackup # Host backup folder
DOCKER_BACKUPS_DIR=/data/backup # Docker backup folder Backup desired folder


# Creates backup names like 2019-04-23
BACKUP_NAME=$DOCKER_IMAGE_NAME-`date +%F`
HOST_BACKUP_FILE=$HOST_BACKUPS_DIR/$BACKUP_NAME
DOCKER_BACKUP_FILE=$DOCKER_BACKUPS_DIR/$BACKUP_NAME

# Do not keep backups older than 15 days.
BACKUP_TTL_DAYS=15

echo `date` Backing up in $DOCKER_BACKUP_FILE
DOCKER_CMD_SUCCES=true
docker exec $DOCKER_IMAGE_ID mongodump --out $DOCKER_BACKUP_FILE || DOCKER_CMD_SUCCES=false
if [ "$DOCKER_CMD_SUCCES" = true ]; then

  echo Compressing backup folder $HOST_BACKUPS_DIR to tar file : $BACKUP_NAME.tar.gz
  cd $HOST_BACKUPS_DIR
  tar -zcvf $BACKUP_NAME.tar.gz $BACKUP_NAME

  echo Removing backup directory $HOST_BACKUP_FILE
  sudo rm -rf $HOST_BACKUP_FILE

  echo Deleting backup tarballs older than $BACKUP_TTL_DAYS days in $HOST_BACKUPS_DIR
  echo ${GREEN}`date` Mongo backup complete for $DOCKER_IMAGE_NAME ${NC}
  echo `date` Mongo backup successful
else
  echo ${RED}`date` Error whild backing $DOCKER_IMAGE_NAME ${NC}
fi