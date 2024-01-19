const Component = require(`../component.js`)
const path = require("path")
const debug = require('debug')(`app:webserver`)
const express = require('express')
const Session = require('express-session')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load(process.env.SWAGGER_PATH);

/*
const CORS = require('cors')
const whitelistDomains = process.env.WHITELIST_DOMAINS.split(',')
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelistDomains.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
*/

class WebServer extends Component {
  constructor(app) {
    super(app)
    this.id = this.constructor.name
    this.app = app
    this.express = express()
    //this.express.use(CORS(corsOptions))
    this.express.set('etag', false)
    this.express.set('trust proxy', true)
    this.express.use(bodyParser.json())
    this.express.use(bodyParser.urlencoded({
      extended: true
    }))
    this.express.use(cookieParser())

    let sessionConfig = {
      resave: false,
      saveUninitialized: true,
      secret: 'supersecret',
      cookie: {
        secure: false,
        maxAge: 604800 // 7 days
      }
    }
    this.session = Session(sessionConfig)
    this.express.use(this.session)
    this.httpServer = this.express.listen(process.env.WEBSERVER_HTTP_PORT, "0.0.0.0", (err) => {
      debug(` WebServer listening on : ${process.env.WEBSERVER_HTTP_PORT}`)
      if (err) throw (err)
    })

    require('./routes/router.js')(this) // Loads all defined routes
    this.express.use('/api-doc', function(req, res, next){ debug('swagger API'); next()}, swaggerUi.serve, swaggerUi.setup(swaggerDocument))
    this.express.use((req, res, next) => {
      res.status(404)
      res.end()
    })


    this.express.use((err, req, res, next) => {
      console.error(err)
      res.status(500)
      res.end()
    })

    return this.init()
  }
}

module.exports = app => new WebServer(app)