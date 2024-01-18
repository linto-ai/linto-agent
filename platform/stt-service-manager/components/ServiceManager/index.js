const Component = require(`../component.js`)
const debug = require('debug')(`app:servicemanager`)
const service = require(`${process.cwd()}/models/models/ServiceUpdates`)
const lm = require(`${process.cwd()}/models/models/LMUpdates`)
const am = require(`${process.cwd()}/models/models/AMUpdates`)

class ServiceManager extends Component {
    constructor(app) {
        super(app)
        this.id = this.constructor.name
        this.app = app
        this.db = { service: service, lm: lm, am: am }
        this.tag = ['offline', 'online']
        return this.init()
    }

    verifTag(tag) {
        if (this.tag.indexOf(tag) != -1) return 1
        else return 0
    }

}

module.exports = app => new ServiceManager(app)
