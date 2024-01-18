const debug = require('debug')('app:model:AMupdate')
const datetime = require('node-datetime')
const MongoModel = require(`${process.cwd()}/models/model.js`)

class AMUpdates extends MongoModel {
    constructor() {
        super('AcModels') // "context" est le nom de ma collection
    }

    //create a new instance
    async createModel(modelName, lang = "", desc = "") {
        try {
            let newModel = {
                modelId: modelName,
                lang: lang,
                desc: desc,
                date: datetime.create().format('m/d/Y-H:M:S')
            }
            return await this.mongoInsert(newModel)
        } catch (err) {
            throw "> AMCollection ERROR: " + err
        }
    }

    // delete acoustic model by name
    async deleteModel(modelName) {
        try {
            return await this.mongoDelete({ modelId: modelName })
        } catch (err) {
            throw "> AMCollection ERROR: " + err
        }
    }

    // find acoustic model by name
    async findModel(modelName) {
        try {
            const model = await this.mongoRequest({ modelId: modelName })
            if (model.length == 0) return false
            else return model[0]
        } catch (err) {
            throw "> AMCollection ERROR: " + err
        }
    }

    // find all acoustic models
    async findModels(request = {}) {
        try {
            return await this.mongoRequest(request)
        } catch (err) {
            throw "> AMCollection ERROR: " + err
        }
    }

}

module.exports = new AMUpdates()