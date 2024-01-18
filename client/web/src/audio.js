import WebVoiceSDK from "@linto-ai/webvoicesdk"
import base64Js from "base64-js"

export default class Audio extends EventTarget {
  constructor(
    isMobile,
    useHotword = true,
    hotwordModel = "linto",
    threshold = 0.99,
    mobileConstraintsOverrides = {
      echoCancellation: false,
      autoGainControl: false,
      noiseSuppression: false,
    }
  ) {
    super()
    this.useHotword = useHotword
    this.hotwordModel = hotwordModel
    this.threshold = threshold
    if (isMobile) {
      this.mic = new webVoiceSDK.Mic({
        sampleRate: 44100,
        frameSize: 4096,
        constraints: mobileConstraintsOverrides,
      })
    } else {
      this.mic = new webVoiceSDK.Mic() // uses webVoiceSDK.Mic.defaultOptions
    }
    this.downSampler = new WebVoiceSDK.DownSampler()
    this.vad = new WebVoiceSDK.Vad({
      numActivations: 10,
      threshold: 0.85,
      timeAfterStop: 2000,
    })
    this.speechPreemphaser = new WebVoiceSDK.SpeechPreemphaser()
    this.featuresExtractor = new WebVoiceSDK.FeaturesExtractor()
    this.hotword = new WebVoiceSDK.Hotword()
    this.recorder = new WebVoiceSDK.Recorder()
    this.start()
  }

  async start() {
    try {
      await this.mic.start()
      await this.downSampler.start(this.mic)
      await this.speechPreemphaser.start(this.downSampler)
      await this.featuresExtractor.start(this.speechPreemphaser)
      if (this.useHotword) {
        await this.vad.start(this.mic)
        await this.hotword.start(
          this.featuresExtractor,
          this.vad,
          this.threshold
        )
        await this.hotword.loadModel(
          this.hotword.availableModels[this.hotwordModel]
        )
      }
      await this.recorder.start(this.downSampler)
    } catch (e) {
      console.log(e)
    }
  }

  async stop() {
    await this.downSampler.stop()
    await this.speechPreemphaser.stop()
    await this.featuresExtractor.stop()
    await this.recorder.stop()
    if (this.useHotword) {
      await this.hotword.stop()
      await this.vad.stop()
    }
    await this.mic.stop()
  }

  pause() {
    this.mic.pause()
  }

  resume() {
    this.mic.resume()
  }

  async listenCommand() {
    this.recorder.punchIn()
  }

  async getCommand() {
    const audioBlob = this.recorder.punchOut()
    const audioBuffer = await fetch(audioBlob, {
      method: "GET",
    })
    const audioArrayBuffer = await audioBuffer.arrayBuffer()
    const vue = new Int8Array(audioArrayBuffer)
    return base64Js.fromByteArray(vue)
  }
}
