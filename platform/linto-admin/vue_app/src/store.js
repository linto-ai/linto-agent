import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
    strict: false,
    state: {
        multiUserApplications: '',
        deviceApplications: '',
        androidUsers: '',
        staticClients: '',
        sttServices: '',
        sttLanguageModels: '',
        sttAcousticModels: '',
        tockApplications: '',
        webappHosts: '',
        nodeRedCatalogue: '',
        installedNodes: '',
        localSkills: ''
    },
    mutations: {
        SET_MULTI_USER_APPLICATIONS: (state, data) => {
            state.multiUserApplications = data
        },
        SET_DEVICE_APPLICATIONS: (state, data) => {
            state.deviceApplications = data
        },
        SET_STATIC_CLIENTS: (state, data) => {
            state.staticClients = data
        },
        SET_STT_SERVICES: (state, data) => {
            state.sttServices = data
        },
        SET_STT_LANG_MODELS: (state, data) => {
            state.sttLanguageModels = data
        },
        SET_STT_AC_MODELS: (state, data) => {
            state.sttAcousticModels = data
        },
        SET_TOCK_APPS: (state, data) => {
            state.tockApplications = data
        },
        SET_ANDROID_USERS: (state, data) => {
            state.androidUsers = data
        },
        SET_WEB_APP_HOSTS: (state, data) => {
            state.webappHosts = data
        },
        SET_NODERED_CATALOGUE: (state, data) => {
            state.nodeRedCatalogue = data
        },
        SET_INSTALLED_NODES: (state, data) => {
            state.installedNodes = data
        },
        SET_LOCAL_SKILLS: (state, data) => {
            state.localSkills = data
        }
    },
    actions: {
        // Static clients
        getStaticClients: async({ commit, state }) => {
            try {
                const getStaticClients = await axios.get(`${process.env.VUE_APP_URL}/api/clients/static`)
                commit('SET_STATIC_CLIENTS', getStaticClients.data)
                return state.staticClients
            } catch (error) {
                return { error: 'Error on getting Linto(s) static devices' }
            }
        },
        // Device applications
        getDeviceApplications: async({ commit, state }) => {
            try {
                const getDeviceApplications = await axios.get(`${process.env.VUE_APP_URL}/api/workflows/static`)
                let allDeviceApplications = getDeviceApplications.data
                if (allDeviceApplications.length > 0) {
                    allDeviceApplications.map(sw => {
                        if (!!sw.flow && !!sw.flow.configs && sw.flow.configs.length > 0) {
                            // get STT service 
                            let nodeSttConfig = sw.flow.configs.filter(node => node.type === 'linto-config-transcribe')
                            let nodeChatbotConfig = sw.flow.configs.filter(node => node.type === 'linto-config-chatbot')
                            if (nodeSttConfig.length > 0 && !!nodeSttConfig[0].commandOffline) {
                                sw.featureServices = {
                                    cmd: nodeSttConfig[0].commandOffline,
                                    lvOnline: nodeSttConfig[0].largeVocabStreaming,
                                    streamingInternal: nodeSttConfig[0].largeVocabStreamingInternal,
                                    chatbot: nodeChatbotConfig[0].rest
                                }
                            } else {
                                sw.featureServices = {
                                    cmd: '',
                                    lvOnline: '',
                                    streamingInternal: '',
                                    chatbot: ''
                                }
                            }
                        }
                    })
                }
                commit('SET_DEVICE_APPLICATIONS', allDeviceApplications)
                return state.deviceApplications
            } catch (error) {
                return { error: 'Error on getting static workflows' }
            }
        },
        // Multi-user applications
        getMultiUserApplications: async({ commit, state }) => {
            try {
                const getMultiUserApplications = await axios.get(`${process.env.VUE_APP_URL}/api/workflows/application`)
                let allMultiUserApplications = getMultiUserApplications.data
                if (allMultiUserApplications.length > 0) {
                    allMultiUserApplications.map(sw => {
                        if (!!sw.flow && !!sw.flow.configs && sw.flow.configs.length > 0) {
                            // get STT service 
                            let nodeSttConfig = sw.flow.configs.filter(node => node.type === 'linto-config-transcribe')
                            let nodeChatbotConfig = sw.flow.configs.filter(node => node.type === 'linto-config-chatbot')
                            if (nodeSttConfig.length > 0 && nodeChatbotConfig.length > 0) {
                                sw.featureServices = {
                                    cmd: nodeSttConfig[0].commandOffline,
                                    lvOnline: nodeSttConfig[0].largeVocabStreaming,
                                    streamingInternal: nodeSttConfig[0].largeVocabStreamingInternal,
                                    chatbot: nodeChatbotConfig[0].rest
                                }
                            } else {
                                sw.featureServices = {
                                    cmd: '',
                                    lvOnline: '',
                                    streamingInternal: '',
                                    chatbot: ''
                                }
                            }
                        }
                    })
                }
                commit('SET_MULTI_USER_APPLICATIONS', allMultiUserApplications)
                return state.multiUserApplications
            } catch (error) {
                return { error: 'Error on getting Linto(s) static devices' }
            }
        },
        // Android users 
        getAndroidUsers: async({ commit, state }) => {
            try {
                const getAndroidUsers = await axios.get(`${process.env.VUE_APP_URL}/api/androidusers`)
                let nestedObj = []
                getAndroidUsers.data.map(user => {
                    nestedObj.push({
                        _id: user._id,
                        email: user.email,
                        applications: user.applications
                    })
                })
                commit('SET_ANDROID_USERS', nestedObj)
                return state.androidUsers
            } catch (error) {
                return { error: 'Error on getting android applications users' }
            }
        },
        // Web app hosts
        getWebappHosts: async({ commit, state }) => {
            try {
                const getWebappHosts = await axios.get(`${process.env.VUE_APP_URL}/api/webapphosts`)
                commit('SET_WEB_APP_HOSTS', getWebappHosts.data)
                return state.webappHosts
            } catch (error) {
                return { error: 'Error on getting web app hosts' }
            }
        },
        // Stt services
        getSttServices: async({ commit, state }) => {
            try {
                const getServices = await axios.get(`${process.env.VUE_APP_URL}/api/stt/services`)
                if (!!getServices.data.status && getServices.data.status === 'error') {
                    throw getServices.datagetTockApplications.data.msg
                }
                commit('SET_STT_SERVICES', getServices.data)
                return state.sttServices
            } catch (error) {
                return { error: 'Error on getting STT services' }
            }
        },
        // Stt language models
        getSttLanguageModels: async({ commit, state }) => {
            try {
                const getSttLanguageModels = await axios.get(`${process.env.VUE_APP_URL}/api/stt/langmodels`)
                if (!!getSttLanguageModels.data.status && getSttLanguageModels.data.status === 'error') {
                    throw getSttLanguageModels.data.msg
                }
                commit('SET_STT_LANG_MODELS', getSttLanguageModels.data)
                return state.sttLanguageModels
            } catch (error) {
                return { error: 'Error on getting language models' }
            }
        },
        // Stt acoustic models
        getSttAcousticModels: async({ commit, state }) => {
            try {
                const getSttAcousticModels = await axios.get(`${process.env.VUE_APP_URL}/api/stt/acmodels`)
                if (!!getSttAcousticModels.data.status && getSttAcousticModels.data.status === 'error') {
                    throw getSttAcousticModels.data.msg
                }
                commit('SET_STT_AC_MODELS', getSttAcousticModels.data)
                return state.sttAcousticModels
            } catch (error) {
                return { error: 'Error on getting acoustic models' }
            }
        },
        // Tock applications
        getTockApplications: async({ commit, state }) => {
            try {
                const getApps = await axios.get(`${process.env.VUE_APP_URL}/api/tock/applications`)
                if (getApps.data.status === 'error') {
                    throw getApps.data.msg
                }
                let applications = []
                if (getApps.data.length > 0) {
                    getApps.data.map(app => {
                        applications.push({
                            name: app.name,
                            namespace: app.namespace
                        })
                    })
                    commit('SET_TOCK_APPS', applications)
                    return state.tockApplications
                } else {
                    // If no service is created<
                    commit('SET_TOCK_APPS', [])
                    return state.tockApplications
                }
            } catch (error) {
                return { error: 'Error on getting tock applications' }
            }
        },
        // Node red catalogue
        getNodeRedCatalogue: async({ commit, state }) => {
            try {
                const getCatalogue = await axios.get('https://registry.npmjs.com/-/v1/search?text=linto-ai&size=500')

                let lintoNodes = []
                const unwantedSkills = '@linto-ai/node-red-linto-skill'
                if (getCatalogue.status === 200 && !!getCatalogue.data && getCatalogue.data.objects.length > 0) {
                    lintoNodes = getCatalogue.data.objects.filter(node => (node.package.name.indexOf('@linto-ai/node-red-linto') >= 0 || node.package.name.indexOf('@linto-ai/linto-skill') >= 0) && node.package.name.indexOf(unwantedSkills) < 0)
                }
                commit('SET_NODERED_CATALOGUE', lintoNodes)

                return state.nodeRedCatalogue
            } catch (error) {
                return { error }
            }
        },
        getInstalledNodes: async({ commit, state }) => {
            try {
                const getNodes = await axios.get(`${process.env.VUE_APP_URL}/api/flow/nodes`)
                if (getNodes.status === 200 && !!getNodes.data.nodes) {
                    commit('SET_INSTALLED_NODES', getNodes.data.nodes)
                    return state.installedNodes
                } else {
                    return []
                }
            } catch (error) {
                console.error(error)
                return { error }
            }
        },

        getLocalSkills: async({ commit, state }) => {
            try {
                const getLocalSkills = await axios.get(`${process.env.VUE_APP_URL}/api/localskills`)
                commit('SET_LOCAL_SKILLS', getLocalSkills.data)
                return state.localSkills
            } catch (error) {
                return { error: 'Error on getting local skills' }
            }
        },
    },
    getters: {
        STT_SERVICES_AVAILABLE: (state) => {
            try {
                let services = state.sttServices || []
                let languageModels = state.sttLanguageModels || []
                let servicesCMD = []
                let serviceLVOnline = []
                let serviceLVOffline =   []
                let generating = []
                generating['cmd'] = []
                generating['lvOffline'] = []
                generating['lvOnline'] = []
                let allServicesNames = []
                if (services.length > 0) {
                    services.map(s => {
                        allServicesNames.push(s.serviceId)
                        if (languageModels.length > 0) {
                            let lm = languageModels.filter(l => l.modelId === s.LModelId)
                            if (lm.length > 0) {
                                // in generation progress
                                if (lm[0].updateState > 0) {
                                    if (lm[0].type === 'cmd') {
                                        generating['cmd'].push({
                                            ...s,
                                            langModel: lm[0]
                                        })
                                    } else if (lm[0].type === 'lvcsr') {
                                        if (s.tag === 'online') {
                                            generating['lvOnline'].push({
                                                ...s,
                                                langModel: lm[0]
                                            })
                                        } else if (s.tag === 'offline') {
                                            generating['lvOffline'].push({
                                                ...s,
                                                langModel: lm[0]
                                            })
                                        }
                                    }
                                }
                                // Available services
                                else if (lm[0].isGenerated === 1 || lm[0].isDirty === 1 && lm[0].isGenerated === 0 && lm[0].updateState >= 0) {
                                    if (lm[0].type === 'cmd') {
                                        servicesCMD.push({
                                            ...s,
                                            langModel: lm[0]
                                        })
                                    } else if (lm[0].type === 'lvcsr') {
                                        if (s.tag === 'online') {
                                            serviceLVOnline.push({
                                                ...s,
                                                langModel: lm[0]
                                            })
                                        } else if (s.tag === 'offline') {
                                            serviceLVOffline.push({
                                                ...s,
                                                langModel: lm[0]
                                            })
                                        }
                                    }
                                }
                            }
                        } else  {
                            return []
                        }
                    })
                    const availableServices = {
                        cmd: servicesCMD,
                        lvOnline: serviceLVOnline,
                        lvOffline: serviceLVOffline,
                        generating,
                        allServicesNames
                    }
                    return availableServices
                } else {
                    return []
                }
            } catch (error) {
                return { error }
            }
        },
        STATIC_CLIENTS_AVAILABLE: (state) => {
            try {
                if (!!state.staticClients && state.staticClients.length > 0) {
                    return state.staticClients.filter(sc => sc.associated_workflow === null)
                } else {
                    return []
                }
            } catch (error) {
                return { error }
            }
        },
        STATIC_CLIENTS_ENROLLED: (state) => {
            try {
                if (!!state.staticClients && state.staticClients.length > 0) {
                    return state.staticClients.filter(sc => sc.associated_workflow !== null)
                } else {
                    return []
                }
            } catch (error) {
                return { error }
            }
        },
        STATIC_CLIENT_BY_SN: (state) => (sn) => {
            try {
                if (!!state.staticClients && state.staticClients.length > 0) {
                    const client = state.staticClients.filter(sc => sc.sn === sn)
                    return client[0]
                } else  {
                    return []
                }
            } catch (error) {
                return { error }
            }
        },
        STATIC_WORKFLOW_BY_ID: (state) => (id) => {
            try {
                if (!!state.deviceApplications && state.deviceApplications.length > 0) {
                    const workflow = state.deviceApplications.filter(sw => sw._id === id)
                    let resp = workflow[0]
                    let sttServices =   {}
                    if (!!resp.flow && !!resp.flow.configs && resp.flow.configs.length > 0) {
                        // get STT service 
                        let nodeSttConfig = resp.flow.configs.filter(node => node.type === 'linto-config-transcribe')
                        if (nodeSttConfig.length > 0 && !!nodeSttConfig[0].commandOffline) {
                            sttServices = {
                                cmd: nodeSttConfig[0].commandOffline,
                                lvOnline: nodeSttConfig[0].largeVocabStreaming,
                                lvOffline: nodeSttConfig[0].largeVocabOffline
                            }
                        }
                    }
                    resp.sttServices = sttServices
                    return resp
                }
                return []
            } catch (error) {
                return { error }
            }
        },
        STATIC_WORKFLOWS_BY_CLIENTS: (state) => {
            try {
                let wfByClients = []
                if (!!state.staticClients && state.staticClients.length > 0) {
                    const associatedClients = state.staticClients.filter(sc => sc.associated_workflow !== null)

                    if (associatedClients.length > 0 && state.deviceApplications.length > 0) {
                        associatedClients.map(ac => {
                            if (!wfByClients[ac._id]) {
                                wfByClients[ac._id] = state.deviceApplications.filter(sw => sw._id === ac.associated_workflow._id)[0]
                            }
                        })
                    }
                }
                return wfByClients
            } catch (error) {
                return { error }
            }
        },
        ANDROID_USERS_BY_APPS: (state) => {
            try {
                const users = state.androidUsers
                let usersByApp = []

                if (users.length > 0) {
                    users.map(user => {
                        user.applications.map(app => {
                            if (!usersByApp[app]) {
                                usersByApp[app] = [user.email]
                            } else {
                                usersByApp[app].push(user.email)
                            }
                        })
                    })
                }
                return usersByApp
            } catch (error) {
                return { error }
            }
        },
        ANDROID_USERS_BY_APP_ID: (state) => (workflowId) => {
            try {
                if (!!state.androidUsers && state.androidUsers.length > 0) {
                    const users = state.androidUsers
                    return users.filter(user => user.applications.indexOf(workflowId) >= 0)
                }
                return []
            } catch (error) {
                return { error }
            }
        },
        ANDROID_USER_BY_ID: (state) => (userId) => {
            try {
                if (!!state.androidUsers && state.androidUsers.length > 0) {
                    const users = state.androidUsers
                    const user = users.filter(user => user._id.indexOf(userId) >= 0)
                    return user[0]
                }
                return []
            } catch (error) {
                return { error }
            }
        },
        APP_WORKFLOW_BY_ID: (state) => (workflowId) => {
            try {
                if (!!state.multiUserApplications && state.multiUserApplications.length > 0) {
                    const workflows = state.multiUserApplications
                    const workflow = workflows.filter(wf => wf._id === workflowId)
                    if (workflow.length > 0) {
                        let resp = workflow[0]
                        let sttServices =   {}
                        if (!!resp.flow && !!resp.flow.configs && resp.flow.configs.length > 0) {
                            // get STT service 
                            let nodeSttConfig = resp.flow.configs.filter(node => node.type === 'linto-config-transcribe')
                            if (nodeSttConfig.length > 0 && !!nodeSttConfig[0].commandOffline) {
                                sttServices = {
                                    cmd: nodeSttConfig[0].commandOffline,
                                    lvOnline: nodeSttConfig[0].largeVocabStreaming,
                                    lvOffline: nodeSttConfig[0].largeVocabOffline
                                }
                            }
                        }
                        resp.sttServices = sttServices
                        return resp
                    }
                    return workflow[0]
                }
                return []
            } catch (error) {
                return { error }
            }
        },
        WEB_APP_HOST_BY_ID: (state) => (id) => {
            try {
                if (!!state.webappHosts && state.webappHosts.length > 0) {
                    const webappHosts = state.webappHosts
                    const webappHost = webappHosts.filter(wh => wh._id === id)
                    return webappHost[0]
                }
                return []
            } catch (error) {
                return { error }
            }
        },
        WEB_APP_HOST_BY_APP_ID: (state) => (workflowId) => {
            try {
                if (!!state.webappHosts && state.webappHosts.length > 0) {
                    let hosts = state.webappHosts
                    let webappHostsById = []
                    hosts.map(host => {
                        host.applications.map(app => {
                            if (app.applicationId.indexOf(workflowId) >= 0) {
                                webappHostsById.push(host)
                            }
                        })
                    })
                    return webappHostsById
                }
                return []
            } catch (error) {
                return { error }
            }
        },
        WEB_APP_HOST_BY_APPS: (state) => {
            try {
                let hostByApp = []
                if (!!state.webappHosts && state.webappHosts.length > 0) {
                    const webappHosts = state.webappHosts
                    if (webappHosts.length > 0) {
                        webappHosts.map(host => {
                            host.applications.map(app => {
                                if (!hostByApp[app.applicationId]) {
                                    hostByApp[app.applicationId] = [host.originUrl]
                                } else {
                                    hostByApp[app.applicationId].push(host.originUrl)
                                }
                            })
                        })
                    }
                }
                return hostByApp
            } catch (error) {
                return { error }
            }
        },
        APP_WORKFLOWS_NAME_BY_ID: (state) => {
            try {
                if (!!state.multiUserApplications && state.multiUserApplications.length > 0) {
                    const workflows = state.multiUserApplications
                    let workflowNames = []
                    if (workflows.length > 0) {
                        workflows.map(wf => {
                            workflowNames[wf._id] = {
                                name: wf.name,
                                description: wf.description
                            }
                        })
                    }
                    return workflowNames
                }
                return []
            } catch (error) {
                return { error }
            }
        },
        LINTO_SKILLS_INSTALLED: (state) => {
            try {
                const allNodes = state.installedNodes
                let lintoNodes = []
                let lintoModules = []
                lintoNodes = allNodes.filter(node => node.id.indexOf('@linto-ai/') >= 0 && (node.id !== '@linto-ai/node-red-linto-core' && node.version !== '0.0.6'))
                if (lintoNodes.length > 0) {
                    lintoNodes.map(node => {
                        if (lintoModules.length > 0) {
                            let moduleExist = lintoModules.findIndex(mod => mod.module === node.module)
                            if (moduleExist < 0) {
                                lintoModules.push({
                                    module: node.module,
                                    version: node.version,
                                    local: node.local
                                })
                            }
                        } else  {
                            lintoModules.push({
                                module: node.module,
                                version: node.version,
                                local: node.local
                            })
                        }
                    })
                }
                return lintoModules
            } catch (error) {
                return { error }
            }
        }
    }
})