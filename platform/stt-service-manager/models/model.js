const MongoDriver = require(`${process.cwd()}/models/driver.js`)

class MongoModel {
    constructor(collection) {
        this.collection = collection
    }
    checkConnection() {
        if (MongoDriver.constructor.db && MongoDriver.constructor.db.serverConfig.isConnected()) return true
        else return false
    }
    /* ========================= */
    /* ===== MONGO METHODS ===== */
    /* ========================= */
    /**
     * Request function for mongoDB. This function will make a request on the "collection", filtered by the "query" passed in parameters.
     * @param {string} collection
     * @param {Object} query
     * @returns {Pomise}
     */
    async mongoRequest(query) {
        return new Promise((resolve, reject) => {
            try {
                if (!this.checkConnection()) throw 'failed to connect to MongoDB server'
                MongoDriver.constructor.db.collection(this.collection).find(query).toArray((error, result) => {
                    if (error) {
                        reject(error)
                    }
                    resolve(result)
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    /**
     * Insert/Create function for mongoDB. This function will create an entry based on the "collection", the "query" and the "values" passed in parmaters.
     * @param {Object} query
     * @param {Object} values
     * @returns {Pomise}
     */
    async mongoInsert(payload) {
        return new Promise((resolve, reject) => {
            try {
                if (!this.checkConnection()) throw 'failed to connect to MongoDB server'
                MongoDriver.constructor.db.collection(this.collection).insertOne(payload, function (error, result) {
                    if (error) {
                        reject(error)
                    }
                    resolve('success')
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    /**
     * Update function for mongoDB. This function will update an entry based on the "collection", the "query" and the "values" passed in parmaters.
     * @param {Object} query
     * @param {Object} values
     * @returns {Pomise}
     */
    async mongoUpdate(query, values) {
        if (values._id) {
            delete values._id
        }
        return new Promise((resolve, reject) => {
            try {
                if (!this.checkConnection()) throw 'failed to connect to MongoDB server'
                MongoDriver.constructor.db.collection(this.collection).updateOne(query, {
                    $set: values
                }, function (error, result) {
                    if (error) {
                        reject(error)
                    }
                    resolve('success')
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    /**
     * Update function for mongoDB. This function will update an entry based on the "collection", the "query" and the "values" and the "modes" passed in parmaters.
     * @param {Object} query
     * @param {Object} values
     * @returns {Pomise}
     */
    async mongoUpdateModes(query, ...modesAndvalues) {
        return new Promise((resolve, reject) => {
            try {
                if (!this.checkConnection()) throw 'failed to connect to MongoDB server'
                let operators = {}
                modesAndvalues.forEach((component) => {
                    switch (component.mode) {
                        case '$set': operators.$set = component.value; break
                        case '$push': operators.$push = component.value; break
                        case '$pull': operators.$pull = component.value; break
                        default: console.log('updateQ switch mode error'); break
                    }
                })
                MongoDriver.constructor.db.collection(this.collection).updateOne(query, operators, (error, result) => {
                    if (error) reject(error)
                    resolve("success")
                })
            } catch (error) {
                reject(error)
            }
        })
    }

    /**
     * Delete function for mongoDB. This function will create an entry based on the "collection", the "query" passed in parmaters.
     * @param {Object} query
     * @returns {Pomise}
     */
    async mongoDelete(query) {
        return new Promise((resolve, reject) => {
            try {
                if (!this.checkConnection()) throw 'failed to connect to MongoDB server'
                MongoDriver.constructor.db.collection(this.collection).deleteOne(query, function (error, result) {
                    if (error) {
                        reject(error)
                    }
                    resolve("success")
                })
            } catch (error) {
                reject(error)
            }
        })
    }
}

module.exports = MongoModel