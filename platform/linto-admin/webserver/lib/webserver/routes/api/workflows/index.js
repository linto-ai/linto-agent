const workflowsStaticModel = require(`${process.cwd()}/model/mongodb/models/workflows-static.js`)
const workflowsApplicationModel = require(`${process.cwd()}/model/mongodb/models/workflows-application.js`)
const tmpFlowModel = require(`${process.cwd()}/model/mongodb/models/flow-tmp.js`)
const nodered = require(`${process.cwd()}/lib/webserver/middlewares/nodered.js`)
const lexSeed = require(`${process.cwd()}/lib/webserver/middlewares/lexicalseeding.js`)
const moment = require('moment')

module.exports = (webServer) => {
    return [

        {
            path: '/:id/services/multiuser',
            method: 'patch',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const payload = req.body.payload
                    const workflowId = req.params.id
                    let application = null

                    if (payload.type === 'device') {
                        application = await workflowsStaticModel.getStaticWorkflowById(workflowId)
                    } else if (payload.type === 'application') {
                        application = await workflowsApplicationModel.getApplicationWorkflowById(workflowId)
                    }

                    if (application.name !== payload.applicationName) {
                        application.name = payload.applicationName
                    }
                    if (application.description !== payload.applicationDescription) {
                        application.description = payload.applicationDescription
                    }

                    let updatedFlow = nodered.updateMultiUserApplicationFlowSettings(application.flow, payload)

                    const updateBls = await nodered.putBLSFlow(updatedFlow.id, updatedFlow)
                    if (updateBls.status === 'success') {
                        application.name = payload.applicationName
                        application.description = payload.applicationDescription
                        application.updated_date = moment().format()
                        application.flow = updatedFlow
                        let updateApplication = null
                        if (payload.type === 'device') {
                            updateApplication = await workflowsStaticModel.updateStaticWorkflow(application)
                        } else if (payload.type === 'application') {
                            updateApplication = await workflowsApplicationModel.updateApplicationWorkflow(application)
                        }

                        if (updateApplication === 'success') {
                            res.json({
                                status: 'success',
                                msg: 'Workflow updated'
                            })
                        } else {
                            throw 'Error on updating application'
                        }

                    } else {
                        throw 'Error on updating BLS'
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
            path: '/saveandpublish',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const payload = req.body.payload

                    // Get tmp flow
                    const getTmpFlow = await tmpFlowModel.getTmpFlow()
                    const formattedFlow = nodered.formatFlowGroupedNodes(getTmpFlow)

                    // Update BLS
                    const putBls = await nodered.putBLSFlow(payload.noderedFlowId, formattedFlow)
                    if (putBls.status === 'success') {
                        const getUdpatedFlow = await nodered.getFlowById(payload.noderedFlowId)
                        let updateWorkflow

                        if (payload.type === 'static') { // Static
                            // update static workflow
                            updateWorkflow = await workflowsStaticModel.updateStaticWorkflow({
                                _id: payload.workflowId,
                                flow: getUdpatedFlow,
                                updated_date: moment().format()
                            })
                        } else if (payload.type === 'application') { // Application
                            // update application workflow
                            updateWorkflow = await workflowsApplicationModel.updateApplicationWorkflow({
                                _id: payload.workflowId,
                                flow: getUdpatedFlow,
                                updated_date: moment().format()
                            })
                        }
                        if (updateWorkflow === 'success') {
                            // Lexical Seeding
                            const sttService = formattedFlow.nodes.filter(f => f.type === 'linto-config-transcribe')
                            if (sttService.length > 0 && !!sttService[0].commandOffline) {
                                const lexicalSeeding = await lexSeed.doLexicalSeeding(sttService[0].commandOffline, payload.noderedFlowId)
                                if (lexicalSeeding.status === 'success') {
                                    res.json({
                                        status: 'success',
                                        msg: `The application "${payload.workflowName}" has been updated`
                                    })
                                } else {
                                    throw {
                                        msg: 'Workflow updated but error on lexical seeding',
                                        lexicalSeeding
                                    }
                                }
                            }
                        } else {
                            throw  `Error on updating application "${payload.workflowName}"`
                        }
                    } else {
                        throw 'Error on updating flow on Business Logic Server'
                    }
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        msg: !!error.msg ? error.msg : 'Error on updating workflow',
                        error
                    })
                }
            }
        }
    ]
}