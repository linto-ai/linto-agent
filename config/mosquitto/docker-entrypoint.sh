#!/bin/ash
set -e
if [ "$LINTO_STACK_MQTT_USE_LOGIN" == true ]
then
[ -z "$LINTO_STACK_MQTT_USER" ] && { echo "Missing MQTT_USER"; exit 1; }
[ -z "$LINTO_STACK_MQTT_PASSWORD" ] && { echo "Missing MQTT_PASSWORD"; exit 1; }
echo ${LINTO_STACK_MQTT_USER}:${LINTO_STACK_MQTT_PASSWORD} > /mosquitto/config/mosquitto_passwd_file
mosquitto_passwd -U /mosquitto/config/mosquitto_passwd_file
fi
exec "$@"