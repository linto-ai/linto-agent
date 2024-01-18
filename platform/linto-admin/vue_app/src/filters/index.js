import Vue from 'vue'
import store from '../store.js'



/**
 * @desc dispatch store - execute an "action" on vuex store
 * @param {string} action - vuex store action name
 * @param {object} data - data to be passed to the dipsatch function (optional)
 * @return {object} {status, msg}
 */
Vue.filter('dispatchStore', async function(action, data) {
    try {
        let req = null
        if (!!data) {
            req = await store.dispatch(action, data)
        } else {
            req = await store.dispatch(action)
        }
        if (!!req.error) {
            throw req.error
        }
        if (typeof req !== 'undefined') {
            return {
                status: 'success',
                msg: ''
            }
        } else {
            throw 'an error has occured'
        }
    } catch (error) {
        return ({
            status: 'error',
            msg: error
        })
    }
})

/**
 * @desc global test on "select" fields base on an object format
 * @param {object} obj {value: "string", error: "null" OR "string", valid: "boolean"}
 * @return {object} {value: "string", error: "null" OR "string", valid: "boolean"}
 */
Vue.filter('testSelectField', function(obj) {
    obj.error = null
    obj.valid = false
    if (typeof(obj.value) === 'undefined') {
        obj.value = ''
    }
    if (obj.value === '' || obj.value.length === 0) {
        obj.error = 'This field is required'
    } else {
        obj.valid = true
    }
})


/**
 * @desc Test password format
 * Conditions : 
 * - length > 6
 * - alphanumeric characters and/or special chars : "!","@","#","$","%","-","_"
 * @param {object} obj {value: "string", error: "null" OR "string", valid: "boolean"}
 * @return {object} {value: "string", error: "null" OR "string", valid: "boolean"}
 */
