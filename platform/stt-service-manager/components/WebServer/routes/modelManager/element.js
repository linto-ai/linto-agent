const debug = require('debug')('app:router:element')
const multer = require('multer')
const uploads = multer({ dest: process.env.TEMP_FILE_PATH }).single('file')
const middlewares = require(`${process.cwd()}/components/WebServer/middlewares/index.js`)
const answer = (ans, req) => {
    middlewares.answer(ans, req)
}

module.exports = (webserver,type) => {
    return [{
        path: '/',
        method: 'post',
        requireAuth: false,
        controller:
            [function (req, res, next) {
                uploads(req, res, function (err) {
                    if (err instanceof multer.MulterError) { res.status(400); res.json({ status: err }) }
                    else next()
                })
            },
            (req, res, next) => {
                const data = {}
                data.content = req.body
                data.modelId = req.params.modelId
                data.name = req.params.name
                data.file = req.file
                if (! webserver.app.components['LinSTT']) answer({bool: false, msg: 'Component not found'}, res)
                webserver.emit(`createType`, (ans) => { answer(ans, res) }, data, type)
            }]
    },
    {
        path: '/',
        method: 'delete',
        requireAuth: false,
        controller: (req, res, next) => {
            if (! webserver.app.components['LinSTT']) answer({bool: false, msg: 'Component not found'}, res)
            webserver.emit(`deleteType`, (ans) => { answer(ans, res) }, req.params, type)
        }
    },
    {
        path: '/',
        method: 'put',
        requireAuth: false,
        controller:
            [function (req, res, next) {
                uploads(req, res, function (err) {
                    if (err instanceof multer.MulterError) { res.status(400); res.json({ status: err }) }
                    else next()
                })
            },
            (req, res, next) => {
                const data = {}
                data.content = req.body
                data.modelId = req.params.modelId
                data.name = req.params.name
                data.file = req.file
                if (! webserver.app.components['LinSTT']) answer({bool: false, msg: 'Component not found'}, res)
                webserver.emit(`updateType`, (ans) => { answer(ans, res) }, data, type, 'put')
            }]
    },
    {
        path: '/',
        method: 'patch',
        requireAuth: false,
        controller:
            [function (req, res, next) {
                uploads(req, res, function (err) {
                    if (err instanceof multer.MulterError) { res.status(400); res.json({ status: err }) }
                    else next()
                })
            },
            (req, res, next) => {
                const data = {}
                data.content = req.body
                data.modelId = req.params.modelId
                data.name = req.params.name
                data.file = req.file
                if (! webserver.app.components['LinSTT']) answer({bool: false, msg: 'Component not found'}, res)
                webserver.emit(`updateType`, (ans) => { answer(ans, res) }, data, type, 'patch')
            }]
    },
    {
        path: '/',
        method: 'get',
        requireAuth: false,
        controller: (req, res, next) => {
            if (! webserver.app.components['LinSTT']) answer({bool: false, msg: 'Component not found'}, res)
            webserver.emit(`getType`, (ans) => { answer(ans, res) }, req.params, type)
        }
    }]
}