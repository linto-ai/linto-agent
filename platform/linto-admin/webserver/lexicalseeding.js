const axios = require('axios')
const nodered = require('./nodered.js')
const middlewares = require('./index.js')
const fs = require('fs')
var FormData = require('form-data')

/**
 * @desc Execute STT lexical seeding on a flowID, by its service_name
 * @param {string} flowId - Id of the flow used on nodered
 * @param {string} service_name - Name of the targeted stt service
 * @return {object} - {status, msg, error(optional)}
 */

async function sttLexicalSeeding(flowId, service_name) {
    try {
        // Get stt service data
        const accessToken = await nodered.getBLSAccessToken()
        const sttAuthToken = middlewares.basicAuthToken(process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE_LOGIN, process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE_PASSWORD)
        const getSttService = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE}/service/${service_name}`, {
            method: 'get',
            headers: {
                'charset': 'utf-8',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': sttAuthToken
            }
        })
        const sttService = getSttService.data.data

        // Get lexical seeding data
        const getSttLexicalSeeding = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_BLS_SERVICE}/red/${flowId}/dataset/linstt`, {
            method: 'get',
            headers: {
                'charset': 'utf-8',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Node-RED-Deployment-Type': 'flows',
                'Authorization': accessToken
            }
        })

        const sttLexicalSeedingData = getSttLexicalSeeding.data.data
        const intents = sttLexicalSeedingData.intents
        const entities = sttLexicalSeedingData.entities
        let intentsUpdated = false
        let entitiesUpdated = false
        let updateInt = { success: '', errors: '' }
        let updateEnt = { success: '', errors: '' }

        // Update model intents
        const intentsToSend = await filterLMData('intent', sttService.LModelId, intents)
        if (intentsToSend.data.length > 0) {
            updateInt = await updateLangModel(intentsToSend, sttService.LModelId)
            if (!!updateInt.success && !!updateInt.errors) {
                intentsUpdated = true
            }
        } else {
            intentsUpdated = true
        }

        // Update model entities
        const entitiesToSend = await filterLMData('entity', sttService.LModelId, entities)

        if (entitiesToSend.data.length > 0) {
            updateEnt = await updateLangModel(entitiesToSend, sttService.LModelId)
            if (!!updateEnt.success && !!updateEnt.errors) {
                entitiesUpdated = true
            }
        } else {
            entitiesUpdated = true
        }
        if (intentsToSend.data.length > 0 || entitiesToSend.data.length > 0) {
            const getUpdatedSttLangModel = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE}/langmodel/${sttService.LModelId}`, {
                    method: 'get',
                    headers: {
                        'charset': 'utf-8',
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': sttAuthToken
                    }
                })
                // Generate Graph if model updated
            if (getUpdatedSttLangModel.data.data.isDirty === 1) {
                try {
                    await generateGraph(service_name)
                } catch (error) {
                    console.error(error)
                }
            }
        }

        // Result
        if (intentsUpdated && entitiesUpdated) {
            if (updateInt.errors.length === 0 && updateEnt.errors.length === 0) {
                return ({
                    status: 'success',
                    msg: 'Model language has been updated'
                })
            } else {
                errorMsg = 'Model updated BUT : '
                if (updateInt.errors.length > 0) {
                    updateInt.errors.map(e => {
                        errorMsg += `Warning: error on updating intent ${e.name}.`
                    })
                }
                if (updateEnt.errors.length > 0) {
                    updateEnt.errors.map(e => {
                        errorMsg += `Warning: error on updating entity ${e.name}.`
                    })
                }
                return ({
                    status: 'success',
                    msg: errorMsg
                })
            }
        } else {
            throw 'Error on updating language model'
        }
    } catch (error) {
        console.error(error)
        return ({
            status: 'error',
            msg: !!error.msg ? error.msg : error,
            error: error
        })
    }
}

/**
 * @desc filter language model data/values for lexical seeding
 * @param {string} type - "intents" or "entities"
 * @param {string} modelId - id of the targeted language model
 * @param {object} newData - data/values to be updated
 * @return {object} - {type, data(filtered)}
 */
async function filterLMData(type, modelId, newData) {
    let getDataroutePath = ''
    if (type === 'intent') {
        getDataroutePath = 'intents'
    } else if (type === 'entity') {
        getDataroutePath = 'entities'
    }

    // Current Values of the langage model
    const sttAuthToken = middlewares.basicAuthToken(process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE_LOGIN, process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE_PASSWORD)
    const getData = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE}/langmodel/${modelId}/${getDataroutePath}`, {
        method: 'get',
        headers: {
            'charset': 'utf-8',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': sttAuthToken
        }
    })
    let currentData = []
    if (!!getData.data.data) {
        currentData = getData.data.data
    }
    let dataToSend = []
    if (newData.length > 0) {
        newData.map(d => {
            let toAdd = []
            let toSendMethod = ''
            let toCompare = currentData.filter(c => c.name === d.name)
            if (toCompare.length === 0) {
                toAdd.push(...d.items)
                toSendMethod = 'post'
            } else {
                toSendMethod = 'patch'
                d.items.map(val => {
                    if (toCompare[0]['items'].indexOf(val) < 0) {
                        toAdd.push(val)
                    }
                })
            }
            if (toAdd.length > 0) {
                dataToSend.push({
                    name: d.name,
                    items: toAdd,
                    method: toSendMethod
                })
            }
        })
    }
    return {
        type,
        data: dataToSend
    }
}

