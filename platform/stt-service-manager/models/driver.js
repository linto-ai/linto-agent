const mongoDb = require('mongodb')
let urlMongo = 'mongodb://'
if (process.env.MONGODB_REQUIRE_LOGIN) {
    urlMongo += process.env.MONGODB_USER + ':' + process.env.MONGODB_PSWD + '@'
}
urlMongo += process.env.MONGODB_HOST + ':' + process.env.MONGODB_PORT + '/'
if (process.env.MONGODB_REQUIRE_LOGIN) {
    urlMongo += '?authSource=' + process.env.MONGODB_DBNAME_SMANAGER
}


// Create an instance of Mongodb Client. Handle connexion, closeConnection, reconnect and error
class MongoDriver {
    static mongoDb = mongoDb
    static urlMongo = urlMongo
    static client = mongoDb.MongoClient
    static db = null

    // Check mongo database connection status
    static checkConnection() {
        try {
            if (MongoDriver.db && MongoDriver.db.serverConfig) {
                return MongoDriver.db.serverConfig.isConnected()
            } else {
                return false
            }
        } catch (error) {
            console.error(error)
            return false
        }
    }

    constructor() {
        this.poolOptions = {
            numberOfRetries: 5,
            auto_reconnect: true,
            poolSize: 40,
            connectTimeoutMS: 5000,
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
        // if connexion exists
        if (MongoDriver.checkConnection()) {
            return this
        }

        // Otherwise, inits connexions and binds event handling
        MongoDriver.client.connect(MongoDriver.urlMongo, this.poolOptions, (err, client) => {
            if (err) {
                console.error('> MongoDB ERROR unable to connect:', err.message)
            } else {
                console.log('> MongoDB : Connected')
                MongoDriver.db = client.db(process.env.LINTO_STACK_MONGODB_DBNAME)
                const mongoEvent = client.topology

                mongoEvent.on('close', () => {
                    console.error('> MongoDb : Connection lost ')
                })
                mongoEvent.on('error', (e) => {
                    console.error('> MongoDb ERROR: ', e)
                })
                mongoEvent.on('reconnect', () => {
                    console.error('> MongoDb : reconnect')
                })

                /* ALL EVENTS */
                /*
                commandStarted: [Function (anonymous)],
                commandSucceeded: [Function (anonymous)],
                commandFailed: [Function (anonymous)],
                serverOpening: [Function (anonymous)],
                serverClosed: [Function (anonymous)],
                serverDescriptionChanged: [Function (anonymous)],
                serverHeartbeatStarted: [Function (anonymous)],
                serverHeartbeatSucceeded: [Function (anonymous)],
                serverHeartbeatFailed: [Function (anonymous)],
                topologyOpening: [Function (anonymous)],
                topologyClosed: [Function (anonymous)],
                topologyDescriptionChanged: [Function (anonymous)],
                joined: [Function (anonymous)],
                left: [Function (anonymous)],
                ping: [Function (anonymous)],
                ha: [Function (anonymous)],
                connectionPoolCreated: [Function (anonymous)],
                connectionPoolClosed: [Function (anonymous)],
                connectionCreated: [Function (anonymous)],
                connectionReady: [Function (anonymous)],
                connectionClosed: [Function (anonymous)],
                connectionCheckOutStarted: [Function (anonymous)],
                connectionCheckOutFailed: [Function (anonymous)],
                connectionCheckedOut: [Function (anonymous)],
                connectionCheckedIn: [Function (anonymous)],
                connectionPoolCleared: [Function (anonymous)],
                authenticated: [Function (anonymous)],
                error: [ [Function (anonymous)], [Function: listener] ],
                timeout: [ [Function (anonymous)], [Function: listener] ],
                close: [ [Function (anonymous)], [Function: listener] ],
                parseError: [ [Function (anonymous)], [Function: listener] ],
                open: [ [Function], [Function] ],
                fullsetup: [ [Function], [Function] ],
                all: [ [Function], [Function] ],
                reconnect: [ [Function (anonymous)], [Function: listener] ]
                */
            }
        })
    }

}

module.exports = new MongoDriver() // Exports a singleton