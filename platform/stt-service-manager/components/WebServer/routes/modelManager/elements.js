const debug = require('debug')('app:router:elements')

const middlewares = require(`${process.cwd()}/components/WebServer/middlewares/index.js`)
const answer = (ans, req) => {
    middlewares.answer(ans, req)
}

module.exports = (webserver,type) => {
    return [{
        path: '/',
        method: 'get',
        requireAuth: false,
        controller:
            (req, res, next) => {
                if (! webserver.app.components['LinSTT']) answer({bool: false, msg: 'Component not found'}, res)
                webserver.emit(`getTypes`, (ans) => { answer(ans, res) }, req.params.modelId, type)
            }
    }]
}