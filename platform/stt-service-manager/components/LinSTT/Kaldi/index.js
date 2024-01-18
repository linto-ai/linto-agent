const debug = require('debug')(`app:linstt:kaldi`)
const fs = require('fs').promises
const rimraf = require("rimraf");
const ini = require('ini')
const exec = require('child_process').exec;
const ncp = require('ncp').ncp;
const ncpPromise = require('util').promisify(ncp)
const datetime = require('node-datetime')
const sleep = require('util').promisify(setTimeout)

Array.prototype.diff = function (a) {
    return this.filter(function (i) { return a.indexOf(i) < 0; });
};

/**
 * Execute simple shell command (async wrapper).
 * @param {String} cmd
 * @return {Object} { stdout: String, stderr: String }
 */
async function sh(cmd) {
    return new Promise(function (resolve, reject) {
        try {
            exec(cmd, (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(stdout);
                }
            })
        } catch (err) {
            reject(err)
        }
    });
}



function uuidv4() {
    const date = datetime.create().format('mdY-HMS')
    return date + '-yxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

class Kaldi {
    constructor() {
        this.lang = process.env.LANGUAGE.split(',')
        this.lang = this.lang.map(s => s.trim())
    }

    async getAMParams(acmodelId) {
        const content = await fs.readFile(`${process.env.AM_PATH}/${acmodelId}/decode.cfg`, 'utf-8')
        const config = ini.parse(content.replace(/:/g, '='), 'utf-8')
        const lmGenPath = `${process.env.AM_PATH}/${acmodelId}/${config.decoder_params.lmPath}`
        const lmGenOrder = config.decoder_params.lmOrder
        return { lmGenPath: lmGenPath, lmOrder: lmGenOrder }
    }

    async checkModel(modelId, type) {
        try {
            const AM = ['conf/', 'ivector_extractor/', 'decode.cfg', 'final.mdl', 'tree']
            const LMGen = ['g2p/.tool', 'g2p/model', 'dict/lexicon.txt', 'dict/extra_questions.txt', 'dict/nonsilence_phones.txt', 'dict/optional_silence.txt', 'dict/silence_phones.txt']
            const LM = ['HCLG.fst', 'words.txt']
            switch (type) {
                case 'am':
                    for (let i = 0; i < AM.length; i++)
                        await fs.stat(`${process.env.AM_PATH}/${modelId}/${AM[i]}`)
                    const params = await this.getAMParams(modelId)
                    for (let i = 0; i < LMGen.length; i++)
                        await fs.stat(`${params.lmGenPath}/${LMGen[i]}`)
                    break
                case 'lm':
                    for (let i = 0; i < LM.length; i++)
                        await fs.stat(`${process.env.LM_PATH}/${modelId}/${LM[i]}`)
                    break
            }
            return true
        } catch (err) {
            return false
        }
    }

    async phonetisation(g2ptool, g2pmodel, oovFile) {
        try {
            let lex = {}
            switch (g2ptool) {
                case "phonetisaurus":
                    lex = await sh(`phonetisaurus-apply --model ${g2pmodel} --word_list ${oovFile}`)
                    break
                case 'sequitur':
                    lex = await sh(`g2p.py --encoding=utf-8 --model=${g2pmodel} --apply  ${oovFile}`)
                    break
                default:
                    debug('undefined g2p tool')
                    throw 'Error during language model generation'
            }
            lex = lex.split('\n').filter(function (el) { return el; })
            lex = lex.map(s => s.split('\t'))
            return lex
        } catch (err) {
            throw err
        }
    }

    prepareIntent(intent, words) {
        /**
         * Apply a set of transformations
            * convert to lowercase
            * remove multiple spaces
            * split commands based on comma character
            * split commands based on point character
            * remove the begin-end white spaces
         */
        let newIntent = intent.items.map(elem => elem.toLowerCase().trim().split(/,|\./))
        newIntent = newIntent.flat()
        newIntent = newIntent.filter(function (el) { return el; }) //remove empty element from list
        newIntent = newIntent.map(s => s.replace(/^##.*/g, '')) //remove starting character (markdown format)
        newIntent = newIntent.map(s => s.replace(/^ *- */g, '')) //remove starting character (markdown format)
        newIntent = newIntent.map(s => s.replace(/\[[^\[]*\]/g, '')) //remove entity values
        newIntent = newIntent.map(s => s.replace(/\(/g, '#')) //add entity identifier
        newIntent = newIntent.map(s => s.replace(/\)/g, ' ')) //remove parenthesis
        newIntent = newIntent.map(s => s.replace(/’/g, '\'')) //replace special character
        newIntent = newIntent.map(s => s.replace(/'/g, '\' ')) //add space after quote symbol
        newIntent = newIntent.map(s => s.replace(/æ/g, 'ae')) //replace special character
        newIntent = newIntent.map(s => s.replace(/œ/g, 'oe')) //replace special character
        newIntent = newIntent.map(s => s.replace(/[^a-z àâäçèéêëîïôùûü_'\-#]/g, '')) //remove other symbols
        newIntent = newIntent.map(s => s.replace(/ +/g, ' ')) //remove double space
        newIntent = newIntent.map(s => s.trim()) //remove the begin-end white spaces
        newIntent = newIntent.filter(function (el) { return el; }) //remove empty element from list
        newIntent = newIntent.sort()


        //        intent.items.forEach((item) => {
        //            const subCmds = item.toLowerCase().replace(/ +/g, ' ').split(/,|\./).map(elem => elem.trim())
        //            const filtered = subCmds.filter(function (el) { return el; }) //remove empty element from list
        //            let newCmds = filtered.map(s => s.replace(/^ *- */, '')) //remove starting character (markdown format)
        //            newCmds = newCmds.map(s => s.replace(/\[[^\[]*\]/g, '')) //remove entity values
        //            newCmds = newCmds.map(s => s.replace(/\(/g, '#')) //add entity identifier
        //            newCmds = newCmds.map(s => s.replace(/\)/g, ' ')) //remove parenthesis
        //            newCmds = newCmds.map(s => s.replace(/’/g, '\'')) //replace special character
        //            newCmds = newCmds.map(s => s.replace(/'/g, '\' ')) //add space after quote symbol
        //            newCmds = newCmds.map(s => s.replace(/æ/g, 'ae')) //replace special character
        //            newCmds = newCmds.map(s => s.replace(/œ/g, 'oe')) //replace special character
        //            newCmds = newCmds.map(s => s.replace(/[^a-z àâäçèéêëîïôùûü_'\-#]/g, '')) //remove other symbols
        //            newCmds = newCmds.map(s => s.replace(/ +/g, ' ')) //remove double space
        //            newCmds = newCmds.map(s => s.trim()) //remove the begin-end white spaces
        //            newCmds = newCmds.filter(function (el) { return el; }) //remove empty element from list
        //            newIntent.push(newCmds)
        //        })
        //
        //        newIntent = newIntent.sort()


        /**
         * match the commands vocab with the defined lexicon
         * use the initialized word list and find each sequence of words in the commande
         */
        let cmd = newIntent.flat().join(' \n ')
        cmd = ` ${cmd} `
        words.forEach(word => {
            if (cmd.indexOf(word.seq) !== -1)
                cmd = cmd.replace(` ${word.seq} `, ` ${word.org} `)
        })
        newIntent = cmd.trim().split(' \n ').map(elem => elem.trim()) //re-build list

        /**
         * remove sub-commands
         */
        for (let i = 0; i < newIntent.length; i++)
            for (let j = 0; j < newIntent.length; j++)
                if (i !== j && ` ${newIntent[i]} `.indexOf(` ${newIntent[j]} `) !== -1) {
                    newIntent[i] = ""
                    break
                }
        newIntent = newIntent.filter(function (el) { return el; }) //remove empty element from list
        newIntent = newIntent.sort()
        return newIntent
    }

    prepareEntity(entity) {
        /**
         * Apply a set of transformations
            * convert to lowercase
            * remove duplicates
            * select entities with multiple pronunciations
         */
        let newEntity = entity.items.map(elem => elem.toLowerCase().trim())
        newEntity = [...new Set(newEntity)] //remove duplicates from list
        newEntity = newEntity.filter(function (el) { return el; }) //remove empty element from list
        const pronunciations = newEntity.map(e => { if (e.indexOf(process.env.DICT_DELIMITER) !== -1) return e; else return '' })
        newEntity = newEntity.map(e => { if (e.indexOf(process.env.DICT_DELIMITER) !== -1) return e.split(process.env.DICT_DELIMITER)[0]; else return e })

        newEntity = newEntity.filter(function (el) { return el; }) //remove empty element from list
        newEntity = newEntity.map(s => s.replace(/^##.*/, '')) //remove starting character (markdown format)
        newEntity = newEntity.map(s => s.replace(/^ *- */, '')) //remove starting character (markdown format)
        newEntity = newEntity.map(s => s.replace(/\[/g, ' ')) //remove special characters
        newEntity = newEntity.map(s => s.replace(/\]/g, ' ')) //remove special characters
        newEntity = newEntity.map(s => s.replace(/\(/g, ' ')) //remove parenthesis
        newEntity = newEntity.map(s => s.replace(/\)/g, ' ')) //remove parenthesis
        newEntity = newEntity.map(s => s.replace(/’/g, '\'')) //replace special character
        newEntity = newEntity.map(s => s.replace(/'/g, '\' ')) //add space after quote symbol
        newEntity = newEntity.map(s => s.replace(/æ/g, 'ae')) //replace special character
        newEntity = newEntity.map(s => s.replace(/œ/g, 'oe')) //replace special character
        newEntity = newEntity.map(s => s.replace(/[^a-z àâäçèéêëîïôùûü_'\-]/g, '')) //remove other symbols
        newEntity = newEntity.map(s => s.replace(/ +/g, ' ')) //remove double space
        newEntity = newEntity.map(s => s.trim()) //remove the begin-end white spaces
        newEntity = newEntity.filter(function (el) { return el; }) //remove empty element from list
        newEntity = newEntity.sort()

        return { entity: newEntity, pron: pronunciations }
    }


    async prepareParam(acmodelId, lgmodelId) {
        //get acoustic model parameters
        const params = await this.getAMParams(acmodelId)
        const tmpfoldername = lgmodelId + '_' + uuidv4()
        /** Configuration Section */
        /** ****************** */
        this.tmplmpath = `${process.env.TEMP_FILE_PATH}/${tmpfoldername}` //temporary LM path
        this.entitypath = `${this.tmplmpath}/fst` //folder where the normalized entities will be saved
        const lexiconpath = `${this.tmplmpath}/lexicon` //folder where to save the new lexicon including the oov
        this.dictpath = `${this.tmplmpath}/dict` //folder to save the new dictionary
        this.langpath = `${this.tmplmpath}/lang` //folder to save the new lang files
        this.graph = `${this.tmplmpath}/graph` //folder to save the graph files
        this.langextraspath = `${this.tmplmpath}/lang_new` //folder to save the new lang files
        this.intentsFile = `${this.tmplmpath}/text` //LM training file path
        this.lexiconFile = `${this.dictpath}/lexicon.txt` //new lexicon file
        this.nonterminalsFile = `${this.dictpath}/nonterminals.txt` //nonterminals file
        this.pronunciationFile = `${this.tmplmpath}/pronunciations` //words with different pronunciations
        this.arpa = `${this.tmplmpath}/arpa` //arpa file path
        this.g2ptool = await fs.readFile(`${params.lmGenPath}/g2p/.tool`, 'utf-8')
        this.g2pmodel = `${params.lmGenPath}/g2p/model`
        const dictgenpath = `${params.lmGenPath}/dict`
        this.lexicongenfile = `${params.lmGenPath}/dict/lexicon.txt`
        this.oovFile = `${lexiconpath}/oov`
        this.graphError = false
        this.graphMsg = ""
        /** ****************** */

        let exist = await fs.stat(this.tmplmpath).then(async () => { return true }).catch(async () => { return false })
        if (exist) { await new Promise((resolve, reject) => { rimraf(this.tmplmpath, async (err) => { if (err) reject(err); resolve() }); }) }
        await fs.mkdir(this.tmplmpath) //create the temporary LM folder
        await fs.mkdir(this.entitypath) //create the fst folder
        await ncpPromise(dictgenpath, this.dictpath) //copy the dict folder
        //await fs.mkdir(dictpath) //create the dict folder
        await fs.mkdir(this.langpath) //create the langprep folder
        await fs.mkdir(lexiconpath) //create the lexicon folder
        await fs.mkdir(this.langextraspath) //create the langextras folder
    }


    async prepare_lex_vocab() {
        this.lexicon = [] //lexicon (words + pronunciation)
        this.words = [] //all list of words
        this.specwords = [] //words with symbol '-'
        //prepare lexicon and words
        const content = await fs.readFile(this.lexicongenfile, 'utf-8')
        const lexiconFile = content.split('\n')
        lexiconFile.forEach((curr) => {
            const e = curr.trim().replace('\t', ' ').split(' ')
            const filtered = e.filter(function (el) { return el; })
            const item = filtered[0]
            if (item !== undefined) {
                filtered.shift()
                this.lexicon.push([item, filtered.join(' ')])
                this.words.push(item)
                if (item.indexOf('-') !== -1) {
                    this.specwords.push({ seq: [item.replace(/-/g, " ")], org: item })
                }
            }
        })
    }


    async prepare_intents(intents) {
        this.newIntent = []
        this.fullVocab = []
        //prepare intents
        intents.forEach((intent) => {
            this.newIntent.push(this.prepareIntent(intent, this.specwords))
        })
        this.newIntent = this.newIntent.flat()
        if (this.newIntent.length === 0)
            throw 'No command found'
        this.fullVocab.push(this.newIntent.join(' ').split(' '))
        await fs.writeFile(this.intentsFile, this.newIntent.join('\n').replace(/#/g, '#nonterm:'), 'utf-8', (err) => { throw err })
    }


    async prepare_entities(entities) {
        this.entityname = []
        this.pronunciations = []
        //prepare entities
        entities.forEach((entity) => {
            this.entityname.push(entity.name)
            const newEntity = this.prepareEntity(entity)
            if (newEntity.entity.length === 0)
                throw `The entity ${entity.name} is empty (either remove it or update it)`
            this.pronunciations.push(newEntity.pron)
            this.fullVocab.push(newEntity.entity.join(' ').split(' '))
            fs.writeFile(`${this.entitypath}/${entity.name}`, newEntity.entity.join('\n') + '\n', 'utf-8', (err) => { throw err })
        })
        this.pronunciations = this.pronunciations.flat().filter(function (el) { return el; })
    }


    check_entities() {
        //check entities
        this.listentities = this.newIntent.join(' ').split(' ').filter(word => word.indexOf('#') !== -1)
        this.listentities = this.listentities.map(w => w.replace(/#/, ''))
        this.listentities = this.listentities.filter((v, i, a) => a.indexOf(v) === i)
        const diff = this.listentities.diff(this.entityname)
        if (diff.length !== 0) throw `This list of entities are not yet created: [${diff}]`
    }


    async prepare_new_lexicon() {
        // Prepare OOV words
        this.fullVocab = [...new Set(this.fullVocab.flat())] //remove duplicates from list
        this.fullVocab = this.fullVocab.map(s => { if (s.indexOf('#') === -1) return s })
        this.fullVocab = this.fullVocab.filter(function (el) { return el; })
        this.fullVocab = this.fullVocab.sort()
        this.oov = this.fullVocab.diff(this.words)
        if (this.oov.length !== 0) {
            await fs.writeFile(this.oovFile, this.oov.join('\n'), 'utf-8', (err) => { throw err })
            const oov_lex = await this.phonetisation(this.g2ptool.trim(), this.g2pmodel, this.oovFile)
            const oov1 = oov_lex.map(s => s[0])
            const diff = this.oov.diff(oov1)
            if (diff.length !== 0) {
                throw `Error during language model generation: the phonetisation of some words were not generated [${diff}]`
            }
            this.lexicon = this.lexicon.concat(oov_lex)
        }

        // Prepare multiple pronunciations
        if (this.pronunciations.length !== 0) {
            for (let i = 0; i < this.pronunciations.length; i++) {
                const words = this.pronunciations[i].split(process.env.DICT_DELIMITER)
                const org = words[0]
                words.shift()
                await fs.writeFile(this.pronunciationFile, words.join('\n'), { encoding: 'utf-8', flag: 'w' })
                let pronon_lex = await this.phonetisation(this.g2ptool.trim(), this.g2pmodel, this.pronunciationFile)
                pronon_lex = pronon_lex.map(s => { s[0] = org; return s })
                this.lexicon = this.lexicon.concat(pronon_lex)
            }
        }
        this.lexicon = this.lexicon.map(s => { return `${s[0]}\t${s[1]}` })
        this.lexicon = [...new Set(this.lexicon)]
        this.lexicon = this.lexicon.sort()

        // save the new lexicon
        await fs.writeFile(this.lexiconFile, `${this.lexicon.join('\n')}\n`, { encoding: 'utf-8', flag: 'w' })
        // create nonterminals file
        if (this.listentities.length !== 0)
            await fs.writeFile(this.nonterminalsFile, this.listentities.map(s => { return `#nonterm:${s}` }).join('\n'), { encoding: 'utf-8', flag: 'w' })
        // remove lexiconp.txt if exist
        try {
            await fs.stat(`${this.dictpath}/lexiconp.txt`).then(async () => { return true }).catch(async () => { return false })
            await fs.unlink(`${this.dictpath}/lexiconp.txt`)
        } catch (err) {}
    }

    async prepare_lang() {
        try {
            const scriptShellPath = `${process.cwd()}/components/LinSTT/Kaldi/scripts`
            await sh(`cd ${scriptShellPath}; prepare_lang.sh ${this.dictpath} "<unk>" ${this.langpath}/tmp ${this.langpath}`)
        } catch (err) {
            debug(err)
            throw 'Error during language model preparation'
        }
    }

    async generate_arpa() {
        const ngram = process.env.NGRAM
        try {
            await sh(`add-start-end.sh < ${this.tmplmpath}/text > ${this.tmplmpath}/text.s`)
            await sh(`ngt -i=${this.tmplmpath}/text.s -n=${ngram} -o=${this.tmplmpath}/irstlm.${ngram}.ngt -b=yes`)
            await sh(`tlm -tr=${this.tmplmpath}/irstlm.${ngram}.ngt -n=${ngram} -lm=wb -o=${this.arpa}`)
        } catch (err) {
            debug(err)
            throw 'Error during NGRAM language model generation'
        }
    }

    generate_main_and_entities_HCLG(acmodelId) {
        const mainG = `${this.langextraspath}/main`
        ncpPromise(this.langpath, mainG).then(async () => {
            try {
                await sh(`arpa2fst --disambig-symbol=#0 --read-symbol-table=${this.langpath}/words.txt ${this.arpa} ${mainG}/G.fst`)
                await sh(`mkgraph.sh --self-loop-scale 1.0 ${mainG} ${process.env.AM_PATH}/${acmodelId} ${this.graph}_main`)
            } catch (err) {
                this.graphError = true
                this.graphMsg = 'Error during main HCLG graph generation'
                debug('Error during main HCLG graph generation')
                debug(err)
            }
        }).catch(err => { 
            this.graphError = true
            this.graphMsg = 'Error during main lang copy'
            debug('Error during main lang copy')
        })
        
        this.listentities.forEach((entity) => {
            const langG = `${this.langextraspath}/${entity}`
            const scriptShellPath = `${process.cwd()}/components/LinSTT/Kaldi/scripts`
            ncpPromise(this.langpath, langG).then(async () => {
                try {
                    await sh(`awk -f ${scriptShellPath}/fst.awk ${this.langpath}/words.txt ${this.entitypath}/${entity} > ${this.entitypath}/${entity}.int`)
                    await sh(`fstcompile ${this.entitypath}/${entity}.int | fstarcsort --sort_type=ilabel > ${langG}/G.fst`)
                    await sh(`mkgraph.sh --self-loop-scale 1.0 ${langG} ${process.env.AM_PATH}/${acmodelId} ${this.graph}/${entity}`)
                } catch (err) {
                    this.graphError = true
                    this.graphMsg = 'Error during entities HCLG graph generation'
                    debug(`Error during entities HCLG graph generation: ${this.graph}/${entity}`)
                    debug(err)
                }
            }).catch(err => {
                this.graphError = true
                this.graphMsg = 'Error during entities HCLG graph generation'
                debug(`Error during entities HCLG graph generation: ${this.graph}/${entity}`)
            })
        })
    }

    async check_previous_HCLG_creation() {
        let retry = true
        const time = 1 //in seconds
        while (retry) {
            debug('check_previous_HCLG_creation')
            retry = false
            try {
                await fs.stat(`${this.graph}_main/HCLG.fst`)
            } catch (err) {
                retry = true
            }
            this.listentities.forEach(async (entity) => {
                try {
                    await fs.stat(`${this.graph}/${entity}/HCLG.fst`)
                } catch (err) {
                    retry = true
                }
            })
            await sleep(time * 1000)
            if (this.graphError)
                throw this.graphMsg
        }
        debug('wait until all files will be created on disk')
        await sleep(1000)
        debug('all files are successfully generated')
    }

    async generate_final_HCLG(lgmodelId) {
        if (this.listentities.length == 0) {
            try {
                await fs.copyFile(`${this.graph}_main/HCLG.fst`, `${process.env.LM_PATH}/${lgmodelId}/HCLG.fst`)
                await fs.copyFile(`${this.graph}_main/words.txt`, `${process.env.LM_PATH}/${lgmodelId}/words.txt`)
            } catch (err) {
                debug(err)
                throw 'Error while copying the new decoding graph'
            }
        } else {
            try {
                let cmd = ''
                const content = await fs.readFile(`${this.langpath}/phones.txt`, 'utf-8')
                let id = []
                let list = content.split('\n')
                list = list.map(s => s.replace(/^(?!#nonterm.*$).*/g, ''))
                list = list.filter(function (el) { return el; }) //remove empty element from list
                list = list.map(s => { const a = s.split(' '); id.push(a[1]); return a[0]; })
                this.listentities.forEach(async (entity) => {
                    const idx = list.indexOf(`#nonterm:${entity}`)
                    cmd += `${id[idx]} ${this.graph}/${entity}/HCLG.fst `
                })
                const offset = list.indexOf(`#nonterm_bos`)
                await sh(`make-grammar-fst --write-as-grammar=false --nonterm-phones-offset=${id[offset]} ${this.graph}_main/HCLG.fst ${cmd} ${this.graph}/HCLG.fst`)
                await fs.copyFile(`${this.graph}/HCLG.fst`, `${process.env.LM_PATH}/${lgmodelId}/HCLG.fst`)
                await fs.copyFile(`${this.langpath}/words.txt`, `${process.env.LM_PATH}/${lgmodelId}/words.txt`)
            } catch (err) {
                debug(err)
                throw 'Error while generating the decoding graph'
            }
        }
    }

    removeTmpFolder() {
        rimraf(this.tmplmpath, async (err) => { if (err) throw err })
    }
}

module.exports = new Kaldi()