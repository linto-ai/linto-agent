const debug = require('debug')('app:model:LMupdate')
const datetime = require('node-datetime')
const MongoModel = require(`${process.cwd()}/models/model.js`)

class LMUpdates extends MongoModel {
    constructor() {
        super('LangModels') // "context" est le nom de ma collection
    }

    //create a new instance
    async createModel(modelName, acName = "", lang = "", type, isGenerated = 0, isDirty = 0, entities = [], intents = [], oov = [], dateGen = null) {
        try {
            let newModel = {
                modelId: modelName,
                type: type,
                acmodelId: acName,
                entities: entities,
                intents: intents,
                lang: lang,
                isGenerated: isGenerated,
                isDirty: isDirty,
                updateState: 0,
                updateStatus: '',
                oov: oov,
                dateGeneration: dateGen,
                dateModification: datetime.create().format('m/d/Y-H:M:S')
            }
            return await this.mongoInsert(newModel)
        } catch (err) {
            throw "> LMCollection ERROR: " + err
        }
    }

    // delete language model by name
    async deleteModel(modelName) {
        try {
            return await this.mongoDelete({ modelId: modelName })
        } catch (err) {
            throw "> LMCollection ERROR: " + err
        }
    }

    // find language model by name
    async findModel(modelName) {
        try {
            const model = await this.mongoRequest({ modelId: modelName })
            if (model.length == 0) return false
            else return model[0]
        } catch (err) {
            throw "> LMCollection ERROR: " + err
        }
    }

    // find all language models
    async findModels(request = {}) {
        try {
            return await this.mongoRequest(request)
        } catch (err) {
            throw "> LMCollection ERROR: " + err
        }
    }

    // update one or multiple parameters by modelId
    async updateModel(modelName, obj) {
        try {
            return await this.mongoUpdateModes({ modelId: modelName }, { mode: '$set', value: obj })
        } catch (err) {
            throw "> LMCollection ERROR: " + err
        }
    }

    // update model generation parameters (updateState, updateStatus, dateGeneration) by modelId
    async generationState(modelName, value, msg) {
        try {
            const obj = { 'updateState': value, 'updateStatus': msg, 'dateGeneration': datetime.create().format('m/d/Y-H:M:S') }
            return await this.mongoUpdateModes({ modelId: modelName }, { mode: '$set', value: obj })
        } catch (err) {
            throw "> LMCollection ERROR: " + err
        }
    }

    // add a single entity/intent by modelId
    async addElemInList(modelName, element, value) {
        try {
            const set = { dateModification: datetime.create().format('m/d/Y-H:M:S'), isDirty: 1 }
            const push = {}
            push[element] = value //intent or entity
            return await this.mongoUpdateModes({ modelId: modelName }, { mode: '$set', value: set }, { mode: '$push', value: push })
        } catch (err) {
            throw "> LMCollection ERROR: " + err
        }
    }

    // update a single entity/intent by modelId
    async updateElemFromList(modelName, element, value) {
        try {
            let set = { dateModification: datetime.create().format('m/d/Y-H:M:S'), isDirty: 1 }
            set[element] = value
            return await this.mongoUpdateModes({ modelId: modelName }, { mode: '$set', value: set })
        } catch (err) {
            throw "> LMCollection ERROR: " + err
        }
    }

    // remove a single entity/intent by modelId
    async removeElemFromList(modelName, element, name) {
        try {
            const set = { dateModification: datetime.create().format('m/d/Y-H:M:S'), isDirty: 1 }
            const pull = {}
            pull[element] = { name: name } //intent or entity
            return await this.mongoUpdateModes({ modelId: modelName }, { mode: '$set', value: set }, { mode: '$pull', value: pull })
        } catch (err) {
            throw "> LMCollection ERROR: " + err
        }
    }
}

module.exports = new LMUpdates()