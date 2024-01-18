const debug = require('debug')('linto-overwatch:overwatch')

class LintoOverwatch {
    constructor() {
        const Watcher = require('./watcher/watcher')
        this.clientBrokerInit = new Watcher()
        return this
    }
}

module.exports = LintoOverwatch