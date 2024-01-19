const axios = require('axios')
const uuid = require('uuid/v1')
const middlewares = require('./index.js')
const md5 = require('md5')
const baseApplicationFlow = require(`${process.cwd()}/lib/webserver/middlewares/json/multi-user-workflow.json`)
const baseDeviceFlow = require(`${process.cwd()}/lib/webserver/middlewares/json/device-workflow.json`)

function updateMultiUserApplicationFlowSettings(flow, payload) {
    try {

        const settings = payload.settings
        let flowId = flow.id
        let toRemove = []
        for (let i = 0; i < flow.configs.length; i++) {
            if (flow.configs[i].type === 'linto-config-chatbot') {
                // Config Chatbot
                if (settings.chatbot.enabled === true) {
                    flow.configs[i].rest = settings.chatbot.value
                } else {
                    flow.configs[i].rest = ''
                }
            }
            if (flow.configs[i].type === 'linto-config-transcribe') {
                // Config command
                if (settings.command.enabled === true) {
                    flow.configs[i].commandOffline = settings.command.value
                } else {
                    flow.configs[i].commandOffline = ''
                }
                // Config Streaming
                if (settings.streaming.enabled === true) {
                    flow.configs[i].largeVocabStreamingInternal = settings.streaming.internal
                    flow.configs[i].largeVocabStreaming = settings.streaming.value
                } else {
                    flow.configs[i].largeVocabStreamingInternal = true
                    flow.configs[i].largeVocabStreaming = ''
                }
            }
            if (flow.configs[i].type === 'linto-config-evaluate') {
                if (settings.tock.value !== flow.configs[i].appname) {
                    flow.configs[i].appname = settings.tock.value
                }
            }
        }
        let lintoChatbotIndex = flow.nodes.findIndex(node => node.type === 'linto-chatbot')
        let lintoStreamingIndex = flow.nodes.findIndex(node => node.type === 'linto-transcribe-streaming')
        let lintoEvaluateIndex = flow.nodes.findIndex(node => node.type === 'linto-evaluate')
        let lintoTranscribeIndex = flow.nodes.findIndex(node => node.type === 'linto-transcribe')

        // Uppdate Chatbot nodes
        if (lintoChatbotIndex >= 0 && !settings.chatbot.enabled) {
            toRemove.push(lintoChatbotIndex)
        } else if (lintoChatbotIndex < 0 && settings.chatbot.enabled) {
            flow.nodes.push({
                id: uuid(),
                type: "linto-chatbot",
                z: flowId,
                name: "",
                x: 640,
                y: 360,
                wires: []
            })
        }

        //Update Streaming nodes
        if (lintoStreamingIndex >= 0 && !settings.streaming.enabled) {
            toRemove.push(lintoStreamingIndex)
        } else if (lintoStreamingIndex < 0 && settings.streaming.enabled) {
            flow.nodes.push({
                id: uuid(),
                type: "linto-transcribe-streaming",
                z: flowId,
                name: "",
                x: 670,
                y: 160,
                wires: []
            })
        }

        // update command nodes
        // evaluate
        if (lintoEvaluateIndex >= 0 && !settings.command.enabled) {
            toRemove.push(lintoEvaluateIndex)
        } else if (lintoEvaluateIndex < 0 && settings.command.enabled) {
            flow.nodes.push({
                id: uuid(),
                type: "linto-evaluate",
                z: flowId,
                name: "",
                x: 640,
                y: 240,
                wires: [],
                useConfidenceScore: false,
                confidenceThreshold: ""
            })
        }
        // transcribe
        if (lintoTranscribeIndex >= 0 && !settings.command.enabled) {
            toRemove.push(lintoTranscribeIndex)
        } else if (lintoTranscribeIndex < 0 && settings.command.enabled) {
            flow.nodes.push({
                id: uuid(),
                type: "linto-transcribe",
                z: flowId,
                name: "",
                x: 640,
                y: 300,
                wires: [],
                useConfidenceScore: false,
                confidenceThreshold: 50
            })
        }

        flow.nodes = flow.nodes.filter(function(value, index) {
            return toRemove.indexOf(index) == -1
        })

        return flow
    } catch (error) {
        console.error(error)
    }
}

