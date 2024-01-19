const debug = require('debug')('linto-overwatch:overwatch:watcher:logic:mongodb:models:linto_users')

const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const TOKEN_DAYS_TIME = 10
const REFRESH_TOKEN_DAYS_TIME = 14

const MongoModel = require('../model.js')

class LintoUsersModel extends MongoModel {
    constructor() {
        super('linto_users')
    }

    async findById(id) {
        try {
            return await this.mongoRequest({ id })
        } catch (err) {
            console.error(err)
            return err
        }
    }

    async findOne(username) {
        try {
            let user = await this.mongoRequest(username)
            return user[0]
        } catch (err) {
            console.error(err)
            return err
        }
    }

    validatePassword(password, user) {
        const hash = crypto.pbkdf2Sync(password, user.salt, 10000, 512, 'sha512').toString('hex')
        return user.hash === hash
    }
}

module.exports = new LintoUsersModel()