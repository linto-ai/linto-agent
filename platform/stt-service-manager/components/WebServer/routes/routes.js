const debug = require('debug')('app:webserver:routes')

module.exports = webServer => {
    return {
        '/': require(`./healthcheck`)(webServer),
        '/service/:serviceId' : require('./serviceManager/service')(webServer),
        '/services' : require('./serviceManager/services')(webServer),
        '/acmodel/:modelId' : require('./modelManager/amodel')(webServer),
        '/acmodels' : require('./modelManager/amodels')(webServer),
        '/langmodel/:modelId' : require('./modelManager/lmodel')(webServer),
        '/langmodels' : require('./modelManager/lmodels')(webServer),
        '/langmodel/:modelId/entity/:name' : require('./modelManager/element')(webServer,'entities'),
        '/langmodel/:modelId/entities' : require('./modelManager/elements')(webServer,'entities'),
        '/langmodel/:modelId/intent/:name' : require('./modelManager/element')(webServer,'intents'),
        '/langmodel/:modelId/intents' : require('./modelManager/elements')(webServer,'intents'),
    }
}