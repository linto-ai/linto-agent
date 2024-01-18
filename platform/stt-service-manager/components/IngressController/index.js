const Component = require(`../component.js`)
const debug = require('debug')(`app:ingresscontroller`)

class IngressController extends Component {
    constructor(app) {
        super(app)
        this.id = this.constructor.name
        this.app = app
        switch (process.env.INGRESS_CONTROLLER) {
            case 'nginx':
                this.ingress = require(`./Nginx`)
                break
            case 'traefik': this.ingress = require(`./Traefik`); break
            default: throw 'Undefined INGRESS controller'
        }
        return this.init()
    }
}

module.exports = app => new IngressController(app)
