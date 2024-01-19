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
        method: 'post',
        requireAuth: false,
        controller:
            [function (req, res, next) {
                form(req, res, function (err) {
                    if (err instanceof multer.MulterError) { res.status(400); res.json({ status: err }) }
                    else next()
                })
            }, async (req, res, next) => {
                req.body.serviceId = req.params.serviceId
                if (! webserver.app.components['ServiceManager']) answer({bool: false, msg: 'Component not found'}, res)
                webserver.emit("createService", (ans) => { answer(ans, res) }, req.body)
            }]
    },
    {
        path: '/',
        method: 'put',
        requireAuth: false,
        controller:
            [function (req, res, next) {
                form(req, res, function (err) {
                    if (err instanceof multer.MulterError) { res.status(400); res.json({ status: err }) }
                    else next()
                })
            }, (req, res, next) => {
                req.body.serviceId = req.params.serviceId
                if (! webserver.app.components['ServiceManager']) answer({bool: false, msg: 'Component not found'}, res)
                webserver.emit("updateService", (ans) => { answer(ans, res) }, req.body)
            }]
    },
    {
        path: '/',
        method: 'delete',
        requireAuth: false,
        controller:
            (req, res, next) => {
                if (! webserver.app.components['ServiceManager']) answer({bool: false, msg: 'Component not found'}, res)
                webserver.emit("deleteService", (ans) => { answer(ans, res) }, req.params.serviceId)
            }
    },
    {
        path: '/',
        method: 'get',
        requireAuth: false,
        controller:
            (req, res, next) => {
                if (! webserver.app.components['ServiceManager']) answer({bool: false, msg: 'Component not found'}, res)
                webserver.emit("getService", (ans) => { answer(ans, res) }, req.params.serviceId)
            }
    },
    {
        path: '/replicas',
        method: 'get',
        requireAuth: false,
        controller:
            async (req, res, next) => {
                if (! webserver.app.components['ServiceManager']) answer({bool: false, msg: 'Component not found'}, res)
                webserver.emit("getReplicasService", (ans) => { answer(ans, res) }, req.params.serviceId)
            }
    },
    {
        path: '/mode',
        method: 'get',
        requireAuth: false,
        controller:
            async (req, res, next) => {
                if (! webserver.app.components['ServiceManager']) answer({bool: false, msg: 'Component not found'}, res)
                webserver.emit("getModeService", (ans) => { answer(ans, res) }, req.params.serviceId)
            }
    },

    {
        path: '/start',
        method: 'post',
        requireAuth: false,
        controller:
            (req, res, next) => {
                req.body.serviceId = req.params.serviceId
                if (! webserver.app.components['ClusterManager']) answer({bool: false, msg: 'Component not found'}, res)
                webserver.emit("startService", (ans) => { answer(ans, res) }, req.body)
            }
    },
    {
        path: '/scale/:replicas',
        method: 'post',
        requireAuth: false,
        controller:
            async (req, res, next) => {
                if (! webserver.app.components['ClusterManager']) answer({bool: false, msg: 'Component not found'}, res)
                webserver.emit("scaleService", (ans) => { answer(ans, res) }, req.params)
            }
    },
    {
        path: '/stop',
        method: 'post',
        requireAuth: false,
        controller:
            (req, res, next) => {
                if (! webserver.app.components['ClusterManager']) answer({bool: false, msg: 'Component not found'}, res)
                webserver.emit("stopService", (ans) => { answer(ans, res) }, req.params.serviceId)
            }
    }]
}