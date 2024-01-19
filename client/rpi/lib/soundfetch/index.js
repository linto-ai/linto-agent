const debug = require('debug')('linto-client:lib:soundfetch')
const fs = require('fs')

class SoundFetch {
    constructor() {
        return this
    }

    async getFile() {
        return new Promise((resolve, reject) => {
            fs.readFile(process.env.AUDIO_FILE, function (err, audiofile) {
                if (err) return reject(err)
                resolve(audiofile)
            })
        })
    }
    readStream() {
        return fs.createReadStream(process.env.AUDIO_FILE)
    }

}

module.exports = new SoundFetch()