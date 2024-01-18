const debug = require('debug')('linto-admin:logout')

module.exports = (webServer) => {
    return [{
        path: '/',
        method: 'get',
        requireAuth: true,
        controller: [
            async(req, res, next) => {
                if (req.session.logged === 'on') {
                    req.session.destroy((err) => {
                        if (err) {
                            console.error('Destroy session Err', err)
                        }
                        res.redirect('/login')
                    })
                }
            }
        ]
    }]
}