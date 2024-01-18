# LinTO Platform Services Broker
The service broker is the heart of the LinTO micro-service architecture.

Based on redis-stack-server, the service broker is the communication pipeline between services and subservices.

Its purposes are:
* Provide communication channels between services using dedicated message queues to submit tasks and provide results.
* Allows stack-wide service discovery.

# DBs
By convention within the LinTO-stack, 3 redis dbs are used:
* db=0: Is assigned to celery task.
* db=1: Is assigned to celery result's backend.
* db=2: Is reserved for service registration and discovery.

# Build
```bash
git clone 
cd linto-platform-services-broker
docker build -t lintoai/linto_services_broker:latest .
```
or
```bash
docker pull registry.linto.ai/lintoai/linto_services_broker:latest
```

# Run
As a container:
```bash
docker run \
-p $MY_BROKER_PORT:6379 \
--name services_broker \
linto_services_broker:latest \
redis-stack-server /usr/local/etc/redis/redis.conf \
--requirepass $SERVICE_BROKER_PASSWORD
```

As a service:
```yml
version: '3.7'

services:
  services-broker:
      image: linto_service_broker:stack
      deploy:
        replicas: 1
      ports:
        - 6379:6379
      networks:
        - $LINTO_STACK_NETWORK
      command: /bin/sh -c "redis-stack-server /usr/local/etc/redis/redis.conf  --requirepass $SERVICE_BROKER_PASSWORD"

networks:
  $LINTO_STACK_NETWORK: 
    external: true
```

# Broker configuration file
The broker default configuration file can be overided by mounting a config file on /usr/local/etc/redis/redis.conf. 