function generateMultiUserApplicationFromBaseTemplate(payload) {
    try {
        const flowId = uuid()
        const mqttId = flowId + '-mqtt'
        const nluId = flowId + '-nlu'
        const sttId = flowId + '-stt'
        const configId = flowId + '-config'
        const applicationInId = flowId + '-appin'
        const pipelineRouterId = flowId + '-pr'
        const chatbotId = flowId + '-chatbot'
        const datasetId = flowId + '-dataset'

        let flow = baseApplicationFlow

        let idMap = [] // ID correlation array
        let nodesArray = []
        flow = cleanDuplicateNodes(flow)

        // Format "linto-config" and set IDs
        flow.filter(node => node.type === 'linto-config').map(f => {
            f.z = flowId

            // Update language
            f.language = payload.language

            // Update linto-config node ID
            idMap[f.id] = configId
            f.id = configId

            // Update config-transcribe node ID
            idMap[f.configTranscribe] = sttId
            f.configTranscribe = sttId

            // Update config-mqtt node ID
            idMap[f.configMqtt] = mqttId
            f.configMqtt = mqttId

            // Update config-nlu node ID
            idMap[f.configEvaluate] = nluId
            f.configEvaluate = nluId

            // // Update configChatbot node ID
            idMap[f.configChatbot] = chatbotId
            f.configChatbot = chatbotId

            nodesArray.push(f)
        })

        // Format required nodes (existing in default template)
        flow.filter(node => node.type !== 'tab' && node.type !== 'linto-config').map(f => {
            f.z = flowId

            // uppdate STT node
            if (f.type === 'linto-config-transcribe') {
                f.z = flowId
                f.id = sttId
                f.host = process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE
                f.api = 'linstt'
                f.commandOffline = payload.smart_assistant
                f.largeVocabStreaming = payload.streamingService
                f.largeVocabStreamingInternal = payload.streamingServiceInternal === true ? 'true' : 'false'
            }
            // uppdate NLU node
            else if (f.type === 'linto-config-evaluate') {
                f.z = flowId
                f.id = nluId
                f.api = 'tock'
                f.host = `${process.env.LINTO_STACK_TOCK_NLP_API}:${process.env.LINTO_STACK_TOCK_SERVICE_PORT}`
                f.appname = payload.nluAppName
                f.namespace = 'app'
            }
            // uppdate MQTT node
            else if (f.type === 'linto-config-mqtt') {
                f.z = flowId
                f.id = mqttId
                f.host = process.env.LINTO_STACK_MQTT_HOST
                f.port = process.env.LINTO_STACK_MQTT_PORT
                f.scope = 'app' + md5(payload.workflowName)
                f.login = process.env.LINTO_STACK_MQTT_USER
                f.password = process.env.LINTO_STACK_MQTT_PASSWORD

            }
            // Application-in (required)
            else if (f.type === 'linto-application-in') {
                f.wires = [pipelineRouterId]
                f.id = applicationInId
                f.z = flowId
                f.auth_android = false
                f.auth_web = false
            }
            // Config Chatbot (required)
            else if (f.type === 'linto-config-chatbot') {
                f.id = chatbotId
                f.z = flowId
                f.host = process.env.LINTO_STACK_TOCK_BOT_API + ':' + process.env.LINTO_STACK_TOCK_SERVICE_PORT
                f.rest = payload.chatbot
            }
            // Pipeline router (required)
            else if (f.type === 'linto-pipeline-router') {
                f.id = pipelineRouterId
                f.z = flowId
            } else if (f.type === 'linto-model-dataset') {
                f.id = datasetId
                f.z = flowId
            } else {
                if (typeof(idMap[f.id]) === 'undefined') {
                    idMap[f.id] = uuid()
                }
                f.id = idMap[f.id]
            }
            nodesArray.push(f)
        })

        // streamingService
        if (payload.streamingService !== '') {
            let transcribStreamingId = flowId + '-trans-streaming'
            let transcribStreamingObj = {
                id: transcribStreamingId,
                type: "linto-transcribe-streaming",
                z: flowId,
                name: "",
                x: 670,
                y: 160,
                wires: []
            }
            nodesArray.push(transcribStreamingObj)
        }

        // CHATBOT
        if (payload.chatbot !== '') {
            let chatbotObj = {
                id: uuid(),
                type: "linto-chatbot",
                z: flowId,
                name: "",
                x: 640,
                y: 360,
                wires: []
            }
            nodesArray.push(chatbotObj)
        }
        // SMART ASSISTANT
        if (payload.smart_assistant !== '') {
            let lintoEvaluateObj = {
                id: uuid(),
                type: "linto-evaluate",
                z: flowId,
                name: "",
                x: 640,
                y: 240,
                wires: [],
                useConfidenceScore: false,
                confidenceThreshold: ""
            }
            let lintoTranscribeObj = {
                id: uuid(),
                type: "linto-transcribe",
                z: flowId,
                name: "",
                x: 640,
                y: 300,
                wires: [],
                useConfidenceScore: false,
                confidenceThreshold: 50
            }
            nodesArray.push(lintoEvaluateObj)
            nodesArray.push(lintoTranscribeObj)
        }
        const formattedFlow = {
            label: payload.workflowName,
            configs: [],
            nodes: nodesArray,
            id: flowId
        }
        return formattedFlow
    } catch (error) {
        console.error(error)
        return error
    }
}

