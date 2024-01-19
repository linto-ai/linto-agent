const nodered = require(`${process.cwd()}/lib/webserver/middlewares/nodered.js`)
const moment = require('moment')
const applicationWorkflowsModel = require(`${process.cwd()}/model/mongodb/models/workflows-application.js`)
const androidUsersModel = require(`${process.cwd()}/model/mongodb/models/android-users.js`)

module.exports = (webServer) => {
    return [{
            // Get all application workflows from database
            path: '/',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const getApplicationWorkflows = await applicationWorkflowsModel.getAllApplicationWorkflows()
                    res.json(getApplicationWorkflows)
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
            // Create a new application workflow
            path: '/',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const payload = req.body.payload
                    const getPostedFlow = await nodered.getFlowById(payload.flowId)

                    // Create workflow 
                    const workflowPayload = {
                        name: payload.workflowName,
                        description: payload.workflowDescription,
                        flowId: payload.flowId,
                        created_date: moment().format(),
                        updated_date: moment().format(),
                        flow: getPostedFlow
                    }

                    const postWorkflow = await applicationWorkflowsModel.postApplicationWorkflow(workflowPayload)
                    if (postWorkflow === 'success') {
                        res.json({
                            status: 'success',
                            msg: `The multi-user application "${payload.workFlowName} has been created`
                        })
                    } else {
                        throw postWorkflow
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
            // Get an application workflow by its id
            path: '/:id',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const workflowId = req.params.id

                    // Request
                    const getApplicationWorkflow = await applicationWorkflowsModel.getApplicationWorkflowById(workflowId)

                    // Response 
                    if (!!getApplicationWorkflow.error) {
                        throw getApplicationWorkflow.error
                    } else {
                        res.json(getApplicationWorkflow)
                    }
                } catch (error) {
                    console.error(error)
                    res.json({ error })
                }
            }
        },
        {
            // Delete a workflow application
            path: '/:workflowId',
            method: 'delete',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const workflowId = req.params.workflowId
                    const workflowName = req.body.workflowName
                    const removeApplication = await applicationWorkflowsModel.deleteApplicationWorkflow(workflowId)
                    if (removeApplication === 'success') {
                        res.json({
                            status: 'success',
                            msg: `The multi-user application "${workflowName}" has been removed.`
                        })
                    } else {
                        throw removeApplication.msg
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
            // Get android users list by workflow ID
            path: '/:workflowId/androidusers',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const workflowId = req.params.workflowId
                    const getAndroidUsers = await androidUsersModel.getAllAndroidUsers()

                    const users = getAndroidUsers.filter(user => workflowId.indexOf(user.applications) >= 0)

                    res.json(users)
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
            // Get android users list by workflow ID
            path: '/:workflowId/androidAuth',
            method: 'put',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const workflowId = req.params.workflowId

                    const getApplicationWorkflow = await applicationWorkflowsModel.getApplicationWorkflowById(workflowId)
                    let applicationPayload = getApplicationWorkflow

                    const nodeIndex = applicationPayload.flow.nodes.findIndex(node => node.type === 'linto-application-in')

                    if (nodeIndex >= 0) {
                        applicationPayload.flow.nodes[nodeIndex].auth_android = !applicationPayload.flow.nodes[nodeIndex].auth_android

                        const updateApplicationWorkflow = await applicationWorkflowsModel.updateApplicationWorkflow(applicationPayload)

                        if (updateApplicationWorkflow === 'success') {
                            const putBls = await nodered.putBLSFlow(applicationPayload.flowId, applicationPayload.flow)

                            if (putBls.status === 'success')  {
                                res.json({
                                    status: 'success',
                                    msg: `The multi-user application ${applicationPayload.name} has been updated`
                                })
                            }
                        } else  {
                            throw 'Error on updating multi-user application'
                        }
                    } else  {
                        throw 'Cannot find users authentication settings'
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
            // update application domains
            path: '/:workflowId/webappAuth',
            method: 'put',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const workflowId = req.params.workflowId

                    const getApplicationWorkflow = await applicationWorkflowsModel.getApplicationWorkflowById(workflowId)
                    let applicationPayload = getApplicationWorkflow

                    const nodeIndex = applicationPayload.flow.nodes.findIndex(node => node.type === 'linto-application-in')

                    if (nodeIndex >= 0) {
                        applicationPayload.flow.nodes[nodeIndex].auth_web = !applicationPayload.flow.nodes[nodeIndex].auth_web

                        const updateApplicationWorkflow = await applicationWorkflowsModel.updateApplicationWorkflow(applicationPayload)

                        if (updateApplicationWorkflow === 'success') {
                            const putBls = await nodered.putBLSFlow(applicationPayload.flowId, applicationPayload.flow)

                            if (putBls.status === 'success')  {
                                res.json({
                                    status: 'success',
                                    msg: `The multi-user application ${applicationPayload.name} has been updated`
                                })
                            }


                        } else  {
                            throw 'Error on updating multi-user application'
                        }
                    } else  {
                        throw 'Cannot find domains authentication settings'
                    }
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        error
                    })
                }
            }
        }
    ]
}