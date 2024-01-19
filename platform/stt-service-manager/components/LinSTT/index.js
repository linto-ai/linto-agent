const Component = require(`../component.js`)
const debug = require('debug')(`app:linstt`)
const compressing = require('compressing');
const fetch = require('node-fetch');
const mime = require('mime-types')
const fs = require('fs')
const am = require(`${process.cwd()}/models/models/AMUpdates`)
const lm = require(`${process.cwd()}/models/models/LMUpdates`)
const service = require(`${process.cwd()}/models/models/ServiceUpdates`)

class LinSTT extends Component {
    constructor(app) {
        super(app)
        this.id = this.constructor.name
        this.app = app
        this.db = { am: am, lm: lm, service: service }
        this.type = ['lvcsr', 'cmd']
        switch (process.env.LINSTT_SYS) {
            case 'kaldi':
                this.stt = require(`./Kaldi`)
                break
            case '': this.stt = ''; break
            default: throw 'Undefined LinSTT system'
        }
        return this.init()
    }

    /**
     * Other functions used by Acoustic and Language Model events
     */
    verifType(type) {
        if (this.type.indexOf(type) != -1) return 1
        else return 0
    }

    async downloadLink(link) {
        return new Promise(async (resolve, rejection) => {
            try {
                const filename = link.split('/').pop()
                const filepath = `${process.env.TEMP_FILE_PATH}/${filename}`
                const res = await fetch(link, {method:"GET"})
                if(res.status != 200){
                    if (res.statusText == "Not Found")
                        throw `${link} ${res.statusText}`
                    else throw res.statusText
                }
                const file=fs.createWriteStream(filepath,{'emitClose':true})
                res.body.pipe(file)
                res.body.on('end',() => {
                    const filetype = mime.lookup(filepath)
                    resolve({ 'path': filepath, 'type': filetype })
                })
                res.body.on('error',(err) => {throw err})
            } catch (err) {
                console.error("ERROR: " + err)
                rejection(err)
            }
        })
    }

    async uncompressFile(type, src, dest) {
        return new Promise(async (resolve, rejection) => {
            try {
                if (type == 'application/zip')
                    compressing.zip.uncompress(src, dest).then(() => {
                        resolve('uncompressed')
                    }).catch(err => {
                        rejection(err)
                    })
                else if (type == 'application/gzip')
                    compressing.tar.uncompress(src, dest).then(() => {
                        resolve('uncompressed')
                    }).catch(err => {
                        rejection(err)
                    })
                else if (type == 'application/x-gzip')
                    compressing.tgz.uncompress(src, dest).then(() => {
                        resolve('uncompressed')
                    }).catch(err => {
                        rejection(err)
                    })
                else rejection('Undefined file format. Please use one of the following format: zip or tar.gz')
            } catch (err) {
                console.error("ERROR: " + err)
                rejection(err)
            }
        })
    }

    async checkExists(model, name, type, isTrue) {
        let exist = 0
        if (isTrue) {
            model[type].forEach(async (obj, idx) => {
                obj.idx = idx
                if (obj.name == name)
                    exist = obj
            })
        } else {
            model[type].forEach((obj) => {
                if (obj.name == name)
                    exist = 1
            })
        }
        return exist
    }

    async generateModel(res, db) {
        try {
            await this.stt.prepareParam(res.acmodelId, res.modelId).then(async () => {
                debug(`done prepareParam (${this.stt.tmplmpath})`)
                await db.generationState(res.modelId, 1, 'In generation process')
            })
            await this.stt.prepare_lex_vocab().then(async () => {
                debug(`done prepare_lex_vocab (${this.stt.tmplmpath})`)
                await db.generationState(res.modelId, 3, 'In generation process')
            })
            await this.stt.prepare_intents(res.intents).then(async () => {
                debug(`done prepare_intents (${this.stt.tmplmpath})`)
                await db.generationState(res.modelId, 8, 'In generation process')
            })
            await this.stt.prepare_entities(res.entities).then(async () => {
                debug(`done prepare_entities (${this.stt.tmplmpath})`)
                await db.generationState(res.modelId, 13, 'In generation process')
            })

            this.stt.check_entities()
            debug(`done check_entities (${this.stt.tmplmpath})`)

            await this.stt.prepare_new_lexicon().then(async () => {
                debug(`done prepare_new_lexicon (${this.stt.tmplmpath})`)
                await db.generationState(res.modelId, 15, 'In generation process')
            })
            await this.stt.generate_arpa().then(async () => {
                debug(`done generate_arpa (${this.stt.tmplmpath})`)
                await db.generationState(res.modelId, 20, 'In generation process')
            })
            await this.stt.prepare_lang().then(async () => {
                debug(`done prepare_lang (${this.stt.tmplmpath})`)
                await db.generationState(res.modelId, 60, 'In generation process')
            })
            this.stt.generate_main_and_entities_HCLG(res.acmodelId)
            await this.stt.check_previous_HCLG_creation().then(async () => {
                debug(`done generate_main_and_entities_HCLG (${this.stt.tmplmpath})`)
                await db.generationState(res.modelId, 90, 'In generation process')
            })
            await this.stt.generate_final_HCLG(res.modelId).then(async () => {
                debug(`done generate_final_HCLG (${this.stt.tmplmpath})`)
                await db.generationState(res.modelId, 100, 'In generation process')
            })
            this.stt.removeTmpFolder()

            let data = {}
            data.isGenerated = 1
            data.updateState = 0
            data.isDirty = 0
            data.oov = this.stt.oov
            data.updateStatus = `Language model is successfully generated`
            await db.updateModel(res.modelId, data)
            this.emit('serviceReload', res.modelId)
        } catch (err) {
            this.stt.removeTmpFolder()
            await db.generationState(res.modelId, -1, `ERROR: Not generated. ${err}`)
        }
    }
}

module.exports = app => new LinSTT(app)