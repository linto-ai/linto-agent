const axios = require('axios')
const multer = require('multer')
const moment = require('moment')
const lexSeed = require(`${process.cwd()}/lib/webserver/middlewares/lexicalseeding.js`)
const middlewares = require(`${process.cwd()}/lib/webserver/middlewares/index.js`)
const AMPath = `${process.cwd()}/acousticModels/`
const AMstorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, AMPath)
    },
    filename: (req, file, cb) => {
        let filename = moment().format('x') + '-' + file.originalname
        cb(null, filename)
    }
})

module.exports = (webServer) => {
    return [{
            // Get all services in stt-service-manager
            path: '/services',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const sttAuthToken = middlewares.basicAuthToken(process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE_LOGIN, process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE_PASSWORD)
                    const getServices = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE}/services`, {
                        method: 'get',
                        headers: {
                            'charset': 'utf-8',
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': sttAuthToken
                        }
                    })
                    res.json(getServices.data.data)
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        msg: 'Error on joining STT service',
                        error
                    })
                }
            }
        },
        {
            // Get lang models
            path: '/langmodels',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const sttAuthToken = middlewares.basicAuthToken(process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE_LOGIN, process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE_PASSWORD)
                    const getLanguageModels = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE}/langmodels`, {
                        method: 'get',
                        headers: {
                            'charset': 'utf-8',
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': sttAuthToken
                        }
                    })
                    res.json(getLanguageModels.data.data)
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        msg: 'Error on getting STT language models',
                        error
                    })
                }
            }
        },
        {
            path: '/acmodels',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const sttAuthToken = middlewares.basicAuthToken(process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE_LOGIN, process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE_PASSWORD)

                    const getACModels = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE}/acmodels`, {
                        method: 'get',
                        headers: {
                            'charset': 'utf-8',
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': sttAuthToken
                        }
                    })
                    res.json(getACModels.data.data)
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        msg: 'Error on getting STT acoustic models',
                        error
                    })
                }
            }
        },
        {
            path: '/lexicalseeding',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const flowId = req.body.payload.flowId
                    const service_name = req.body.payload.service_name
                    const lexicalseeding = await lexSeed.sttLexicalSeeding(flowId, service_name)
                    if (lexicalseeding.status === 'success') {
                        res.json({
                            status: 'success',
                            msg: 'STT service has been updated'
                        })
                    } else {
                        throw lexicalseeding
                    }
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        msg: !!error.msg ? error.msg : 'Error on updating language model',
                        error: error
                    })
                }
            }
        },
        {
            path: '/generategraph',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const serviceName = req.body.serviceName
                    const lexicalSeeding = await lexSeed.generateGraph(serviceName)
                    res.json(lexicalSeeding)
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        msg: 'error on generating graph'
                    })
                }
            }
        },
        {
            path: '/healthcheck',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const sttAuthToken = middlewares.basicAuthToken(process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE_LOGIN, process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE_PASSWORD)
                    const getSttManager = await axios(middlewares.useSSL() + process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE, {
                        method: 'get',
                        headers: {
                            'charset': 'utf-8',
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': sttAuthToken
                        }
                    })
                    if (getSttManager.status === 200) {
                        res.json({
                            status: 'success',
                            msg: ''
                        })
                    } else {
                        throw 'error on connecting'
                    }
                } catch (error) {
                    res.json({
                        status: 'error',
                        msg: 'unable to connect STT services'
                    })
                }
            }
        }
    ]
}