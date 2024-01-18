export function mqttConnect(event) {
  this.dispatchEvent(new CustomEvent("mqtt_connect", event))
}

export function vadStatus(event) {
  event.detail
    ? this.dispatchEvent(new CustomEvent("speaking_on"))
    : this.dispatchEvent(new CustomEvent("speaking_off"))
}

export function hotwordCommandBuffer(hotWordEvent) {
  this.dispatchEvent(new CustomEvent("hotword_on", hotWordEvent))
  const whenSpeakingOff = async () => {
    await this.sendCommandBuffer()
    this.removeEventListener("speaking_off", whenSpeakingOff)
    this.audio.hotword.resume()
  }
  this.listenCommand()
  this.audio.hotword.pause()
  this.addEventListener("speaking_off", whenSpeakingOff)
}

export function hotwordStreaming(hotWordEvent) {
  this.dispatchEvent(new CustomEvent("hotword_on", hotWordEvent))
  this.startStreaming()
  const whenSpeakingOff = async () => {
    this.stopStreaming()
    this.removeEventListener("speaking_off", whenSpeakingOff)
    this.audio.hotword.resume()
  }
  this.listenCommand()
  this.audio.hotword.pause()
  this.addEventListener("speaking_off", whenSpeakingOff)
}

export async function nlpAnswer(event) {
  if (event.detail.behavior.chatbot) {
    this.dispatchEvent(
      new CustomEvent("chatbot_feedback_from_skill", {
        detail: event.detail,
      })
    )
    return // Might handle custom_action say or ask, so we just exit here.
  }

  if (event.detail.behavior.customAction) {
    this.dispatchEvent(
      new CustomEvent("custom_action_from_skill", {
        detail: event.detail,
      })
    )
    return // Might handle custom_action say or ask, so we just exit here.
  }

  if (event.detail.behavior.say) {
    this.dispatchEvent(
      new CustomEvent("say_feedback_from_skill", {
        detail: event.detail,
      })
    )
    return
  }

  if (event.detail.behavior.ask) {
    this.dispatchEvent(
      new CustomEvent("ask_feedback_from_skill", {
        detail: event.detail,
      })
    )
  }
}

export async function chatbotAnswer(event) {
  if (event?.detail?.behavior?.chatbot) {
    this.dispatchEvent(
      new CustomEvent("chatbot_feedback", {
        detail: event.detail,
      })
    )
  } else {
    this.dispatchEvent(
      new CustomEvent("chatbot_error", {
        detail: event.detail,
      })
    )
  }
  return
}

export async function actionAnswer(event) {
  if (event.detail.behavior) {
    this.dispatchEvent(
      new CustomEvent("action_feedback", {
        detail: event.detail,
      })
    )
    return
  } else {
    this.dispatchEvent(
      new CustomEvent("action_error", {
        detail: event.detail,
      })
    )
    return
  }
}

// Might be an error
export function streamingStartAck(event) {
  this.streamingPublishHandler = streamingPublish.bind(this)
  if (event.detail.behavior.streaming.status == "started") {
    this.audio.downSampler.addEventListener(
      "downSamplerFrame",
      this.streamingPublishHandler
    )
    this.dispatchEvent(
      new CustomEvent("streaming_start", {
        detail: event.detail,
      })
    )
  } else {
    this.dispatchEvent(
      new CustomEvent("streaming_fail", {
        detail: event.detail,
      })
    )
  }
}

export function streamingStopAck(event) {
  this.dispatchEvent(
    new CustomEvent("streaming_stop", {
      detail: event.detail,
    })
  )
}

export function streamingChunk(event) {
  this.dispatchEvent(
    new CustomEvent("streaming_chunk", {
      detail: event.detail,
    })
  )
}

export function streamingFinal(event) {
  this.dispatchEvent(
    new CustomEvent("streaming_final", {
      detail: event.detail,
    })
  )
}

export function streamingFail(event) {
  this.dispatchEvent(
    new CustomEvent("streaming_fail", {
      detail: event.detail,
    })
  )
}

export function ttsLangAction(event) {
  this.setTTSLang(event.detail.value)
}

export function mqttConnectFail(event) {
  this.dispatchEvent(
    new CustomEvent("mqtt_connect_fail", {
      detail: event.detail,
    })
  )
}

export function mqttError(event) {
  this.dispatchEvent(
    new CustomEvent("mqtt_error", {
      detail: event.detail,
    })
  )
}

export function mqttDisconnect(event) {
  this.dispatchEvent(
    new CustomEvent("mqtt_disconnect", {
      detail: event.detail,
    })
  )
}

// Local
function streamingPublish(event) {
  this.mqtt.publishStreamingChunk(event.detail)
}
