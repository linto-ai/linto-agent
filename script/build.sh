#!/bin/bash
docker-compose \
  -f nginx-ingress/docker-compose.yml \
  -f admin/docker-compose.yml \
  -f tock/docker-compose.yml \
  -f business-logic-server/docker-compose.yml \
  -f mqtt-broker/docker-compose.yml \
  -f stt-server-worker-client/fr/docker-compose.yml \
  -f stt-server-worker-client/en/docker-compose.yml \
  -f overwatch/docker-compose.yml build
  # -f haproxy/docker-compose.yml build