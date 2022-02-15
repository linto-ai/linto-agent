# Infrastructure
This repo provides a tool that tries to solve all the burden of deploying Jitsi with our proposed Docker images

## Start Jitsi
The whole point here is to rationalize all your deployment in a few quick steps:

1. Copy the template : `cp ./config/jitsi/env/.jitsienv_template ./config/jitsi/env/.jitsienv`
2. Configure the service stack options by filling-up environement variables in `.jitsienv`
3. Configure a local Docker Swarm network for your service communications
4. Don't forget to enable the stack to start jitsi : `LINTO_STACK_ENABLE_JITSI=true` in your **.dockerenv**
5. Run the `start.sh` script on a manager node of your cluster

# Repository
You can find your custom Jitsi repository :
 - [linto-ai/linto-jitsi](https://github.com/linto-ai/linto-jitsi)

# WIP 
UDP and TCP are not configured yet for traefik. 