const applicationWorkflowsModel = require(`${process.cwd()}/model/mongodb/models/workflows-application.js`)
const androidUsersModel = require(`${process.cwd()}/model/mongodb/models/android-users.js`)
const mqttdUsersModel = require(`${process.cwd()}/model/mongodb/models/mqtt-users.js`)
module.exports = (webServer) => {
    return [{
            // Get all android users
            path: '/',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Request
                    const getAndroidUsers = await androidUsersModel.getAllAndroidUsers()

                    // Response
                    res.json(getAndroidUsers)
                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        error
                    })
                }
            }
        }, {
            // Create a new android user
            /*
            payload = {
              email: String (android user email)
              pswd: String (android user password)
              applications: Array (Array of workflow_id)
            }
            */
            path: '/',
            method: 'post',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Set variables & values
                    const payload = req.body.payload

                    // Request
                    const createUser = await androidUsersModel.createAndroidUsers(payload)

                    // Response
                    if (createUser === 'success') {
                        res.json({
                            status: 'success',
                            msg: `The user "${payload.email}" has been created".`
                        })
                    } else {
                        throw `Error on creating user "${payload.email}"`
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
            // Remove an application for all android users
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
                    const updateAndroidUsers = await androidUsersModel.removeApplicationFromAndroidUsers(payload._id)

                    // Response
                    if (updateAndroidUsers === 'success') {
                        res.json({
                            status: 'success',
                            msg: `All users have been removed from application ${payload.name}`
                        })
                    } else {
                        throw updateAndroidUsers.msg
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
            path: '/:userId/applications',
            method: 'put',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Set variables & values
                    const payload = req.body.payload
                    const userId = req.params.userId
                    const applicationsToAdd = payload.applications

                    // Get android user data
                    const getAndroidUser = await androidUsersModel.getUserById(userId)

                    // Format data for update
                    let user = getAndroidUser
                    user.applications.push(...applicationsToAdd)

                    // Request
                    const updateUser = await androidUsersModel.updateAndroidUser(user)

                    // Response
                    if (updateUser === 'success') {
                        res.json({
                            status: 'success',
                            msg: `New applications have been attached to user "${user.email}"`
                        })
                    } else {
                        throw 'Error on updating user'
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
            // Dissociate an android user from an android application
            path: '/:userId/applications/:applicationId/remove',
            method: 'patch',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Set variables & values
                    const applicationId = req.params.applicationId
                    const userId = req.params.userId

                    // get android user data
                    const user = await androidUsersModel.getUserById(userId)

                    // get application workflow data
                    const applicationWorkflow = await applicationWorkflowsModel.getApplicationWorkflowById(applicationId)

                    // Format data for update
                    let filteredApps = user.applications.filter(app => app !== applicationId)

                    // Remove MQTT user if user is no longer attached to any application
                    if (filteredApps.length === 0 && !!user.email) {
                        await mqttdUsersModel.deleteMqttUserByEmail(user.email)
                    }

                    // Request
                    const updateUser = await androidUsersModel.updateAndroidUser({
                        _id: userId,
                        applications: filteredApps
                    })

                    // Response
                    if (updateUser === 'success') {
                        res.json({
                            status: 'success',
                            msg: `The user "${user.email}" has been dissociated from application "${applicationWorkflow.name}"`
                        })
                    } else {
                        throw 'Error on updating android application user'
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
            // Get an android user by its id
            path: '/:userId',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Set variables & values
                    const userId = req.params.userId

                    // Request
                    const getAndroidUser = await androidUsersModel.getUserById(userId)

                    // Response
                    res.json(getAndroidUser)
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
            // Update an android user
            path: '/:userId',
            method: 'put',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Set variables & values
                    const payload = req.body.payload

                    // Request
                    const updateAndroidUser = await androidUsersModel.updateAndroidUser(payload)

                    if (updateAndroidUser === 'success') {
                        res.json({
                            status: 'success',
                            msg: `User ${payload.email} has been updated`
                        })
                    }

                    // Response
                    res.json(getAndroidUser)
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
            // Update an android user
            path: '/:userId/pswd',
            method: 'put',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Set variables & values
                    const payload = req.body.payload

                    if (payload.newPswd === payload.newPswdConfirmation) {
                        const userPayload = {
                            _id: payload._id,
                            pswd: payload.newPswd
                        }
                        const updateUserPswd = await androidUsersModel.upadeAndroidUserPassword(userPayload)

                        // Remove MQTT user on password change
                        if (payload.email) {
                            await mqttdUsersModel.deleteMqttUserByEmail(payload.email)
                        }

                        if (updateUserPswd === 'success') {
                            res.json({
                                status: 'success',
                                msg: `User ${payload.email} has been updated`
                            })
                        } else {
                            throw `Error on updating user ${payload.email}`
                        }
                    } else {
                        throw 'Password and confirmation password don\'t match'
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
            // Delete an android user
            /*
            payload = {
              email : String (android user email)
            }
            */
            path: '/:userId',
            method: 'delete',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    // Set variables & values
                    const userId = req.params.userId
                    const payload = req.body.payload

                    const getUserById = await androidUsersModel.getUserById(userId)

                    // Remove MQTT user
                    if (!!getUserById.email) {
                        await mqttdUsersModel.deleteMqttUserByEmail(getUserById.email)
                    }
                    // Request
                    const removeUser = await androidUsersModel.deleteAndroidUser(userId)

                    // Response
                    if (removeUser === 'success') {
                        res.json({
                            status: 'success',
                            msg: `Android user ${payload.email} has been removed`
                        })
                    } else {
                        throw `Error on removing user ${payload.email}`
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