/**
 * @desc Execute requests to start generating graph on a service_name language model
 * @param {string} service_name - STT service name
 */
async function generateGraph(service_name) {
    try {
        // get stt service data
        const sttAuthToken = middlewares.basicAuthToken(process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE_LOGIN, process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE_PASSWORD)
        const getSttService = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE}/service/${service_name}`, {
            method: 'get',
            headers: {
                'charset': 'utf-8',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': sttAuthToken
            }
        })
        const sttService = getSttService.data.data

        // Generate graph
        const generateGraph = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE}/langmodel/${sttService.LModelId}/generate/graph`, {
            method: 'get',
            headers: {
                'charset': 'utf-8',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': sttAuthToken
            }
        })

        return ({
            status: 'success',
            msg: generateGraph.data.data
        })
    } catch (error) {
        console.error(error)
        return ({
            status: 'error',
            msg: 'error on generating graph'
        })
    }
}

/** 
 * @desc Update a langage model with intents/entities object to add/update
 * @param {object} payload - data to be updated
 * @param {string} modelId - Id of the targeted language model 
 * @return {object} {errors, success}
 */
async function updateLangModel(payload, modelId) {
    try {
        let success = []
        let errors = []
        const type = payload.type
        for (let i in payload.data) {
            const name = payload.data[i].name
            const items = payload.data[i].items
            const method = payload.data[i].method
            const sttAuthToken = middlewares.basicAuthToken(process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE_LOGIN, process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE_PASSWORD)

            const req = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE}/langmodel/${modelId}/${type}/${name}`, {
                method,
                headers: {
                    'charset': 'utf-8',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': sttAuthToken
                },
                data: items
            })

            if (req.status === 200 || req.status === '200') {
                success.push(payload.data[i])
            } else {
                errors.push(payload.data[i])
            }
            if (success.length + errors.length === payload.data.length) {
                return ({
                    errors,
                    success
                })
            }
        }
    } catch (error) {
        console.error(error)
        return ('an error has occured')
    }
}

/**
 * @desc Execute requests to update NLU application
 * @param {string} flowId - Id of the application nodered flow
 * @return {object} - {status, msg, error (optional)}
 */
async function nluLexicalSeedingApplications(flowId) {
    try {
        // Get lexical seeding object to send to TOCK
        const accessToken = await nodered.getBLSAccessToken()
        const getNluLexicalSeeding = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_BLS_SERVICE}/red/${flowId}/dataset/tock`, {
            method: 'get',
            headers: {
                'charset': 'utf-8',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Node-RED-Deployment-Type': 'flows',
                'Authorization': accessToken
            }
        })

        // get Tock auth token
        const token = middlewares.basicAuthToken(process.env.LINTO_STACK_TOCK_USER, process.env.LINTO_STACK_TOCK_PASSWORD)

        // Tmp json file path
        const jsonApplicationContent = `{"application": ${JSON.stringify(getNluLexicalSeeding.data.application)}}`
        const appFilePath = process.cwd() + '/public/tockapp.json'

        let postApp = await new Promise((resolve, reject) => {
            fs.writeFile(appFilePath, jsonApplicationContent, async(err) => {
                if (err) {
                    console.error(err)
                    throw err
                } else {
                    const formData = new FormData()
                    formData.append('file', fs.createReadStream(appFilePath))
                    axios({
                        url: `${middlewares.useSSL() + process.env.LINTO_STACK_TOCK_SERVICE}:${process.env.LINTO_STACK_TOCK_SERVICE_PORT}${process.env.LINTO_STACK_TOCK_BASEHREF}/rest/admin/dump/application`,
                        method: 'post',
                        data: formData,
                        headers: {
                            'Authorization': token,
                            'Content-Type': formData.getHeaders()['content-type']
                        }
                    }).then((res) => {
                        //fs.unlinkSync(appFilePath)
                        if (res.status === 200) {
                            resolve({
                                status: 'success',
                                msg: 'Tock application has been updated'
                            })
                        } else {
                            reject({
                                status: 'error',
                                msg: 'Error on updating Tock application'
                            })
                        }
                    }).catch((error) => {
                        console.error(error)
                        reject(error)
                    })
                }
            })
        })
        return postApp
    } catch (error) {
        return ({
            status: 'error',
            msg: 'Error on updating Tock application',
            error
        })
    }
}

