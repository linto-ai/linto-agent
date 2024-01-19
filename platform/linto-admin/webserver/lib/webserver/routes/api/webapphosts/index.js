const webappHostsModel = require(`${process.cwd()}/model/mongodb/models/webapp-hosts.js`)
const applicationWorkflowsModel = require(`${process.cwd()}/model/mongodb/models/workflows-application.js`)

module.exports = (webServer) => {
    return [{
            // Get all webapp hosts
            path: '/',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Request
                    const getWebAppHosts = await webappHostsModel.getAllWebAppHosts()

                    // Response
                    res.json(getWebAppHosts)
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
            // Create a webapp host
            path: '/',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const payload = req.body.payload

                    // Request
                    const createWebappHost = await webappHostsModel.createWebAppHost(payload)

                    // Response
                    if (createWebappHost === 'success') {
                        res.json({
                            status: 'success',
                            msg: `The domain "${payload.originUrl}" has been created`
                        })
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
            // Create a webapp host
            path: '/:id',
            method: 'delete',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const webappHostId = req.params.id
                    const payload = req.body.payload

                    // Request
                    const removeWebappHost = await webappHostsModel.deleteWebAppHost(webappHostId)

                    // Response
                    if (removeWebappHost === 'success') {
                        res.json({
                            status: 'success',
                            msg: `The domain "${payload.originUrl}" has been removed`
                        })
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
            // Update a webapp host
            path: '/:id',
            method: 'put',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const payload = req.body.payload

                    // Request
                    const updateWebappHost = await webappHostsModel.updateWebAppHost(payload)

                    // Response
                    if (updateWebappHost === 'success') {
                        res.json({
                            status: 'success',
                            msg: `The domain "${payload.originUrl}" has been updated`
                        })
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
            // Dissociate an application from a web app host
            path: '/:webappHostId/applications/:applicationId',
            method: 'patch',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Set variables & values
                    const payload = req.body.payload
                    const applicationId = req.params.applicationId
                    const applicationWorkflow = await applicationWorkflowsModel.getApplicationWorkflowById(applicationId)
                    let webappHost = payload.webappHost
                    webappHost.applications.splice(webappHost.applications.findIndex(item => item.applicationId === applicationId), 1)

                    // Request
                    const updateWebappHost = await webappHostsModel.updateWebappHost(webappHost)

                    // Response
                    if (updateWebappHost === 'success') {
                        res.json({
                            status: 'success',
                            msg: `The domain "${webappHost.originUrl}" has been dissociated from the application "${applicationWorkflow.name}"`
                        })
                    } else {
                        throw 'Error on updating domain'
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
            // Add an application to an android user
            /* 
            payload = {
              applications: Array (Array of application workflow_id)
            }
            */
            path: '/:webappHostId/applications',
            method: 'put',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Set variables & values
                    const payload = req.body.payload
                    const webappHostId = req.params.webappHostId
                    const applicationsToAdd = payload.applications

                    // get Webapp host data
                    const getWebappHost = await webappHostsModel.getWebappHostById(webappHostId)

                    // Format data for update
                    let webappHost = getWebappHost
                    webappHost.applications.push(...applicationsToAdd)

                    // Request
                    const updateWebappHost = await webappHostsModel.updateWebappHost(webappHost)

                    // Response
                    if (updateWebappHost === 'success') {
                        res.json({
                            status: 'success',
                            msg: `New applications have been attached to domain "${webappHost.originUrl}"`
                        })
                    } else {
                        throw 'Error on updating domain applications'
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
            // Update a webappHost application
            /* 
            payload = {
              webappHostId: webappHost._id,
              applicationId:app.applicationId,
              maxSlots: {
                value: app.maxSlots,
                error: null,
                valid: true
              },
              requestToken: app.requestToken
            }
            */
            path: '/:webappHostId/applications',
            method: 'patch',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const payload = req.body.payload
                    const webappHostId = req.params.webappHostId
                    let webappHost = await webappHostsModel.getWebappHostById(webappHostId)

                    webappHost.applications[webappHost.applications.findIndex(item => item.applicationId === payload.applicationId)].requestToken = payload.requestToken
                    webappHost.applications[webappHost.applications.findIndex(item => item.applicationId === payload.applicationId)].maxSlots = parseInt(payload.maxSlots.value)

                    // Request
                    const updateWebappHost = await webappHostsModel.updateWebappHost(webappHost)

                    // Response
                    if (updateWebappHost === 'success') {
                        res.json({
                            status: 'success',
                            msg: `New applications have been attached to domain "${webappHost.originUrl}"`
                        })
                    } else {
                        throw 'Error on updating domain applications'
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
            // Remove an application for all web-application hosts
            /* 
            paylaod = {
              _id: String (application workflow_id),
              name: String (application worfklow name),
            }
            */
            path: '/applications',
            method: 'patch',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Set variables & values 
                    const payload = req.body.payload

                    // Request
                    const updateWebappHost = await webappHostsModel.removeApplicationForAllHosts(payload._id)

                    // Response
                    if (updateWebappHost === 'success') {
                        res.json({
                            status: 'success',
                            msg: `The application ${payload.name} has been removed from all registered domains`
                        })
                    } else {
                        throw updateWebappHost
                    }
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        error: 'Error on deleting application from registered domains'
                    })
                }
            }
        },
    ]
}