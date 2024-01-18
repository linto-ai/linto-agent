const debug = require('debug')('linto-admin:setup')
const UsersModel = require(`${process.cwd()}/model/mongodb/models/users.js`)
module.exports = (webServer) => {
    return [{
            path: '/',
            method: 'get',
            controller: async(req, res, next) => {
                const users = await UsersModel.getUsers()
                if (users.length === 0) {
                    res.setHeader("Content-Type", "text/html")
                    res.sendFile(process.cwd() + '/dist/setup.html')
                } else {
                    res.redirect('/login')
                }
            }
        },
        {
            path: '/createuser',
            method: 'post',
            controller: async(req, res, next) => {
                try {
                    const payload = req.body
                    const createUser = await UsersModel.createUser(payload)
                    if (createUser === 'success') {
                        res.json({
                            status: 'success',
                            msg: ''
                        })
                    } else {
                        throw 'error on creating user'
                    }

                } catch (error) {
                    console.error(error)
                    res.json({
                        status: 'error',
                        error: error
                    })
                }
            }
        }
    ]
}