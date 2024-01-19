const debug = require('debug')('app:router:lmodel')
const multer = require('multer')
const form = multer({ dest: process.env.TEMP_FILE_PATH }).single('file')

const middlewares = require(`${process.cwd()}/components/WebServer/middlewares/index.js`)
const answer = (ans, req) => {
    middlewares.answer(ans, req)
}

module.exports = (webserver) => {
    return [{
        path: '/',
        method: 'post',
        requireAuth: false,
        controller:
            [function (req, res, next) {
                form(req, res, function (err) {
                    if (err instanceof multer.MulterError) { res.status(400); res.json({ status: err }) }
                    else next()
                })
            }, (req, res, next) => {
                req.body.modelId = req.params.modelId
                req.body.file = req.file
                if (! webserver.app.components['LinSTT']) answer({bool: false, msg: 'Component not found'}, res)
                webserver.emit("createLModel", (ans) => { answer(ans, res) }, req.body)
            }]
    },
    {
        path: '/generate/graph',
        method: 'get',
        requireAuth: false,
        controller:
            (req, res, next) => {
                try {
                    if (! webserver.app.components['LinSTT']) answer({bool: false, msg: 'Component not found'}, res)
                    webserver.emit("generateLModel", (ans) => { answer(ans, res) }, req.params.modelId)
                } catch (error) {
                    console.error(error)
                }
            }
    },
    {
        path: '/',
        method: 'delete',
        requireAuth: false,
        controller:
            (req, res, next) => {
                if (! webserver.app.components['LinSTT']) answer({bool: false, msg: 'Component not found'}, res)
                webserver.emit("deleteLModel", (ans) => { answer(ans, res) }, req.params.modelId)
            }
    },
    {
        path: '/',
        method: 'get',
        requireAuth: false,
        controller:
            (req, res, next) => {
                if (! webserver.app.components['LinSTT']) answer({bool: false, msg: 'Component not found'}, res)
                webserver.emit("getLModel", (ans) => { answer(ans, res) }, req.params.modelId)
            }
    },
    {
        path: '/:param',
        method: 'get',
        requireAuth: false,
        controller:
            (req, res, next) => {
                if (! webserver.app.components['LinSTT']) answer({bool: false, msg: 'Component not found'}, res)
                webserver.emit("getLModel", (ans) => { answer(ans, res) }, req.params.modelId, req.params.param)
            }
    }]
}