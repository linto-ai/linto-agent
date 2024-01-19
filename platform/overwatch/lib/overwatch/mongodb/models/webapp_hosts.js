const debug = require('debug')('linto-overwatch:overwatch:watcher:logic:mongodb:models:webapp_host')

const MongoModel = require('../model.js')
const SlotsManager = new require('../../slotsManager/slotsManager')

class LintoWebUsersModel extends MongoModel {
    constructor() {
        super('webapp_hosts')
    }

    async findById(id) {
        try {
            return await this.mongoRequest(id)
        } catch (err) {
            console.error(err)
            return err
        }
    }

    async findOne(url) {
        try {
            let user = await this.mongoRequest(url)
            return user[0]
        } catch (err) {
            console.error(err)
            return err
        }
    }

    async update(payload) {
        const query = {
            _id: payload._id
        }
        delete payload._id
        let mutableElements = payload

        return await this.mongoUpdate(query, mutableElements)
    }

    validApplicationAuth(webapp, requestToken) {
        return webapp.applications.find(app => (app.requestToken === requestToken))
    }

    async deleteSlot(sn) {
        slotsManager.removeSlot(sn)
    }
}

module.exports = new LintoWebUsersModel()