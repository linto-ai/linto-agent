// import Linto from '../dist/linto.min.js'
import Linto from '../src/linto.js'

let mqttConnectHandler = function(event) {
    console.log("mqtt up !")
}

let mqttConnectFailHandler = function(event) {
    console.log("Mqtt failed to connect : ")
    console.log(event)
}

let mqttErrorHandler = function(event) {
    console.log("An MQTT error occured : ", event.detail)
}

let mqttDisconnectHandler = function(event) {
    console.log("MQTT Offline")
}

let audioSpeakingOn = function(event) {
    console.log("Speaking")
}

let audioSpeakingOff = function(event) {
    console.log("Not speaking")
}

let commandAcquired = function(event) {
    console.log("Command acquired")
}

let commandPublished = function(event) {
    console.log("Command published id :", event.detail)
}

let actionAcquired = function(event) {
    console.log("action acquired")
}

let actionPublished = function(event) {
    console.log("action published id :", event.detail)
}

let actionFeedback = function(event) {
    console.log("action feedback :", event)
}

let actionError = function(event) {
    console.log("action error :", event)
}

let textAcquired = function(event) {
    console.log("text acquired")
}

let textPublished = function(event) {
    console.log("text published id :", event.detail)
}

let chatbotAcquired = function(event) {
    console.log("chatbot text acquired")
}

let chatbotPublished = function(event) {
    console.log("chatbot text published id :", event.detail)
}

let widgetFeedback = function(event) {
    console.log("chatbot feedback :", event)
}

let chatbotError = function(event) {
    console.log("chatbot error :", event)
}

let hotword = function(event) {
    console.log("Hotword triggered : ", event.detail)
}

let commandTimeout = function(event) {
    console.log("Command timeout, id : ", event.detail)
}

let sayFeedback = async function(event) {
    console.log("Saying : ", event.detail.behavior.say.text, " ---> Answer to : ", event.detail.transcript)
    await linto.say(linto.lang, event.detail.behavior.say.text)
}

let askFeedback = async function(event) {
    console.log("Asking : ", event.detail.behavior.ask.text, " ---> Answer to : ", event.detail.transcript)
    await linto.ask(linto.lang, event.detail.behavior.ask.text)
}

let streamingChunk = function(event) {
    if (event.detail.behavior.streaming.partial)
        console.log("Streaming chunk received : ", event.detail.behavior.streaming.partial)
    if (event.detail.behavior.streaming.text)
        console.log("Streaming utterance completed : ", event.detail.behavior.streaming.text)
}

let streamingStart = function(event) {
    console.log("Streaming started with no errors")
}

let streamingStop = function(event) {
    console.log("Streaming stoped with no errors")
}

let streamingFinal = function(event) {
    console.log("Streaming ended, here's the final transcript : ", event.detail.behavior.streaming.result)
}

let streamingFail = function(event) {
    console.log("Streaming error : ", event.detail)
}

let customHandler = function(event) {
    console.log(`${event.detail.behavior.customAction.kind} fired`)
    console.log(event.detail.behavior)
    console.log(event.detail.transcript)
}



window.start = async function() {
    try {
        window.linto = new Linto("https://stage.linto.ai/overwatch/local/web/login", "v2lS299nR5Fv8k7Q", 10000)
            // Some feedbacks for UX implementation
        linto.addEventListener("mqtt_connect", mqttConnectHandler)
        linto.addEventListener("mqtt_connect_fail", mqttConnectFailHandler)
        linto.addEventListener("mqtt_error", mqttErrorHandler)
        linto.addEventListener("mqtt_disconnect", mqttDisconnectHandler)
        linto.addEventListener("speaking_on", audioSpeakingOn)
        linto.addEventListener("speaking_off", audioSpeakingOff)
        linto.addEventListener("command_acquired", commandAcquired)
        linto.addEventListener("command_published", commandPublished)
        linto.addEventListener("command_timeout", commandTimeout)
        linto.addEventListener("hotword_on", hotword)
        linto.addEventListener("say_feedback_from_skill", sayFeedback)
        linto.addEventListener("ask_feedback_from_skill", askFeedback)
        linto.addEventListener("custom_action_from_skill", customHandler)
        linto.addEventListener("chatbot_feedback_from_skill", widgetFeedback)
        linto.addEventListener("text_acquired", textAcquired)
        linto.addEventListener("text_published", textPublished)
        linto.addEventListener("chatbot_acquired", chatbotAcquired)
        linto.addEventListener("chatbot_published", chatbotPublished)
        linto.addEventListener("chatbot_feedback", widgetFeedback)
        linto.addEventListener("chatbot_error", chatbotError)
        linto.addEventListener("action_feedback", actionFeedback)
        linto.addEventListener("action_error", actionError)
        linto.addEventListener("streaming_start", streamingStart)
        linto.addEventListener("streaming_stop", streamingStop)
        linto.addEventListener("streaming_chunk", streamingChunk)
        linto.addEventListener("streaming_final", streamingFinal)
        linto.addEventListener("streaming_fail", streamingFail)
        await linto.login()
        linto.startAudioAcquisition(true, "linto", 0.99) // Uses hotword built in WebVoiceSDK by name / model / threshold (0.99 is fine enough)
        linto.startCommandPipeline()
        return true
    } catch (e) {
        return e.message
    }

}

start()