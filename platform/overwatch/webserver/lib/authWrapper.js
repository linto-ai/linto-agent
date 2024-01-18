const debug = require('debug')('linto-overwatch:overwatch:webserver:lib:authWrapper')

class AuthWrapper {
  formatAuthAndroid(user) {
    let mqttConfig = {
      mqtt_host: process.env.LINTO_STACK_DOMAIN,
      mqtt_port: process.env.LINTO_STACK_MQTT_PORT,
      mqtt_use_login: false
    }

    if (process.env.LINTO_STACK_MQTT_USE_LOGIN === 'true') {
      mqttConfig.mqtt_use_login = true
      mqttConfig.mqtt_login = user.mqtt.mqtt_login
      mqttConfig.mqtt_password = user.mqtt.mqtt_password
    }

    return {
      user: { ...user.token },
      mqtt: mqttConfig
    }
  }

  formatAuthWeb(user) {
    let mqttConfig = {
      host: 'ws://',
      mqtt_use_login: false
    }

    if (process.env.LINTO_STACK_WSS === 'true') mqttConfig.host = 'wss://'

    mqttConfig.host += process.env.LINTO_STACK_DOMAIN
    mqttConfig.host += process.env.LINTO_STACK_MQTT_OVER_WS_ENDPOINT

    if (process.env.LINTO_STACK_MQTT_USE_LOGIN === 'true') {
      mqttConfig.mqtt_use_login = true
      mqttConfig.mqtt_login = user.mqtt.mqtt_login
      mqttConfig.mqtt_password = user.mqtt.mqtt_password
    }

    return {
      user: { ...user.token },
      mqttConfig
    }
  }
}

module.exports = new AuthWrapper()