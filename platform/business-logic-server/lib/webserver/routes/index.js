'use strict'

const debug = require('debug')('linto-red:webserver:routes')

const ifHasElse = (condition, ifHas, otherwise) => {
  return !condition ? otherwise() : ifHas()
}

class Route {
  constructor(webServer) {
    const routes = require('./routes.js')(webServer)
    for (let level in routes) {
      for (let path in routes[level]) {
        const route = routes[level][path]
        webServer.app[route.method](
          `${level}${path}`,
          ifHasElse(
            Array.isArray(route.controller),
            () => Object.values(route.controller),
            () => route.controller
          )
        )
      }
    }
  }
}

module.exports = webServer => new Route(webServer)

