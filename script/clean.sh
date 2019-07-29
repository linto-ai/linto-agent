#!/bin/bash
docker stop $(docker ps -a -q)
docker container prune
docker image prune