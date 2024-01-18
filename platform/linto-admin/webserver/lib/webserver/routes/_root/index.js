const debug = require('debug')('linto-admin:login')

module.exports = (webServer) => {
    return [{
        path: '/',
        method: 'get',
        requireAuth: true,
        controller: async(req, res, next) => {
            try {
                res.redirect('/login')
            } catch (err) {
                console.error(err)
            }
        }
    }]
}