function generateDeviceApplicationFromBaseTemplate(payload) {
    try {
        const flowId = uuid()
        const mqttId = flowId + '-mqtt'
        const nluId = flowId + '-nlu'
        const sttId = flowId + '-stt'
        const configId = flowId + '-config'
        const terminalInId = flowId + '-appin'
        const pipelineRouterId = flowId + '-pr'
        const chatbotId = flowId + '-chatbot'
        const datasetId = flowId + '-dataset'

        let flow = baseDeviceFlow

        let idMap = [] // ID correlation array
        let nodesArray = []
        flow = cleanDuplicateNodes(flow)

        // Format "linto-config" and set IDs
        flow.filter(node => node.type === 'linto-config').map(f => {
            f.z = flowId

            // Update language
            f.language = payload.language

            // Update linto-config node ID
            idMap[f.id] = configId
            f.id = configId

            // Update config-transcribe node ID
            idMap[f.configTranscribe] = sttId
            f.configTranscribe = sttId

            // Update config-mqtt node ID
            idMap[f.configMqtt] = mqttId
            f.configMqtt = mqttId

            // Update config-nlu node ID
            idMap[f.configEvaluate] = nluId
            f.configEvaluate = nluId

            // // Update configChatbot node ID
            idMap[f.configChatbot] = chatbotId
            f.configChatbot = chatbotId

            nodesArray.push(f)
        })

        // Format required nodes (existing in default template)
        flow.filter(node => node.type !== 'tab' && node.type !== 'linto-config').map(f => {
            f.z = flowId

            // uppdate STT node
            if (f.type === 'linto-config-transcribe') {
                f.z = flowId
                f.id = sttId
                f.host = process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE
                f.api = 'linstt'
                f.commandOffline = payload.smart_assistant
                f.largeVocabStreaming = payload.streamingService
                f.largeVocabStreamingInternal = payload.streamingServiceInternal === true ? 'true' : 'false'
            }
            // uppdate NLU node
            else if (f.type === 'linto-config-evaluate') {
                f.z = flowId
                f.id = nluId
                f.api = 'tock'
                f.host = `${process.env.LINTO_STACK_TOCK_NLP_API}:${process.env.LINTO_STACK_TOCK_SERVICE_PORT}`
                f.appname = payload.nluAppName
                f.namespace = 'app'
            }
            // uppdate MQTT node
            else if (f.type === 'linto-config-mqtt') {
                f.z = flowId
                f.id = mqttId
                f.host = process.env.LINTO_STACK_MQTT_HOST
                f.port = process.env.LINTO_STACK_MQTT_PORT
                f.scope = 'app' + md5(payload.workflowName)
                f.login = process.env.LINTO_STACK_MQTT_USER
                f.password = process.env.LINTO_STACK_MQTT_PASSWORD

            }
            // Terminal-in (required)
            else if (f.type === 'linto-terminal-in') {
                f.wires = [pipelineRouterId]
                f.id = terminalInId
                f.sn = payload.device
                f.z = flowId
            }
            // Config Chatbot (required)
            else if (f.type === 'linto-config-chatbot') {
                f.id = chatbotId
                f.z = flowId
                f.host = process.env.LINTO_STACK_TOCK_BOT_API + ':' + process.env.LINTO_STACK_TOCK_SERVICE_PORT
                f.rest = payload.chatbot
            }
            // Pipeline router (required)
            else if (f.type === 'linto-pipeline-router') {
                f.id = pipelineRouterId
                f.z = flowId
            } else if (f.type === 'linto-model-dataset') {
                f.id = datasetId
                f.z = flowId
            } else {
                if (typeof(idMap[f.id]) === 'undefined') {
                    idMap[f.id] = uuid()
                }
                f.id = idMap[f.id]
            }
            nodesArray.push(f)
        })

        // streamingService
        if (payload.streamingService !== '') {
            let transcribStreamingId = flowId + '-trans-streaming'
            let transcribStreamingObj = {
                id: transcribStreamingId,
                type: "linto-transcribe-streaming",
                z: flowId,
                name: "",
                x: 670,
                y: 160,
                wires: []
            }
            nodesArray.push(transcribStreamingObj)
        }

        // CHATBOT
        if (payload.chatbot !== '') {
            let chatbotObj = {
                id: uuid(),
                type: "linto-chatbot",
                z: flowId,
                name: "",
                x: 640,
                y: 360,
                wires: []
            }
            nodesArray.push(chatbotObj)
        }
        // SMART ASSISTANT
        if (payload.smart_assistant !== '') {
            let lintoEvaluateObj = {
                id: uuid(),
                type: "linto-evaluate",
                z: flowId,
                name: "",
                x: 640,
                y: 240,
                wires: [],
                useConfidenceScore: false,
                confidenceThreshold: ""
            }
            let lintoTranscribeObj = {
                id: uuid(),
                type: "linto-transcribe",
                z: flowId,
                name: "",
                x: 640,
                y: 300,
                wires: [],
                useConfidenceScore: false,
                confidenceThreshold: 50
            }
            nodesArray.push(lintoEvaluateObj)
            nodesArray.push(lintoTranscribeObj)
        }
        const formattedFlow = {
            label: payload.workflowName,
            configs: [],
            nodes: nodesArray,
            id: flowId
        }
        return formattedFlow
    } catch (error) {
        console.error(error)
        return error
    }
}

