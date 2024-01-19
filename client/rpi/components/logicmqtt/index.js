const moduleName = 'logicmqtt'
const debug = require('debug')(`linto-client:${moduleName}`)
const EventEmitter = require('eventemitter3')
const Mqtt = require('mqtt')
const stream = require('stream')



class LogicMqtt extends EventEmitter {
    constructor(app) {
        super()
        this.app = app
        this.pubTopicRoot = `${app.terminal.info.config.mqtt.scope}/${app.terminal.info.config.mqtt.frommetopic}/${app.terminal.info.sn}`
        this.subTopic = `${app.terminal.info.config.mqtt.scope}/${app.terminal.info.config.mqtt.towardsmetopic}/${app.terminal.info.sn}/#`
        this.cnxParam = {
            protocol: app.terminal.info.config.mqtt.protocol,
            clean: true,
            servers: [{
                host: app.terminal.info.config.mqtt.host,
                port: app.terminal.info.config.mqtt.port
            }],
            keepalive: parseInt(app.terminal.info.config.mqtt.keepalive), //can live for LOCAL_MQTT_KEEP_ALIVE seconds without a single message sent on broker
            reconnectPeriod: Math.floor(Math.random() * 1000) + 1000, // ms for reconnect,
            will: {
                topic: `${this.pubTopicRoot}/status`,
                retain: true,
                payload: JSON.stringify({
                    connexion: "offline"
                })
            },
            qos: 2
        }

        if (app.terminal.info.config.mqtt.uselogin) {
            this.cnxParam.username = app.terminal.info.config.mqtt.username
            this.cnxParam.password = app.terminal.info.config.mqtt.password
        }

        this.on(`${moduleName}::connect`, () => {
            console.log(`${new Date().toJSON()} Logic MQTT connexion up`)
            this.publishStatus()
        })
        return this.init(app)
    }

    async init(app) {
        return new Promise((resolve, reject) => {
            this.client = Mqtt.connect(this.cnxParam)
            this.client.on("error", e => {
                console.error(`${new Date().toJSON()} Logic MQTT broker error ${e}`)
            })
            this.client.on("connect", () => {
                this.emit(`${moduleName}::connect`)
                //clear any previous subsciptions
                this.client.unsubscribe(this.subTopic, (err) => {
                    if (err) debug('disconnecting while unsubscribing', err)
                    //Subscribe to the client topics
                    debug(`subscribing topics...`)
                    this.client.subscribe(this.subTopic, (err) => {
                        if (!err) {
                            debug(`subscribed successfully to ${this.subTopic}`)
                        } else {
                            debug(err)
                        }
                    })
                })
            })

            this.client.on("offline", () => {
                app.localmqtt.publish(`disconnected`, { //send retained connected status
                    "connexion": "offline",
                    "on": new Date().toJSON()
                }, 0, false, true)
                console.error(`${new Date().toJSON()} Logic MQTT connexion down `)
            })

            this.client.on('message', (topic, payload) => {
                try {
                    let topicArray = topic.split("/")
                    payload = JSON.parse(payload.toString())
                    payload = Object.assign(payload, {
                        topicArray
                    })
                    this.emit(`${moduleName}::message`, payload)
                } catch (err) {
                    debug(err)
                }
            })
            app[moduleName] = this
            resolve(app)
        })
    }

    publish(topic, value, qos = 2, retain = false, requireOnline = false) {
        const pubTopic = this.pubTopicRoot + '/' + topic
        const pubOptions = {
            "qos": qos,
            "retain": retain
        }
        if (requireOnline === true) {
            if (this.client.connected === true) {
                this.client.publish(pubTopic, JSON.stringify(value), pubOptions, function (err) {
                    if (err) debug("publish error", err)
                })
            }
        } else {
            this.client.publish(pubTopic, JSON.stringify(value), pubOptions, function (err) {
                if (err) debug("publish error", err)
            })
        }
    }

    publishaudio(audioStream, conversationData = {}) {
        const FileWriter = require('wav').FileWriter
        const outputFileStream = new FileWriter('/tmp/command.wav', {
            sampleRate: 16000,
            channels: 1
        })
        audioStream.pipe(outputFileStream)
        const pubOptions = {
            "qos": 0,
            "retain": false
        }
        const fileId = Math.random().toString(16).substring(4)
        const pubTopic = `${this.pubTopicRoot}/nlp/file/${fileId}`
        return new Promise((resolve, reject) => {
            try {
                let fileBuffers = []
                outputFileStream.on('data', (data) => {
                    fileBuffers.push(data)
                })
                outputFileStream.on('end', () => {
                    let sendFile = Buffer.concat(fileBuffers)
                    sendFile = sendFile.toString('base64')
                    const payload = {
                        "audio": sendFile,
                        "conversationData": conversationData
                    }
                    this.client.publish(pubTopic, JSON.stringify(payload), pubOptions, (err) => {
                        if (err) return reject(err)
                        resolve(fileId)
                    })
                })
            } catch (e) {
                console.log(e)
            }

        })
    }

    publishStatus() {
        this.app.terminal.info.connexion = "online"
        this.app.terminal.info.on = new Date().toJSON()
        this.publish(`status`, this.app.terminal.info, 0, true, true)
        this.app.localmqtt.publish(`connected`, { //send retained connected status in lintoclient/connected
            "connexion": "online",
            "on": new Date().toJSON()
        }, 0, true, true)
    }
}

module.exports = LogicMqtt