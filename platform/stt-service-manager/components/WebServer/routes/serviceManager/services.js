const debug = require('debug')('app:router:servicemanager')
const multer = require('multer')
const form = multer({ dest: process.env.TEMP_FILE_PATH }).none()
const middlewares = require(`${process.cwd()}/components/WebServer/middlewares/index.js`)
const answer = (ans, req) => {
    middlewares.answer(ans, req)
}

module.exports = (webserver) => {
    return [{
        path: '/',
        method: 'get',
        requireAuth: false,
        controller:
            (req, res, next) => {
                if (! webserver.app.components['ServiceManager']) answer({bool: false, msg: 'Component not found'}, res)
                webserver.emit("getServices", (ans) => { answer(ans, res) })
            }
    },
    {
        path: '/running',
        method: 'get',
        requireAuth: false,
        controller:
            (req, res, next) => {
                if (! webserver.app.components['ServiceManager']) answer({bool: false, msg: 'Component not found'}, res)
                webserver.emit("getRunningServices", (ans) => { answer(ans, res) })
            }
    }]
}