/**
 * @desc Get a business logic server bearer token
 * @return {string}
 */

async function getBLSAccessToken() {
    if (!process.env.LINTO_STACK_BLS_USE_LOGIN || process.env.LINTO_STACK_BLS_USE_LOGIN === 'false') {
        return ''
    }
    const login = process.env.LINTO_STACK_BLS_USER
    const pswd = process.env.LINTO_STACK_BLS_PASSWORD
    const request = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_BLS_SERVICE + process.env.LINTO_STACK_BLS_SERVICE_UI_PATH}/auth/token`, {
        method: 'post',
        data: {
            "client_id": "node-red-admin",
            "grant_type": "password",
            "scope": "*",
            "username": login,
            "password": pswd
        }
    })
    return 'Bearer ' + request.data.access_token
}
/**
 * @desc PUT request on business-logic-server
 * @return {object} {status, msg, error(optional)}
 */
async function putBLSFlow(flowId, workflow) {
    try {
        const accessToken = await getBLSAccessToken()
        let blsUpdate = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_BLS_SERVICE + process.env.LINTO_STACK_BLS_SERVICE_UI_PATH}/flow/${flowId}`, {
            method: 'put',
            headers: {
                'charset': 'utf-8',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Node-RED-Deployment-Type': 'flows',
                'Authorization': accessToken
            },
            data: workflow
        })
        if (blsUpdate.status == 200) {
            return {
                status: 'success'
            }
        } else {
            throw 'Error on updating flow on the Business Logic Server'
        }
    } catch (error) {
        console.error(error)
        return {
            status: 'error',
            msg: error,
            error
        }
    }
}
/**
 * @desc Format a nodered flow object to be send by POST/PUT
 */
