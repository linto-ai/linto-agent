#!/bin/bash

echo 'PULL IMAGE'
echo 'pull lintoai/linto-platform-business-logic-server'
docker pull lintoai/linto-platform-business-logic-server
echo 'pull lintoai/linto-platform-admin'
docker pull lintoai/linto-platform-admin
echo 'pull lintoai/linto-platform-overwatch'
docker pull lintoai/linto-platform-overwatch
echo 'pull lintoai/linto-platform-stt-worker-client'
docker pull lintoai/linto-platform-stt-worker-client
echo 'pull lintoai/linto-platform-stt-server'
docker pull lintoai/linto-platform-stt-server
echo 'pull lintoai/linto-platform-stt-standalone-worker'
docker pull lintoai/linto-platform-stt-standalone-worker
echo 'ALL IMAGE HAS BEEN PULLED'