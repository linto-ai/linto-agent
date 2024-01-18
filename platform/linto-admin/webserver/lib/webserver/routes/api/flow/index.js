const axios = require('axios')
const middlewares = require(`${process.cwd()}/lib/webserver/middlewares/index.js`)
const nodered = require(`${process.cwd()}/lib/webserver/middlewares/nodered.js`)

module.exports = (webServer) => {
    return [{
            path: '/healthcheck',
            method: 'get',
            requireAuth: false,
            controller: async(req, res, next) => {
                try {
                    const accessToken = await nodered.getBLSAccessToken()
                    const getBls = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_BLS_SERVICE + process.env.LINTO_STACK_BLS_SERVICE_UI_PATH}`, {
                        method: 'get',
                        headers: {
                            'charset': 'utf-8',
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': accessToken
                        }
                    })
                    if (getBls.status === 200) {
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
                        msg: 'unable to connect Business logic server',
                        error
                    })
                }
            }
        },
        {
            // Delete a flow from BLS by its flowId
            path: '/:flowId',
            method: 'delete',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Set variables & values
                    const flowId = req.params.flowId

                    // Request
                    const deleteFlow = await nodered.deleteBLSFlow(flowId)

                    // Response
                    if (deleteFlow.status === 'success') {
                        res.json({
                            status: 'success',
                            msg: `The workflow "${flowId}" has been removed`
                        })
                    } else {
                        throw `Error on deleting flow ${flowId} on the Business Logic Server`
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
        },


        {
            // Get Business Logic Server credentials for requests
            path: '/getauth',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Request
                    const accessToken = await nodered.getBLSAccessToken()

                    // Response
                    res.json({
                        token: accessToken
                    })
                } catch (error) {
                    res.json({ error })
                }
            }
        },
        {
            // Post flow on BLS on context creation
            path: '/postbls/device',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const payload = req.body.payload
                    let formattedFlow = null
                    formattedFlow = nodered.generateDeviceApplicationFromBaseTemplate(payload)

                    // Request
                    if (formattedFlow !== null) {
                        const postFlowOnBLS = await nodered.postBLSFlow(formattedFlow)

                        // Response
                        res.json(postFlowOnBLS)

                    } else {
                        throw ('Error on formatting flow')
                    }
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        error
                    })
                }
            }
        },

        {
            // Post flow on BLS on context creation
            path: '/postbls/application',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const payload = req.body.payload
                    let formattedFlow = null
                    formattedFlow = nodered.generateMultiUserApplicationFromBaseTemplate(payload)

                    // Request
                    if (formattedFlow !== null) {
                        const postFlowOnBLS = await nodered.postBLSFlow(formattedFlow)

                        // Response
                        res.json(postFlowOnBLS)

                    } else {
                        throw ('Error on formatting flow')
                    }

                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        error
                    })
                }
            }
        },
        {
            // Get all the installed nodes
            path: '/nodes',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const accessToken = await nodered.getBLSAccessToken()
                    const getNodes = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_BLS_SERVICE + process.env.LINTO_STACK_BLS_SERVICE_UI_PATH}/nodes`, {
                        method: 'get',
                        headers: {
                            'charset': 'utf-8',
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': accessToken
                        }
                    })
                    if (getNodes.status === 200) {
                        res.json({ nodes: getNodes.data })
                    } else {
                        throw getNodes
                    }
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        msg: 'Error on getting installed nodes'
                    })
                }
            }
        }
    ]
}