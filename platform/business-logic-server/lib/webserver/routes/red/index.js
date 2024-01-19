'use strict'
const debug = require('debug')('linto-red:webserver:front:red')

module.exports = (webServer) => {
  return {
    '/config/admin': {
      method: 'get',
      controller: async (req, res, next) => {
        let baseRequest = "http://"
        if (process.env.LINTO_STACK_USE_SSL === 'true')
          baseRequest = "https://"

        res.status(200).json({ admin: baseRequest + process.env.LINTO_STACK_DOMAIN + '/api' })
      },
    },
    '/health': {
      method: 'get',
      controller: async (req, res, next) => {
        res.sendStatus(200)
      }
    }
  }
}
