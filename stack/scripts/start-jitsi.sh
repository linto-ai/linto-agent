#!/bin/bash
set -uea

SUDO=''
. .dockerenv # Source all env

###########################################
###      JITSI SETUP      ###
###########################################

cp ./config/jitsi/env/.jitsienv .jitsienv
. .jitsienv # Source all env

###########################################
###      Reset Jitsi Configuration      ###
###########################################

sudo rm -rf $LINTO_SHARED_MOUNT/jitsi
mkdir -p $LINTO_SHARED_MOUNT/jitsi/{jigasijar,web/letsencrypt,transcripts,prosody/config,/prosody/conf.d,/prosody/defaults/conf.d,prosody/prosody-plugins-custom,/prosody/data/auth%2etranscriber%2emeet%2ejitsi/accounts,jicofo,jvb,jigasi,jigasi/startup,jibri}

###########################################
###        PROSODY Configuration        ###
###########################################

envsubst < ./config/jitsi/prosody/conf.d/jitsi-meet.cfg.lua> ${LINTO_SHARED_MOUNT}/jitsi/prosody/defaults/conf.d/jitsi-meet.cfg.lua
envsubst < ./config/jitsi/prosody/user/prosody-user.dat > ${LINTO_SHARED_MOUNT}/jitsi/prosody/data/auth%2etranscriber%2emeet%2ejitsi/accounts/${JIGASI_TRANSCRIBER_XMPP_USER}.dat

###########################################
###         JIGASI Configuration        ###
###########################################

envsubst < ./config/jitsi/jigasi/sip-communicator.properties > ${LINTO_SHARED_MOUNT}/jitsi/jigasi/custom-sip-communicator.properties

###########################################
###           WEB Configuration         ###
###########################################

envsubst < config/jitsi/web/custom-config.js > ${LINTO_SHARED_MOUNT}/jitsi/web/custom-config.js

###########################################
###             Start Jitsi             ###
###########################################

# docker stack deploy --compose-file ./stack-files/linto-platform-jitsi.yml linto_jitsi

LABELS=""
if [[ "$LINTO_STACK_USE_SSL" == true ]]; then
    LABELS="${LABELS}, *ssl"
    [[ "$LINTO_STACK_USE_ACME" == true ]] && LABELS="${LABELS}, *acme"
fi


sed -e "s/<<: \[ \(.*\) \]/<<: [ \1${LABELS} ]/" ./optional-stack-files/linto-platform-jitsi.yml  \
| docker stack deploy --resolve-image always --compose-file - linto_stack