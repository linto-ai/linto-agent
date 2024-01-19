const axios = require('axios')
const middlewares = require(`${process.cwd()}/lib/webserver/middlewares/index.js`)
const nodered = require(`${process.cwd()}/lib/webserver/middlewares/nodered.js`)

module.exports = (webServer) => {
    return [{
            path: '/',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const nodeId = req.body.module
                    const accessToken = await nodered.getBLSAccessToken()
                    const installNode = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_BLS_SERVICE + process.env.LINTO_STACK_BLS_SERVICE_UI_PATH}/nodes`, {
                        method: 'post',
                        headers: {
                            'charset': 'utf-8',
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': accessToken
                        },
                        data: { module: nodeId }
                    })
                    if (installNode.status === 200) {
                        res.json({
                            status: 'success',
                            msg: `The skill "${nodeId}" has been uninstalled`
                        })
                    } else {
                        throw installNode
                    }
                } catch (error) {
                    console.error(error)

                    // If module is already loaded 
                    if (!!error.response && !!error.response.status && error.response.status === 400 && !!error.response.data && !!error.response.data.message) {
                        res.json({
                            status: 'error',
                            msg: error.response.data.message
                        })
                    } else {
                        res.json({
                            status: 'error',
                            msg: `error on installing node "${nodeId}"`
                        })
                    }
                }
            }
        },
        {
            path: '/remove',
            method: 'delete',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const nodeId = req.body.nodeId
                    const accessToken = await nodered.getBLSAccessToken()
                    const uninstallNode = await axios(`${middlewares.useSSL() + process.env.LINTO_STACK_BLS_SERVICE + process.env.LINTO_STACK_BLS_SERVICE_UI_PATH}/nodes/${nodeId}`, {
                        method: 'delete',
                        headers: {
                            'charset': 'utf-8',
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': accessToken
                        }
                    })
                    if (uninstallNode.status === 204) {
                        res.json({
                            status: 'success',
                            msg: `The skill "${nodeId}" has been uninstalled`
                        })
                    } else {
                        throw uninstallNode
                    }
                } catch (error) {
                    console.error(error)

                    // If module is already loaded 
                    if (!!error.response && !!error.response.status && error.response.status === 400 && !!error.response.data && !!error.response.data.message) {
                        res.json({
                            status: 'error',
                            msg: error.response.data.message
                        })
                    } else {
                        res.json({
                            status: 'error',
                            msg: `error on uninstalling node "${req.body.module}"`
                        })
                    }
                }
            }
        }
    ]
}