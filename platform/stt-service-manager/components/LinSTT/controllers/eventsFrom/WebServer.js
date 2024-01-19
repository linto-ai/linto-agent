const debug = require('debug')(`app:linstt:eventsFrom:WebServer`)
const fs = require('fs').promises
const rimraf = require("rimraf");
const ncp = require('ncp').ncp;
const ncpPromise = require('util').promisify(ncp)
const datetime = require('node-datetime')

/**
 * apiAModel.js
 *
const debug = require('debug')(`app:linstt:apiamodel`)
const fs = require('fs').promises
const rimraf = require("rimraf");
const compressing = require('compressing');
const download = require('download');
 *
 *
*/

/**
 * apiLModel.js
 *
const debug = require('debug')(`app:linstt:apilmodel`)
const fs = require('fs').promises
const rimraf = require("rimraf");
const compressing = require('compressing');
const download = require('download');
const ncp = require('ncp').ncp;
const ncpPromise = require('util').promisify(ncp)
 *
 *
*/

/**
 * apiElement.js
 *
const debug = require('debug')(`app:linstt:apielement`)
const fs = require('fs').promises
 *
 *
*/



// this is bound to the component
module.exports = function () {
    if (!this.app.components['WebServer']) return


    /**
     * Language Model events from WebServer
     *      createLModel
     *      deleteLModel
     *      getLModel
     *      getLModels
     */
    this.app.components['WebServer'].on('createLModel', async (cb, payload) => {
        try {
            const destPath = `${process.env.LM_PATH}/${payload.modelId}`
            const res = await this.db.lm.findModel(payload.modelId)
            let amodel = {}
            if (res) throw `Language Model '${payload.modelId}' exists`
            if (payload.type == undefined || !this.verifType(payload.type)) throw `'type' parameter is required. Supported types are: ${this.type}`


            /** Create a copy of an existing model */
            if (payload.lmodelId != undefined) {
                const copy = await this.db.lm.findModel(payload.lmodelId)
                if (!copy) throw `Language Model to copy '${payload.lmodelId}' does not exist`
                await ncpPromise(`${process.env.LM_PATH}/${payload.lmodelId}`, destPath, async (err) => { if (err) throw err })
                await this.db.lm.createModel(payload.modelId, copy.acousticModel, copy.lang, copy.type, copy.isGenerated, copy.isDirty, copy.entities, copy.intents, copy.oov, copy.dateGen)
                return cb({ bool: true, msg: `Language Model '${payload.modelId}' is successfully created` })
            }


            /** check parameters */
            if (payload.acousticModel == undefined && payload.lang == undefined) throw `'acousticModel' or 'lang' parameter is required`
            if (payload.acousticModel == undefined && payload.lang != undefined && this.stt.lang.indexOf(payload.lang) === -1) throw `${payload.lang} is not a valid language`
            if (payload.acousticModel != undefined) {
                amodel = await this.db.am.findModel(payload.acousticModel)
                if (!amodel) throw `Acoustic Model '${payload.acousticModel}' does not exist`
            } else if (payload.lang != undefined) {
                amodel = await this.db.am.findModels({ lang: payload.lang })
                if (amodel.length == 0) throw `No Acoustic Model is found for the given language '${payload.lang}'`
                amodel = amodel[amodel.length - 1]
            }


            /** Create a Model from a precompiled one using a file or link */
            if (payload.file != undefined || payload.link != undefined) {
                if (payload.file != undefined) {
                    await this.uncompressFile(payload.file.mimetype, payload.file.path, destPath)
                    await fs.unlink(payload.file.path)
                } else {
                    const fileparams = await this.downloadLink(payload.link)
                    await this.uncompressFile(fileparams["type"], fileparams["path"], destPath)
                    await fs.unlink(fileparams["path"])
                }
                const check = await this.stt.checkModel(payload.modelId, 'lm')
                if (check) {
                    await this.db.lm.createModel(payload.modelId, amodel.modelId, amodel.lang, payload.type, 1)
                    return cb({ bool: true, msg: `Language Model '${payload.modelId}' is successfully created` })
                } else {
                    rimraf(destPath, async (err) => { if (err) throw err; }) //remove folder
                    return cb({ bool: false, msg: 'This is not a valid model' })
                }
            }

            {
                let intents = []
                let entities = []
                /** Add data to Model if they exist */
                if (payload.data != undefined) {
                    /** Prepare intents if they exist */
                    if (payload.data.intents != undefined)
                        payload.data.intents.forEach(intent => {
                            if (intent.name != undefined && intent.items != undefined && intent.items.length != 0) {
                                intent.items = [...new Set(intent.items)]
                                intents.push({ 'name': intent.name, 'items': intent.items })
                            } else
                                throw 'The data intents are invalid'
                        })
                    const namesI = intents.map(obj => { return obj.name })
                    const uniqnamesI = [...new Set(intents.map(obj => { return obj.name }))]
                    if (namesI.length != uniqnamesI.length) throw 'The data intents are invalid (duplicated intents!!)'

                    /** Prepare entities if they exist */
                    if (payload.data.entities != undefined)
                        payload.data.entities.forEach(entity => {
                            if (entity.name != undefined && entity.items != undefined && entity.items.length != 0) {
                                entity.items = [...new Set(entity.items)]
                                entities.push({ 'name': entity.name, 'items': entity.items })
                            } else
                                throw 'The data entities are invalid'
                        })
                    const namesE = entities.map(obj => { return obj.name })
                    const uniqnamesE = [...new Set(entities.map(obj => { return obj.name }))]
                    if (namesE.length != uniqnamesE.length) throw 'The data entities are invalid (duplicated intents!!)'
                }
                /** Create the Model */
                await this.db.lm.createModel(payload.modelId, amodel.modelId, amodel.lang, payload.type, 0, 1, entities, intents)
                await fs.mkdir(destPath)
                return cb({ bool: true, msg: `The Language Model '${payload.modelId}' is successfully created` })
            }
        } catch (err) {
            if (payload.file != undefined) await fs.unlink(payload.file.path)
            return cb({ bool: false, msg: err })
        }
    })
    this.app.components['WebServer'].on('deleteLModel', async (cb, modelId) => {
        try {
            const res = await this.db.lm.findModel(modelId)
            if (!res) throw `Language Model '${modelId}' does not exist`
            const services = await this.db.service.findServices({ LModelId:modelId,  isOn: 1 })
            if (services.length != 0) throw `Language Model '${modelId}' is actually used by a running service`
            
            await this.db.lm.deleteModel(modelId)
            rimraf(`${process.env.LM_PATH}/${modelId}`, async (err) => { if (err) throw err; }) //remove folder
            return cb({ bool: true, msg: `Language Model '${modelId}' is successfully removed` })
        } catch (err) {
            return cb({ bool: false, msg: err })
        }
    })
    this.app.components['WebServer'].on('getLModel', async (cb, modelId, param = '') => {
        try {
            const res = await this.db.lm.findModel(modelId)
            if (!res) throw `Language Model '${modelId}' does not exist`
            if (param == '')
                return cb({ bool: true, msg: res })
            else
                return cb({ bool: true, msg: res[param] })
        } catch (err) {
            return cb({ bool: false, msg: err })
        }
    })
    this.app.components['WebServer'].on('getLModels', async (cb) => {
        try {
            const res = await this.db.lm.findModels()
            let models = []
            res.forEach((model) => {
                let intents = model.intents.map(obj => { return obj.name })
                let entities = model.entities.map(obj => { return obj.name })
                model.intents = intents
                model.entities = entities
                models.push(model)
            })
            return cb({ bool: true, msg: models })
        } catch (err) {
            return cb({ bool: false, msg: err })
        }
    })
    this.app.components['WebServer'].on('generateLModel', async (cb, modelId) => {
        try {
            const model = await this.db.lm.findModel(modelId)
            if (!model) throw `Language Model '${modelId}' does not exist`
            if (model.isDirty == 0 && model.isGenerated == 1)
                throw `Language Model '${modelId}' is already generated and is up-to-date`
            if (model.updateState > 0)
                throw `Language Model '${modelId}' is in generation process`

            await this.db.lm.generationState(modelId, 1, 'In generation process')
            this.generateModel(model, this.db.lm)
            return cb({ bool: true, msg: `The process of generation of the Language Model '${modelId}' is successfully started.` })
        } catch (err) {
            debug(err)
            return cb({ bool: false, msg: err })
        }
    })


    /**
     * Acoustic Model events from WebServer
     *      createAModel
     *      deleteAModel
     *      getAModel
     *      getAModels
     */
    this.app.components['WebServer'].on('createAModel', async (cb, payload) => {
        try {
            const destPath = `${process.env.AM_PATH}/${payload.modelId}`
            const res = await this.db.am.findModel(payload.modelId)
            if (res) throw `Acoustic Model '${payload.modelId}' exists`
            if (payload.lang === undefined) throw `'lang' parameter is required`
            if (this.stt.lang.indexOf(payload.lang) === -1) throw `${payload.lang} is not a valid language`
            if (payload.file == undefined && payload.link == undefined) throw `'link' or 'file' parameter is required`

            if (payload.file != undefined) {
                await this.uncompressFile(payload.file.mimetype, payload.file.path, destPath)
                await fs.unlink(payload.file.path)
            } else if (payload.link != undefined) {
                const fileparams = await this.downloadLink(payload.link)
                await this.uncompressFile(fileparams["type"], fileparams["path"], destPath)
                await fs.unlink(fileparams["path"])
            }
            const check = await this.stt.checkModel(payload.modelId, 'am')
            if (check) {
                await this.db.am.createModel(payload.modelId, payload.lang, payload.desc)
                return cb({ bool: true, msg: `Acoustic Model '${payload.modelId}' is successfully created` })
            } else {
                rimraf(destPath, async (err) => { if (err) throw err; }) //remove folder
                throw 'This is not a valid model'
            }
        } catch (err) {
            if (payload.file != undefined) fs.unlink(payload.file.path).catch(err => { })
            return cb({ bool: false, msg: err })
        }
    })
    this.app.components['WebServer'].on('deleteAModel', async (cb, modelId) => {
        try {
            const res = await this.db.am.findModel(modelId)
            if (!res) throw `Acoustic Model '${modelId}' does not exist`
            const check = await this.db.lm.findModels({ acmodelId: modelId })
            if (check.length > 0) throw `There are language models (${check.length}) that use the acoustic model '${modelId}'`
            await this.db.am.deleteModel(modelId)
            rimraf(`${process.env.AM_PATH}/${modelId}`, async (err) => { if (err) throw err; }) //remove folder
            return cb({ bool: true, msg: `Acoustic Model '${modelId}' is successfully removed` })
        } catch (err) {
            return cb({ bool: false, msg: err })
        }
    })
    this.app.components['WebServer'].on('getAModel', async (cb, modelId) => {
        try {
            const res = await this.db.am.findModel(modelId)
            if (!res) throw `Acoustic Model '${modelId}' does not exist`
            return cb({ bool: true, msg: res })
        } catch (err) {
            return cb({ bool: false, msg: err })
        }
    })
    this.app.components['WebServer'].on('getAModels', async (cb) => {
        try {
            const res = await this.db.am.findModels()
            return cb({ bool: true, msg: res })
        } catch (err) {
            return cb({ bool: false, msg: err })
        }
    })



    /**
     * Entity/Intent events from WebServer
     *      addType
     *      deleteType
     *      updateType
     *      getType
     *      getTypes
     */
    this.app.components['WebServer'].on('createType', async (cb, payload, type) => {
        /**
        this.emit('create', payload, type, async (err) => {
            if (err) {
                if (payload.file != undefined) await fs.unlink(payload.file.path)
                return cb({ bool: false, msg: err })
            }
            return cb({ bool: true, msg: `${payload.name} is successfully added to language model '${payload.modelId}'` })
        })
        */
        try {
            const data = {}
            const model = await this.db.lm.findModel(payload.modelId)
            if (!model) throw `Language Model '${payload.modelId}' does not exist`
            if (payload.file == undefined && payload.content.length == undefined) throw `'file' parameter or a JSON body (liste of values) is required`
            const exist = await this.checkExists(model, payload.name, type, false)
            if (exist) throw `${payload.name} already exists`

            if (payload.file != undefined) {
                const content = await fs.readFile(payload.file.path, 'utf-8')
                data.name = payload.name
                data.items = content.split('\n')
                await fs.unlink(payload.file.path)
            } else if (payload.content.length != undefined && payload.content.length != 0) {
                data.name = payload.name
                data.items = payload.content
            }
            /** check the data before save */
            if (data.items.length == 0) throw `${payload.name} is empty`

            await this.db.lm.addElemInList(payload.modelId, type, data)
            return cb({ bool: true, msg: `${payload.name} is successfully added` })
        } catch (err) {
            debug(err)
            if (payload.file != undefined) await fs.unlink(payload.file.path)
            return cb({ bool: false, msg: err })
        }
    })
    this.app.components['WebServer'].on('deleteType', async (cb, payload, type) => {
        try {
            const model = await this.db.lm.findModel(payload.modelId)
            if (!model) throw `Language Model '${payload.modelId}' does not exists`
            const exist = await this.checkExists(model, payload.name, type, true)
            if (!exist) throw `${payload.name} does not exist`

            await this.db.lm.removeElemFromList(payload.modelId, type, payload.name)
            return cb({ bool: true, msg: `${payload.name} is successfully removed` })
        } catch (err) {
            if (payload.file != undefined) await fs.unlink(payload.file.path)
            return cb({ bool: false, msg: err })
        }
    })
    this.app.components['WebServer'].on('updateType', async (cb, payload, type, update) => {
        try {
            const model = await this.db.lm.findModel(payload.modelId)
            if (!model) throw `Language Model '${payload.modelId}' does not exist`
            if (payload.file == undefined && payload.content.length == undefined) throw `'file' parameter or a JSON body (liste of values) is required`

            /** get data */
            const obj = await this.checkExists(model, payload.name, type, true)
            if (!obj) throw `${payload.name} does not exist`

            if (payload.file != undefined) {
                const content = await fs.readFile(payload.file.path, 'utf-8')
                tmp = content.split('\n')
                await fs.unlink(payload.file.path)
            } else if (payload.content.length != undefined && payload.content.length != 0) {
                tmp = payload.content
            }

            /** check the data before save */
            if (tmp.length == 0) throw `${payload.name} is empty`

            switch (update) {
                case 'put':
                    break
                case 'patch':
                    tmp = obj.items.concat(tmp)
                    tmp = [...new Set(tmp)]
                    break
                default: throw `Undefined update parameter from 'updateType' eventEmitter`
            }
            await this.db.lm.updateElemFromList(payload.modelId, `${type}.${obj.idx}.items`, tmp)
            return cb({ bool: true, msg: `${payload.name} is successfully updated` })
        } catch (err) {
            if (payload.file != undefined) await fs.unlink(payload.file.path)
            return cb({ bool: false, msg: err })
        }
    })
    this.app.components['WebServer'].on('getType', async (cb, payload, type) => {
        try {
            const model = await this.db.lm.findModel(payload.modelId)
            if (!model) throw `Language Model '${payload.modelId}' does not exist`
            const obj = await this.checkExists(model, payload.name, type, true)
            if (!obj) throw `${payload.name} does not exist`
            return cb({ bool: true, msg: obj.items })
        } catch (err) {
            return cb({ bool: false, msg: err })
        }
    })
    this.app.components['WebServer'].on('getTypes', async (cb, modelId, type) => {
        try {
            const model = await this.db.lm.findModel(payload.modelId)
            if (!model) throw `Language Model '${payload.modelId}' does not exist`
            return cb({ bool: true, msg: model[type] })
        } catch (err) {
            return cb({ bool: false, msg: err })
        }
    })

}
