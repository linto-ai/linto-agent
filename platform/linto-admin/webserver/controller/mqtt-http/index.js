const debug = require('debug')(`linto-admin:mqtt-http`)

module.exports = function() {
    this.mqttMonitor.client.on('mqtt-monitor::message', async(payload) => {
        debug(payload)
        const toNotify = ['pong', 'status', 'muteack', 'unmuteack', 'notify_app'] // Array of messages that are to be notified on front
        const msgType = payload.topicArray[3]

        if (toNotify.indexOf(msgType) >= 0) {
            this.webServer.ioHandler.notify(msgType, payload)
        }
    })

    this.webServer.ioHandler.on('linto_subscribe', (data) => {
        this.mqttMonitor.subscribe(data)
    })

    this.webServer.ioHandler.on('linto_subscribe_all', (data) => {
        this.mqttMonitor.subscribe({})
    })

    this.webServer.ioHandler.on('linto_unsubscribe_all', (data) => {
        this.mqttMonitor.unsubscribe({})
    })

    this.webServer.ioHandler.on('linto_ping', (data) => {
        this.mqttMonitor.ping(data)
    })

    this.webServer.ioHandler.on('linto_say', (data) => {
        this.mqttMonitor.lintoSay(data)
    })

    this.webServer.ioHandler.on('linto_volume', (data) => {
        this.mqttMonitor.setVolume(data)
    })

    this.webServer.ioHandler.on('linto_volume_end', (data) => {
        this.mqttMonitor.setVolumeEnd(data)
    })
    this.webServer.ioHandler.on('linto_mute', (data) => {
        this.mqttMonitor.mute(data)
    })
    this.webServer.ioHandler.on('linto_unmute', (data) => {
        this.mqttMonitor.unmute(data)
    })

}