const moduleName = 'audio'
const debug = require('debug')(`linto-client:${moduleName}`)
const EventEmitter = require('eventemitter3')

class Audio extends EventEmitter {
    constructor(app) {
        super()
        this.nlpProcessing = new Array() //array of audiofiles being submitted
        this.mic = require(`${process.cwd()}/lib/soundfetch`)
        return this.init(app)
    }

    async init(app) {
        return new Promise((resolve, reject) => {
            app[moduleName] = this
            resolve(app)
        })
    }
}

module.exports = Audio