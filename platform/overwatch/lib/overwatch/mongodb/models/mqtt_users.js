const debug = require('debug')('linto-overwatch:overwatch:watcher:logic:mongodb:models:mqtt_users')

const MongoModel = require('../model.js')

const bcrypt = require('bcrypt')
const SALT_ROUND = 10

class LogsModel extends MongoModel {
  constructor() {
    super('mqtt_users')
  }

  async findById(id) {
    try {
      return await this.mongoRequest({ id })
    } catch (err) {
      console.error(err)
      return err
    }
  }

  async findByUsername(json) {
    try {
      return await this.mongoRequest(json)
    } catch (err) {
      console.error(err)
      return err
    }
  }

  async insertMqttUsers(user) {
    try {
      let mqttUser = { ...user, superuser: false, acls: [] }

      mqttUser = await bcrypt.hash(user.password, SALT_ROUND).then(hash => {
        mqttUser.password = hash
        return mqttUser
      })

      await this.mongoInsert(mqttUser)
      return mqttUser
    } catch (err) {
      console.error(err)
      return err
    }
  }

  async deleteMqttUser(username) {
    try {
      await this.mongoDelete({ username })
    } catch (err) {
      console.log(err)
      return err
    }
  }
}

module.exports = new LogsModel()