const testPassword = (obj) => {
    obj.valid = false
    obj.error = null
    const regex = /^[0-9A-Za-z\!\@\#\$\%\-\_\s]{4,}$/
    if (obj.value.length === 0) {
        obj.error = 'This field is required'
    } else if (obj.value.length < 6) {
        obj.error = 'This field must contain at least 6 characters'
    } else if (obj.value.match(regex)) {
        obj.valid = true
    } else {
        obj.error = 'Invalid password'
    }
    return obj
}

/**
 * @desc Test email format
 * @param {object} obj {value: "string", error: "null" OR "string", valid: "boolean"}
 * @return {object} {value: "string", error: "null" OR "string", valid: "boolean"}
 */
const testEmail = (obj) => {
    obj.valid = false
    obj.error = null
    const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    if (obj.value.match(regex)) {
        obj.valid = true
    } else {
        obj.error = 'Invalid email'
    }
    return obj
}

/**
 * @desc Test url format
 * @param {object} obj {value: "string", error: "null" OR "string", valid: "boolean"}
 * @return {object} {value: "string", error: "null" OR "string", valid: "boolean"}
 */
const testUrl = (obj) => {
    obj.valid = false
    obj.error = null
    if (obj.value.length === 0) {
        obj.valid = false
        obj.error = 'This field is required'
    } else {
        const regex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/g
        if (obj.value.match(regex)) {
            obj.valid = true
        } else {
            obj.error = 'Invalid content url format.'
        }
    }
    return obj
}

/**
 * @desc Test device workflow name format
 * @param {object} obj {value: "string", error: "null" OR "string", valid: "boolean"}
 * @return {object} {value: "string", error: "null" OR "string", valid: "boolean"}
 */
Vue.filter('testDeviceWorkflowName', async function(obj) {
    obj.error = null
    obj.valid = false
    await store.dispatch('getDeviceApplications')
    const workflows = store.state.deviceApplications
    if (workflows.length > 0 && workflows.filter(wf => wf.name === obj.value).length > 0) { // check if workflow name is not used
        obj.error = 'This workflow name is already used'
        obj.valid = false
    }
})

/**
 * @desc Test multi-user workflow name format
 * @param {object} obj {value: "string", error: "null" OR "string", valid: "boolean"}
 * @return {object} {value: "string", error: "null" OR "string", valid: "boolean"}
 */
Vue.filter('testMultiUserWorkflowName', async function(obj) {
    obj.error = null
    obj.valid = false
    await store.dispatch('getMultiUserApplications')
    const workflows = store.state.multiUserApplications
    if (workflows.length > 0 && workflows.filter(wf => wf.name === obj.value).length > 0) { // check if workflow name is not used
        obj.error = 'This workflow name is already used'
        obj.valid = false
    }
})

/**
 * @desc Test serial number format
 * @param {object} obj {value: "string", error: "null" OR "string", valid: "boolean"}
 * @return {object} {value: "string", error: "null" OR "string", valid: "boolean"}
 */
Vue.filter('testStaticClientsSN', async function(obj) {
    obj.error = null
    obj.valid = false
    await store.dispatch('getStaticClients')
    const clients = store.state.staticClients
    if (clients.length > 0 && clients.filter(wf => wf.sn === obj.value && wf.associated_workflow !== null).length > 0) { // check if serial number is not used
        obj.error = 'This serial number is already used'
        obj.valid = false
    }
})

/**
 * @desc Test name format
 * @param {object} obj {value: "string", error: "null" OR "string", valid: "boolean"}
 * Conditions :
 * - Length > 5
 * - alphanumeric charcates or/and: "-", "_", " "
 * @return {object} {value: "string", error: "null" OR "string", valid: "boolean"}
 */
Vue.filter('testName', function(obj) {
    const regex = /^[0-9A-Za-z\s\-\_]+$/
    obj.valid = false
    obj.error = null
    if (obj.value.length === 0) {
        obj.error = 'This field is required'
    } else if (obj.value.length < 5) {
        obj.error = 'This field must contain at least 5 characters'
    } else if (obj.value.match(regex)) {
        obj.valid = true
    } else {
        obj.error = 'Invalid name'
    }
})

/**
 * @desc Test password format
 * @param {object} obj {value: "string", error: "null" OR "string", valid: "boolean"}
 * @return {object} {value: "string", error: "null" OR "string", valid: "boolean"}
 */
Vue.filter('testPassword', function(obj) {
    obj = testPassword(obj)
})

/**
 * @desc Test password confirmation format
 * @param {object} obj {value: "string", error: "null" OR "string", valid: "boolean"}
 * @return {object} {value: "string", error: "null" OR "string", valid: "boolean"}
 */
Vue.filter('testPasswordConfirm', function(obj, compareObj) {
    obj = testPassword(obj)
    if (obj.valid) {
        if (obj.value === compareObj.value) {
            obj.valid = true
        } else {
            obj.valid = false
            obj.error = 'The confirmation password is different from password'
        }
    }
})

/**
 * @desc Test email format
 * @param {object} obj {value: "string", error: "null" OR "string", valid: "boolean"}
 * @return {object} {value: "string", error: "null" OR "string", valid: "boolean"}
 */
Vue.filter('testEmail', function(obj) {
    obj = testEmail(obj)
})

/**
 * @desc Test android user email format 
 * @param {object} obj {value: "string", error: "null" OR "string", valid: "boolean"}
 * @return {object} {value: "string", error: "null" OR "string", valid: "boolean"}
 */
Vue.filter('testAndroidUserEmail', async function(obj) {
    obj.valid = false
    obj.error = null
    obj = testEmail(obj)
    if (obj.valid) {
        await store.dispatch('getAndroidUsers')
        const users = store.state.androidUsers
        const userExist = users.filter(user => user.email === obj.value)
        if (userExist.length > 0) { // check if email address is not used
            obj.valid = false
            obj.error = 'This email address is already used'
        } else {
            obj.valid = true
            obj.error = null
        }
    }
})

/**
 * @desc Test content format 
 * @param {object} obj {value: "string", error: "null" OR "string", valid: "boolean"}
 * Conditions : 
 * - Length > 0
 * - alphanumeric characters or/and : "?","!","@","#","$","%","-","_",".",",","(",")","[","]","=","+",":",";"
 * @return {object} {value: "string", error: "null" OR "string", valid: "boolean"}
 */
Vue.filter('testContent', function(obj) {
    obj.valid = false
    obj.error = null
    if (obj.value.length === 0) {
        obj.valid = true
    } else {
        const regex = /[0-9A-Za-z\?\!\@\#\$\%\-\_\.\/\,\:\;\(\)\[\]\=\+\s]+$/g
        if (obj.value.match(regex)) {
            obj.valid = true
        } else {
            obj.error = 'Invalid content. Unauthorized characters.'
        }
    }
})

/**
 * @desc Test content format to be sayed by linto
 * @param {object} obj {value: "string", error: "null" OR "string", valid: "boolean"}
 * Conditions : 
 * - Length > 0
 * - alphanumeric characters or/and : "?","!","-",".",",",":",";"
 * @return {object} {value: "string", error: "null" OR "string", valid: "boolean"}
 */
Vue.filter('testContentSay', function(obj) {
    obj.valid = false
    obj.error = null
    if (obj.value.length === 0) {
        obj.valid = true
    } else {
        const regex = /[0-9A-Za-z\?\!\-\.\:\,\;\s]+$/g
        if (obj.value.match(regex)) {
            obj.valid = true
        } else {
            obj.error = 'Unauthorized characters.'
        }
    }
})

/**
 * @desc Test url format for domains
 * @param {object} obj {value: "string", error: "null" OR "string", valid: "boolean"}
 * @return {object} {value: "string", error: "null" OR "string", valid: "boolean"}
 */
Vue.filter('testUrl', async function(obj) {
    obj.valid = false
    obj.error = null
    obj = testUrl(obj)
    if (obj.valid) {
        await store.dispatch('getWebappHosts')
        const hosts = store.state.webappHosts
        const hostExist = hosts.filter(host => host.originUrl === obj.value)
        if (hostExist.length > 0) { // check if domain is not used
            obj.valid = false
            obj.error = 'This origin url is already used'
        } else {
            obj.error = null
            obj.valid = true
        }
    }
})
Vue.filter('testPath', async function(obj) {
    obj.valid = false
    obj.error = null
    if (obj.value.length === 0) {
        obj.valid = false
        obj.error = 'This field is required'
    } else {
        const regex = /^((\/){1}[a-z0-9]+([\-\.]{1}[a-z0-9]+)*)*$/g
        if (obj.value.match(regex)) {
            obj.valid = true
        } else {
            obj.error = 'Invalid path format.'
        }
    }
    return obj
})

/**
 * @desc Test integer format
 * @param {object} obj {value: "string", error: "null" OR "string", valid: "boolean"}
 * @return {object} {value: "string", error: "null" OR "string", valid: "boolean"}
 */

Vue.filter('testInteger', function(obj) {
    obj.valid = false
    obj.error = null
    if (obj.value.length === 0) {
        obj.valid = false
        obj.error = 'This field is required'
    } else {
        const regex = /[0-9]+$/g
        if (obj.value.toString().match(regex)) {
            obj.valid = true
        } else {
            obj.valid = false
            obj.error = 'This value must be an integer'
        }
    }
})

Vue.filter('notEmpty', function(obj) {
    obj.valid = false
    obj.error = null
    if (obj.value.length === 0) {
        obj.valid = false
        obj.error = 'This field is required'
    } else {
        obj.valid = true
    }
})

Vue.filter('getSettingsByApplication', function(data) {
    let settings = {
            language: '',
            command: {
                enabled: false,
                value: ''
            },
            chatbot: {
                enabled: false,
                value: ''
            },
            streaming: {
                enabled: false,
                value: '',
                internal: 'false'
            },
            tock: {
                value: ''
            }
        }
        // get worlflow language
    if (!!data.flow && !!data.flow.nodes && data.flow.nodes.length > 0) {
        const nodeConfig = data.flow.nodes.filter(node => node.type === 'linto-config')
        if (nodeConfig.length > 0) {
            settings.language = nodeConfig[0].language
        }
    }

    if (!!data.flow && !!data.flow.configs && data.flow.configs.length > 0) {
        const nodeConfigTock = data.flow.configs.filter(node => node.type === 'linto-config-evaluate')
        const nodeConfigTranscribe = data.flow.configs.filter(node => node.type === 'linto-config-transcribe')
        const nodeConfigChatbot = data.flow.configs.filter(node => node.type === 'linto-config-chatbot')
        const nodeLintoChatbot = data.flow.nodes.filter(node => node.type === 'linto-chatbot')
        const nodeLintoStreaming = data.flow.nodes.filter(node => node.type === 'linto-transcribe-streaming')
        const nodeLintoEvaluate = data.flow.nodes.filter(node => node.type === 'linto-evaluate')
        const nodeLintoTranscribe = data.flow.nodes.filter(node => node.type === 'linto-transcribe')

        // tock
        if (nodeConfigTock.length > 0) {
            if (nodeConfigTock[0].appname !== '') {
                settings.tock.value = nodeConfigTock[0].appname
            }
        }

        if (nodeConfigTranscribe.length > 0) {
            // streaming
            settings.streaming.value = nodeConfigTranscribe[0].largeVocabStreaming
            settings.streaming.internal = nodeConfigTranscribe[0].largeVocabStreamingInternal
            if (nodeLintoStreaming.length > 0) {
                settings.streaming.enabled = true
            }

            // commands
            if (nodeConfigTranscribe[0].commandOffline !== '') {
                settings.command.value = nodeConfigTranscribe[0].commandOffline
                if (nodeLintoEvaluate.length > 0 && nodeLintoTranscribe.length > 0) {
                    settings.command.enabled = true
                }
            }
        }
        // chatbot
        if (nodeConfigChatbot.length > 0) {
            settings.chatbot.value = nodeConfigChatbot[0].rest
            if (nodeLintoChatbot.length > 0) {
                settings.chatbot.enabled = true
            }
        }
    }
    return settings
})