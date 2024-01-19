const debug = require('debug')('linto-overwatch:overwatch:watcher')
const Mqtt = require('mqtt')

const mqttControllerStatus = require('./mqttController/status')

class WatcherMqtt {
  constructor() {
    this.register = []
    this.subTopic = '#'

    this.configMqtt = {
      clean: true,
      servers: [{
        host: process.env.LINTO_STACK_MQTT_HOST,
        port: process.env.LINTO_STACK_MQTT_PORT
      }],
      keepalive: parseInt(process.env.LINTO_STACK_MQTT_KEEP_ALIVE), //can live for LOCAL_LINTO_STACK_MQTT_KEEP_ALIVE seconds without a single message sent on broker
      reconnectPeriod: Math.floor(Math.random() * 1000) + 1000, // ms for reconnect,
      qos: 2
    }

    if (process.env.LINTO_STACK_MQTT_USE_LOGIN === 'true') {
      this.configMqtt.username = process.env.LINTO_STACK_MQTT_USER
      this.configMqtt.password = process.env.LINTO_STACK_MQTT_PASSWORD
    }

    return this.init()
  }

  async init() {
    return new Promise((resolve, reject) => {
      let cnxError = setTimeout(() => {
        debug('Timeout')
        console.error('Unable to connect to Broker')
        return reject('Unable to connect')
      }, 2000)

      this.client = Mqtt.connect(this.configMqtt)
      this.client.on('error', e => {
        console.error('broker error : ' + e)
      })

      this.client.on('connect', () => {
        //clear any previous subsciptions
        this.client.unsubscribe(this.subTopic, (err) => {
          if (err) debug('disconnecting while unsubscribing', err)
          //Subscribe to the client topics
          debug(`subscribing topics...`)
          this.client.subscribe(this.subTopic, (err) => {
            if (!err) {
              debug(`subscribed successfully to ${this.subTopic}`)
            } else {
              console.error(err)
            }
          })
        })
      })

      this.client.once('connect', () => {
        clearTimeout(cnxError)
        this.client.on('offline', () => {
          console.error('broker connexion down')
        })
        resolve(this)
      })

      this.client.on('message', async (topic, payload) => {
        try {
          const [_clientCode, _channel, _sn, _etat, _type, _id] = topic.split('/')
          switch (_etat) {
            case 'status':
              mqttControllerStatus(topic, payload)
              break
            default:
              break
          }
        } catch (err) {
          console.error(err)
        }
      })
    })
  }
}

module.exports = WatcherMqtt