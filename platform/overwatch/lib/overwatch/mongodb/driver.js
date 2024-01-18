const debug = require('debug')('linto-overwatch:overwatch:watcher:logic:mongodb:driver')
const mongoDb = require('mongodb')

let urlMongo = 'mongodb://'
if (process.env.LINTO_STACK_MONGODB_USE_LOGIN === 'true')
  urlMongo += process.env.LINTO_STACK_MONGODB_USER + ':' + process.env.LINTO_STACK_MONGODB_PASSWORD + '@'
urlMongo += process.env.LINTO_STACK_MONGODB_SERVICE + ':' + process.env.LINTO_STACK_MONGODB_PORT + '/' + process.env.LINTO_STACK_MONGODB_DBNAME

if (process.env.LINTO_STACK_MONGODB_USE_LOGIN === 'true')
  urlMongo += '?authSource=' + process.env.LINTO_STACK_MONGODB_DBNAME

class MongoDriver {
  static mongoDb = mongoDb
  static urlMongo = urlMongo
  static client = mongoDb.MongoClient
  static db = null

  // Check mongo database connection status
  static checkConnection() {
    try {
      if (!!MongoDriver.db && MongoDriver.db.serverConfig) {
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
        console.error('> MongoDB ERROR unable to connect:', err.toString())
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
      }
    })
  }
}

module.exports = new MongoDriver() // Exports a singleton