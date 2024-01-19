const debug = require('debug')('linto-red:webserver:routes:routes')

module.exports = (webServer) => {

  let routes = {}

  let redApi = require('./red')(webServer)
  let catalogueApi = require('./catalogue')(webServer)

  routes[process.env.LINTO_STACK_BLS_SERVICE_API_PATH] = {
    ...redApi,
    ...catalogueApi
  }

  return routes
}
