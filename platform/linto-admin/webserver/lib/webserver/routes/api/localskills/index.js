const axios = require('axios')
const localSkillsModel = require(`${process.cwd()}/model/mongodb/models/local-skills.js`)
const moment = require('moment')

module.exports = (webServer) => {
    return [{
            path: '/',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const localSkills = await localSkillsModel.getLocalSkills()
                    res.json(localSkills)
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
            path: '/',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    let payload = req.body
                    payload.created_date = moment().format()
                    const addSkill = await localSkillsModel.addLocalSkill(payload)

                    if (addSkill === 'success') {
                        res.json({
                            status: 'success',
                            msg: `module ${payload.name} has been installed`
                        })
                    } else {
                        throw addSkill
                    }
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        msg: 'Error on adding local skill to DB',
                        error
                    })
                }
            }
        },
        {
            path: '/:skillId',
            method: 'delete',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    const nodeId = req.params.skillId
                    const nodeName = req.body.name
                    const removeSkill = await localSkillsModel.removeLocalSkill(nodeId)
                    if (removeSkill === 'success') {
                        res.json({
                            status: 'success',
                            msg: `module ${nodeName} has been uninstalled`
                        })
                    } else {
                        throw removeSkill
                    }
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        msg: 'Error on removing local skill from DB',
                        error
                    })
                }
            }
        }
    ]
}