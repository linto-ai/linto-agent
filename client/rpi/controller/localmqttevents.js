/**
 * Events from app.localmqtt
 */
const debug = require('debug')(`linto-client:localmqtt:events`)

function localMqttEvents(app) {
    if (!app.localmqtt || !app.logicmqtt || !app.audio) return

    app.localmqtt.on("localmqtt::wuw/spotted", async (payload) => {
        return
    })

    app.localmqtt.on("localmqtt::utterance/stop", async (payload) => {
        if (payload.reason === "canceled" || payload.reason === "timeout") return
        const audioStream = app.audio.mic.readStream()
        // Notify for new request beign sent
        app.localmqtt.publish("request/send", {
            "on": new Date().toJSON()
        }, 0, false, true)
        const audioRequestID = await app.logicmqtt.publishaudio(audioStream, app.conversationData)
        debug("conversationData reset")
        app.conversationData = {}
        app.audio.nlpProcessing.push(audioRequestID)
    })
}

module.exports = localMqttEvents