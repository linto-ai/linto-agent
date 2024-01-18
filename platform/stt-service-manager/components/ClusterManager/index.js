const Component = require(`../component.js`)
const debug = require('debug')(`app:clustermanager`)
const service = require(`${process.cwd()}/models/models/ServiceUpdates`)
const lm = require(`${process.cwd()}/models/models/LMUpdates`)
const am = require(`${process.cwd()}/models/models/AMUpdates`)

class ClusterManager extends Component {
    constructor(app) {
        super(app)
        this.id = this.constructor.name
        this.app = app
        this.db = { service: service, lm: lm, am: am }
        switch (process.env.CLUSTER_TYPE) {
            case 'DockerSwarm': this.cluster = require(`./DockerSwarm`); break
            case 'Kubernetes': this.cluster = ''; break
            default: throw 'Undefined CLUSTER type'
        }
        return this.init()
    }

}

module.exports = app => new ClusterManager(app)
