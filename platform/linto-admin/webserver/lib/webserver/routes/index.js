const debug = require('debug')(`linto-admin:routes`)
const middlewares = require(`${process.cwd()}/lib/webserver/middlewares`)
const ifHasElse = (condition, ifHas, otherwise) => {
    return !condition ? otherwise() : ifHas()
}

class Route {
    constructor(webServer) {
        const routes = require('./routes.js')(webServer)
        for (let level in routes) {
            for (let path in routes[level]) {
                const route = routes[level][path]
                const method = route.method
                if (route.requireAuth) {
                    webServer.app[method](
                        level + route.path,
                        middlewares.logger,
                        middlewares.checkAuth,
                        ifHasElse(
                            Array.isArray(route.controller),
                            () => Object.values(route.controller),
                            () => route.controller
                        )
                    )
                } else {
                    webServer.app[method](
                        level + route.path,
                        middlewares.logger,
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
}

module.exports = webServer => new Route(webServer)