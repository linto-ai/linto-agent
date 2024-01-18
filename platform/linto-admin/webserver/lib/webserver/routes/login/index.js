const debug = require('debug')('linto-admin:login')
const sha1 = require('sha1')
const UsersModel = require(`${process.cwd()}/model/mongodb/models/users.js`)

module.exports = (webServer) => {
    return [{
            path: '/',
            method: 'get',
            requireAuth: true,
            controller: async(req, res, next) => {
                try {
                    if (!!req.session && req.session.logged === 'on') {
                        res.redirect('/admin/applications/device')
                    } else {
                        const users = await UsersModel.getUsers()
                        if (users.length === 0) {
                            res.redirect('/setup')
                        } else {
                            res.setHeader("Content-Type", "text/html")
                            res.sendFile(process.cwd() + '/dist/login.html')
                        }
                    }
                } catch (err) {
                    console.error(err)
                }
            }
        },
        {
            path: '/userAuth',
            method: 'post',
            requireAuth: false,
            controller: async(req, res, next) => {
                if (req.body.userName != "undefined" && req.body.password != "undefined") { // get post datas
                    const userName = req.body.userName
                    const password = req.body.password
                    try {
                        let user
                        let getUser = await UsersModel.getUserByName(userName)
                        if (getUser.length > 0) {
                            user = getUser[0]
                        }
                        if (typeof(user) === "undefined") { // User not found
                            throw 'User not found'
                        } else { // User found
                            const userPswdHash = user.pswdHash
                            const salt = user.salt
                                // Compare password with database
                            if (sha1(password + salt) == userPswdHash) {
                                req.session.logged = 'on'
                                req.session.user = userName
                                req.session.save((err) => {
                                    if (err) {
                                        throw "Error on saving session"
                                    } else {
                                        //Valid password
                                        res.json({
                                            "status": "success",
                                            "msg": "valid"
                                        })
                                    }
                                })

                            } else {
                                // Invalid password
                                throw "Invalid password"
                            }
                        }
                    } catch (error) {
                        console.error(error)
                        res.json({
                            status: "error",
                            msg: error
                        })
                    }
                } else {
                    res.json({
                        status: "error",
                        msg: "An error has occured whent trying to connect to database"
                    })
                }
            }
        }
    ]
}