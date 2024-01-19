'use strict'

const debug = require('debug')('linto-red:webserver')
const express = require('express')
const fileUpload = require('express-fileupload');

const EventEmitter = require('eventemitter3')
const RedManager = require(process.cwd() + '/lib/node-red')
const bodyParser = require('body-parser')

class WebServer extends EventEmitter {
  constructor() {
    super()
    this.app = express()

    this.app.use(bodyParser.json({ limit: process.env.LINTO_STACK_BLS_API_MAX_LENGTH }))

    this.app.use('/', express.static('public'))
    this.app.use(express.json())
    this.app.use(fileUpload());

    require('./routes')(this)
    return this.init()
  }

  async init() {
    await new RedManager(this.app)
    return this
  }
}
module.exports = new WebServer()