function formatFlowGroupedNodes(flow) {
    let formattedFlow = {}
    let nodes = []
    let registeredIds = []
    flow.map(f => {
        if (f.type === 'tab') {
            formattedFlow.id = f.id
            formattedFlow.label = f.label
            formattedFlow.configs = []
            formattedFlow.nodes = []
            registeredIds.push(f.id)
        } else {
            if (registeredIds.indexOf(f.id) < 0) {
                registeredIds.push(f.id)
                nodes.push(f)
            }
        }
    })
    formattedFlow.nodes = nodes

    if (formattedFlow.nodes[0].type !== 'tab') {
        const configIndex = formattedFlow.nodes.findIndex(flow => flow.type === 'linto-config')
        let tmpIndex0 = formattedFlow.nodes[0]
        let tmpConfig = formattedFlow.nodes[configIndex]
        formattedFlow.nodes[0] = tmpConfig
        formattedFlow.nodes[configIndex] = tmpIndex0
    }
    return formattedFlow
}

/**
 * @desc POST request on business-logic-server
 * @param {object} flow - flow object to be send
 * @return {object} {status, msg, error(optional)}
 */
async function postBLSFlow(flow) {
    try {
        const accessToken = await getBLSAccessToken()
        let blsPost = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_BLS_SERVICE}/redui/flow`, {
            method: 'post',
            headers: {
                'charset': 'utf-8',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Node-RED-Deployment-Type': 'flows',
                'Authorization': accessToken
            },
            data: flow
        })

        // Validtion
        if (blsPost.status == 200 && blsPost.data) {
            return {
                status: 'success',
                msg: 'The worfklow has been deployed',
                flowId: blsPost.data.id
            }
        } else {
            throw {
                msg: 'Error on posting flow on the business logic server'
            }
        }
    } catch (error) {
        console.error(error)
        return {
            status: 'error',
            msg: !!error.msg ? error.msg : 'Error on posting flow on business logic server',
            error
        }
    }
}

/**
 * @desc DELETE request on business-logic-server
 * @param {string} flowId - id of the nodered flow
 * @return {object} {status, msg, error(optional)}
 */
async function deleteBLSFlow(flowId) {
    try {
        const accessToken = await getBLSAccessToken()
        let blsDelete = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_BLS_SERVICE}/redui/flow/${flowId}`, {
                method: 'delete',
                headers: {
                    'charset': 'utf-8',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Node-RED-Deployment-Type': 'flows',
                    'Authorization': accessToken
                },
            })
            // Validtion
        if (blsDelete.status == 204) {
            return {
                status: 'success',
                msg: 'The worfklow has been removed'
            }
        } else {
            throw {
                msg: 'Error on deleting flow on the business logic server'
            }
        }
    } catch (error) {
        console.error(error)
        return {
            status: 'error',
            error
        }
    }
}

/**
 * @desc request on business-logic-server to get a worflow by its id
 * @param {string} id - id of the nodered flow
 * @return {object} {status, msg, error(optional)}
 */
async function getFlowById(id) {
    try {
        const accessToken = await getBLSAccessToken()
        let getFlow = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_BLS_SERVICE}/redui/flow/${id}`, {
            method: 'get',
            headers: {
                'charset': 'utf-8',
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Node-RED-Deployment-Type': 'flows',
                'Authorization': accessToken
            }
        })
        return getFlow.data
    } catch (error) {
        return {
            status: 'error',
            msg: error,
            error
        }
    }
}

function cleanDuplicateNodes(flow) {
    let checked = []
    let indexToRemove = []
    let lintoConfigIndex = null
    for (let i = 0; i < flow.length; i++) {
        let type = flow[i].type
        if (type === 'linto-config') {
            lintoConfigIndex = i
        }
        if (checked.indexOf(type) >= 0) {
            indexToRemove.push(i)
        } else {
            checked.push(type)
        }
    }

    let cleanedFlow = flow.filter(function(value, index) {
        return indexToRemove.indexOf(index) == -1
    })
    return cleanedFlow
}



module.exports = {
    cleanDuplicateNodes,
    deleteBLSFlow,
    formatFlowGroupedNodes,
    getBLSAccessToken,
    generateMultiUserApplicationFromBaseTemplate,
    generateDeviceApplicationFromBaseTemplate,
    getFlowById,
    postBLSFlow,
    putBLSFlow,
    updateMultiUserApplicationFlowSettings
}