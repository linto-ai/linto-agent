const debug = require('debug')('linto-overwatch:overwatch:watcher:logic:mongodb:models:logs')

const MongoModel = require('../model.js')

class LogsModel extends MongoModel {
  constructor() {
    super('logs')
  }

  // Create a new linto that have "fleet" type
  async insertLog(logs) {
    try {
      return await this.mongoInsert(logs)
    } catch (err) {
      console.error(err)
      return err
    }
  }
}

module.exports = new LogsModel()