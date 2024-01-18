const debug = require('debug')(`linto-admin:mqtt-monitor`)
const EventEmitter = require('eventemitter3')
const Mqtt = require('mqtt')

class MqttMonitor extends EventEmitter {
    constructor(scope) {
        super()

        this.scope = scope
        this.client = null
        this.subscribtionTopics = []
        this.cnxParam = {
            clean: true,
            servers: [{
                host: process.env.LINTO_STACK_MQTT_HOST,
                port: process.env.LINTO_STACK_MQTT_PORT
            }],
            qos: 2
        }
        if (process.env.LINTO_STACK_MQTT_USE_LOGIN) {
            this.cnxParam.username = process.env.LINTO_STACK_MQTT_USER
            this.cnxParam.password = process.env.LINTO_STACK_MQTT_PASSWORD
        }
        this.isSubscribed = false

        this.init()

        return this
    }

    async init() {
        return new Promise((resolve, reject) => {
            let cnxError = setTimeout(() => {
                console.error('Logic MQTT Broker - Unable to connect')
            }, 5000)
            this.client = Mqtt.connect(this.cnxParam)
            this.client.on('error', e => {
                console.error('Logic MQTT Broker error : ' + e)
            })
            this.client.on('connect', () => {
                console.log('> Logic MQTT Broker: Connected')
                this.unsubscribe()
            })

            this.client.once('connect', () => {
                clearTimeout(cnxError)
                this.client.on('offline', () => {
                    debug('Logic MQTT Broker connexion down')
                })
                resolve(this)
            })

            this.client.on('message', (topics, payload) => {
                try {
                    debug(topics, payload)
                    let topicArray = topics.split('/')
                    payload = payload.toString()

                    payload = JSON.parse(payload)
                    payload = Object.assign(payload, {
                        topicArray
                    })
                    this.client.emit(`mqtt-monitor::message`, payload)
                } catch (err) {
                    debug(err)
                }
            })
        })
    }
    subscribe(data) {
        let range = '+'
        if (!!data.sn) {
            range = data.sn
        }
        // Unsubscribe current Topics
        this.unsubscribe()

        // Set new topics
        this.subscribtionTopics['status'] = `${this.scope}/fromlinto/${range}/status`
        this.subscribtionTopics['pong'] = `${this.scope}/fromlinto/${range}/pong`
        this.subscribtionTopics['muteack'] = `${this.scope}/fromlinto/${range}/muteack`
        this.subscribtionTopics['unmuteack'] = `${this.scope}/fromlinto/${range}/unmuteack`
        this.subscribtionTopics['tts_lang'] = `${this.scope}/fromlinto/${range}/tts_lang`
        this.subscribtionTopics['say'] = `${this.scope}/fromlinto/${range}/say`

        // Subscribe to new topics
        for (let index in this.subscribtionTopics) {
            const topic = this.subscribtionTopics[index]

            //Subscribe to the client topics
            this.client.subscribe(topic, (err) => {
                if (!err) {
                    this.isSubscribed = true
                    debug(`subscribed successfully to ${topic}`)
                } else {
                    console.error(err)
                }
            })
        }
    }

    unsubscribe() {
        if (this.isSubscribed) {
            for (let index in this.subscribtionTopics) {
                const topic = this.subscribtionTopics[index]
                this.client.unsubscribe(topic, (err) => {
                    if (err) console.error('disconnecting while unsubscribing', err)
                    debug('Unsubscribe to : ', topic)
                    this.isSubscribed = false
                })
            }
        }
    }
    ping(payload) {
        try {
            this.client.publish(`${this.scope}/tolinto/${payload.sn}/ping`, '{}', (err) => {
                if (err) {
                    throw err
                }
            })
        } catch (error) {
            console.error(error)
            this.client.emit('tolinto_debug', {
                status: 'error',
                message: 'error on pong response',
                error
            })
        }
    }

    lintoSay(payload) {
        try {
            this.client.publish(`${this.scope}/tolinto/${payload.sn}/say`, `{"value":"${payload.value}"}`, (err) => {
                if (err) {
                    throw err
                }
            })
        } catch (error) {
            console.error(error)
            this.client.emit('tolinto_debug', {
                status: 'error',
                message: 'error on linto say',
                error
            })
        }
    }
    mute(payload) {
        try {
            this.client.publish(`${this.scope}/tolinto/${payload.sn}/mute`, '{}', (err) => {
                if (err) {
                    throw err
                }
            })
        } catch (error) {
            console.error(error)
            this.client.emit('tolinto_debug', {
                status: 'error',
                message: 'error on linto mute',
                error
            })
        }
    }

    unmute(payload) {
        try {
            this.client.publish(`${this.scope}/tolinto/${payload.sn}/unmute`, '{}', (err) => {
                if (err) {
                    throw err
                }
            })
        } catch (error) {
            console.error(error)
            this.client.emit('tolinto_debug', {
                status: 'error',
                message: 'error on unmute ack',
                error
            })
        }
    }

    setVolume(payload) {
        try {
            this.client.publish(`${this.scope}/tolinto/${payload.sn}/volume`, `{"value":"${payload.value}"}`, (err) => {
                if (err) {
                    throw err
                }
            })
        } catch (error) {
            console.error(error)
            this.client.emit('tolinto_debug', {
                status: 'error',
                message: 'error on setting volume',
                error
            })
        }
    }
    setVolumeEnd(payload) {
        try {
            this.client.publish(`${this.scope}/tolinto/${payload.sn}/endvolume`, `{"value":"${payload.value}"}`, (err) => {
                if (err) {
                    throw err
                }
            })
        } catch (error) {
            console.error(error)
            this.client.emit('tolinto_debug', {
                status: 'error',
                message: 'error on setting volume',
                error
            })
        }
    }
}

module.exports = scope => new MqttMonitor(scope)