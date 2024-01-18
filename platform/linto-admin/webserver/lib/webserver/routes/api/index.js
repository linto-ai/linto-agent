const debug = require('debug')('linto-admin:routes/api')

module.exports = (webServer) => {
    return [{
        path: '/',
        method: 'get',
        controller: (req, res, next) => {
            res.redirect('/login')
        }
    }]
}