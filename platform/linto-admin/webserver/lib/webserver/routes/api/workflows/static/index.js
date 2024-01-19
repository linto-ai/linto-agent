const workflowsStaticModel = require(`${process.cwd()}/model/mongodb/models/workflows-static.js`)
const clientsStaticModel = require(`${process.cwd()}/model/mongodb/models/clients-static.js`)
const nodered = require(`${process.cwd()}/lib/webserver/middlewares/nodered.js`)
const moment = require('moment')

module.exports = (webServer) => {
    return [{
            // Get all static workflows from database
            path: '/',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Request
                    const getStaticWorkflows = await workflowsStaticModel.getAllStaticWorkflows()

                    // Response
                    res.json(getStaticWorkflows)
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        msg: 'Error on getting device workflows',
                        error
                    })
                }
            }
        },
        {
            // Get a static workflow by its id
            path: '/:id',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const workflowId = req.params.id

                    // Request
                    const getStaticWorkflow = await workflowsStaticModel.getStaticWorkflowById(workflowId)

                    // Response 
                    if (!!getStaticWorkflow.error) {
                        throw getStaticWorkflow.error
                    } else {
                        res.json(getStaticWorkflow)
                    }
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        msg: 'Error on getting device workflow',
                        error
                    })
                }
            }
        },
        {
            // Get a static workflow by its name
            path: '/name/:name',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const name = req.params.name

                    // Request
                    const getStaticWorkflow = await workflowsStaticModel.getStaticWorkflowByName(name)

                    // Response
                    if (!!getStaticWorkflow.error) {
                        throw getStaticWorkflow.error
                    } else {
                        res.json(getStaticWorkflow)
                    }
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        msg: 'Error on getting device workflow',
                        error
                    })
                }
            }
        },
        {
            // Create a new static workflow
            /*
            payload : {
            sn: String,
            workflowName: String,
            workflowTemplate: String,
            sttServiceLanguage: String,
            sttService: String,
            tockApplicationName: String
            }
            */

            path: '/',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Set variables & values
                    const payload = req.body.payload

                    // get flow object
                    const getPostedFlow = await nodered.getFlowById(payload.flowId)

                    // Create workflow 
                    const workflowPayload = {
                        name: payload.workflowName,
                        flowId: payload.flowId,
                        description: payload.workflowDescription,
                        created_date: moment().format(),
                        updated_date: moment().format(),
                        associated_device: payload.device,
                        flow: getPostedFlow
                    }

                    // Request
                    const postWorkflow = await workflowsStaticModel.postStaticWorkflow(workflowPayload)

                    // Response
                    if (postWorkflow === 'success') {
                        res.json({
                            status: 'success',
                            msg: `The device application "${payload.workFlowName} has been created`
                        })
                    } else {
                        throw postWorkflow
                    }
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        msg: 'Error on creating device application',
                        error
                    })
                }
            }
        },
        {
            // Remove a static workflow and dissociate Static device and workflow template

            path: '/:id',
            method: 'delete',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Set variables & values
                    const payload = req.body.payload
                    const workflowId = req.params.id

                    // Get static workflow
                    const getWorkflow = await workflowsStaticModel.getStaticWorkflowById(workflowId)
                    const staticDeviceSn = payload.sn

                    // Delete workflow from BLS 
                    // "Success" is not required (if the workflow has been removed manually for exemple)
                    await nodered.deleteBLSFlow(getWorkflow.flowId)

                    // Update static client in DB 
                    const updateStaticDevice = await clientsStaticModel.updateStaticClient({ sn: staticDeviceSn, associated_workflow: null })
                    if (updateStaticDevice === 'success') {
                        // Delete Static workflow from DB
                        const deleteStaticWorkflow = await workflowsStaticModel.deleteStaticWorkflowById({ _id: workflowId })
                        if (deleteStaticWorkflow === 'success') {
                            res.json({
                                status: 'success',
                                msg: `The device "${staticDeviceSn}" has been dissociated from device application "${getWorkflow.name}"`
                            })
                        } else {
                            throw `Error on updating device "${staticDeviceSn}"`
                        }
                    } else {
                        throw `Error on deleting device application "${getWorkflow.name}"`
                    }
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        msg: 'Error on removing device application',
                        error
                    })
                }
            }
        }
    ]
}