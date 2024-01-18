const debug = require('debug')('linto-overwatch:overwatch:watcher:logic:mongodb:models:lintos')

const MongoModel = require('../model.js')

class ScopesModel extends MongoModel {
  constructor() {
    super('scopes')
  }

  async getScopesByUser(userId) {
    try {
      return await this.mongoRequest({ userId })
    } catch (err) {
      console.error(err)
      return err
    }
  }

  async getScopesById(id) {
    try {
      return await this.mongoRequest({ id })
    } catch (err) {
      console.error(err)
      return err
    }
  }
}

module.exports = new ScopesModel()