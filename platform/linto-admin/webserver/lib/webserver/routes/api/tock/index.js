const debug = require('debug')(`linto-admin:/api/tock`)
const middlewares = require(`${process.cwd()}/lib/webserver/middlewares/index.js`)
const lexSeed = require(`${process.cwd()}/lib/webserver/middlewares/lexicalseeding.js`)
const axios = require('axios')
module.exports = (webServer) => {
    return [{
            // Get all existing Tock applications
            path: '/applications',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const tockToken = middlewares.basicAuthToken(process.env.LINTO_STACK_TOCK_USER, process.env.LINTO_STACK_TOCK_PASSWORD)
                    const getTockApplications = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_TOCK_SERVICE}:${process.env.LINTO_STACK_TOCK_SERVICE_PORT}${process.env.LINTO_STACK_TOCK_BASEHREF}/rest/admin/applications`, {
                        method: 'get',
                        headers: {
                            'Authorization': tockToken
                        }
                    })
                    if (!!getTockApplications.data && getTockApplications.data.length > 0) {
                        res.json(getTockApplications.data)
                    } else {
                        // If no application is created
                        res.json([])
                    }
                } catch (error) {
                    console.error(error)
                    if ((!!error.response && !!error.response === undefined) || (!!error.code && error.code === 'ECONNREFUSED')) {
                        res.json({
                            status: 'error',
                            msg: 'Tock service unvavailable'
                        })
                    }
                    res.json({
                        status: 'error',
                        msg: 'Error on getting tock applications'
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
                    const tockToken = middlewares.basicAuthToken(process.env.LINTO_STACK_TOCK_USER, process.env.LINTO_STACK_TOCK_PASSWORD)
                    const getTock = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_TOCK_SERVICE}:${process.env.LINTO_STACK_TOCK_SERVICE_PORT}${process.env.LINTO_STACK_TOCK_BASEHREF}/rest/admin/applications`, {
                        method: 'get',
                        headers: {
                            'Authorization': tockToken
                        }
                    })
                    if (getTock.status === 200) {
                        res.json({
                            status: 'success',
                            msg: ''
                        })
                    } else {
                        throw 'error on connecting'
                    }
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        msg: 'unable to connect tock services'
                    })
                }
            }
        },
        {
            path: '/lexicalseeding',
            method: 'post',
            controller: async(req, res, next) => {
                try {
                    const flowId = req.body.payload.flowId
                    const lexicalSeeding = await lexSeed.nluLexicalSeeding(flowId)
                    if (lexicalSeeding.status === 'success') {
                        res.json({
                            status: 'success',
                            msg: 'Tock application updated'
                        })
                    } else {
                        throw 'Error on updating tock application'
                    }
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        msg: error,
                        error
                    })
                }
            }
        }
    ]
}