/**
 * @desc Execute requests to update NLU sentences
 * @param {string} flowId - Id of the application nodered flow
 * @return {object} - {status, msg, error (optional)}
 */

async function nluLexicalSeedingSentences(flowId) {
    try {
        // Get lexical seeding object to send to TOCK
        const accessToken = await nodered.getBLSAccessToken()
        const getNluLexicalSeeding = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_BLS_SERVICE}/red/${flowId}/dataset/tock`, {
            method: 'get',
            headers: {
                'charset': 'utf-8',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Node-RED-Deployment-Type': 'flows',
                'Authorization': accessToken
            }
        })

        // get Tock auth token
        const token = middlewares.basicAuthToken(process.env.LINTO_STACK_TOCK_USER, process.env.LINTO_STACK_TOCK_PASSWORD)


        // Tmp json file path
        const jsonSentencesContent = JSON.stringify(getNluLexicalSeeding.data.sentences)
        const sentencesFilePath = process.cwd() + '/public/tocksentences.json'

        let postSentences = await new Promise((resolve, reject) => {
            fs.writeFile(sentencesFilePath, jsonSentencesContent, async(err) => {
                if (err) {
                    console.error(err)
                    throw err
                } else {
                    const formData = new FormData()
                    formData.append('file', fs.createReadStream(sentencesFilePath))
                    axios({
                        url: `${middlewares.useSSL() + process.env.LINTO_STACK_TOCK_SERVICE}:${process.env.LINTO_STACK_TOCK_SERVICE_PORT}${process.env.LINTO_STACK_TOCK_BASEHREF}/rest/admin/dump/sentences`,
                        method: 'post',
                        data: formData,
                        headers: {
                            'Authorization': token,
                            'Content-Type': formData.getHeaders()['content-type']
                        }
                    }).then((res) => {
                        //fs.unlinkSync(sentencesFilePath)
                        if (res.status === 200) {
                            resolve({
                                status: 'success',
                                msg: 'Tock application has been updated'
                            })
                        } else {
                            reject({
                                status: 'error',
                                msg: 'Error on updating Tock application'
                            })
                        }
                    }).catch((error) => {
                        console.error(error)
                        reject(error)
                    })
                }
            })
        })
        return postSentences
    } catch (error) {
        return ({
            status: 'error',
            msg: 'Error on updating Tock application sentences',
            error
        })
    }
}

/** 
 * @desc Tock application lexical seeding
 * @param {string} flowId - Id of the application nodered flow
 * @return {object} - {status, msg, error (optional)}
 */
async function nluLexicalSeeding(flowId) {
    try {
        const postApp = await nluLexicalSeedingApplications(flowId)
        const postSentences = await nluLexicalSeedingSentences(flowId)
        let errors = []
        let status = 'success'
        let postAppValid = true
        let postSentencesValid = true
        if (postApp.status !== 'success') {
            postAppValid = false
            status = 'error'
            errors.push({ 'application': postApp })
        }
        if (postSentences.status !== 'success') {
            postSentencesValid = false
            status = 'error'
            errors.push({ 'sentences': postSentences })
        }

        if (postAppValid && postSentencesValid) {
            return ({
                status,
                msg: 'NLU updated'
            })
        } else {
            throw errors
        }
    } catch (error) {
        console.error(error)
        return ({
            status: 'error',
            msg: 'Error on updating Tock application',
            error
        })
    }
}

/** 
 * @desc Execute functions to strat process of lexical seeding for STT and NLU applications
 * @param {string} sttServiceName - name of the targeted STT service
 * @param {string} flowId - Id of the application nodered flow
 * @return {object} - {status, msg, error (optional)}
 */
async function doLexicalSeeding(sttServiceName, flowId) {
    try {

        // NLU lexical seeding 
        const nluLexSeed = await nluLexicalSeeding(flowId)
        if (nluLexSeed.status !== 'success') {
            throw !!nluLexSeed.msg ? nluLexSeed.msg : nluLexSeed
        }
        // STT lexical seeding 
        const sttLexSeed = await sttLexicalSeeding(flowId, sttServiceName)
        if (sttLexSeed.status !== 'success') {
            throw !!sttLexSeed.msg ? sttLexSeed.msg : sttLexSeed
        }
        // Success
        if (sttLexSeed.status === 'success' && nluLexSeed.status === 'success') {
            return ({
                status: 'success',
                msg: 'Tock application and STT service have been updated'
            })
        } else {
            throw {
                stt: sttLexSeed,
                nlu: nluLexSeed
            }
        }
    } catch (error) {
        console.error(error)
        return ({
            status: 'error',
            error,
            msg: !!error.msg ? error.msg : 'Error on executing lexical seeding'
        })
    }

}

module.exports = {
    doLexicalSeeding,
    nluLexicalSeeding,
    sttLexicalSeeding,
    generateGraph
}