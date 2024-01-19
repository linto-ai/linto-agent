const debug = require('debug')('linto-red:node-red')

const fs = require('fs')
const path = require('path')
const decompress = require('decompress')
const tar = require('tar-fs')
const http = require('http')
const bcrypt = require('bcryptjs')

let redSettings = require('./settings/settings.js')
let RED = require('node-red')

const TRANSFORM_EXTENSION_SUPPORTED = ['.zip']
const EXTENSION_SUPPORTED = ['.tar', '.tar.gz', '.gz']

function ifHas(element, defaultValue) {
  if (!element) return defaultValue
  return element
}

class RedManager {
  constructor(webServer) {
    return this.init(webServer)
  }

  async init(express) {
    let server = http.createServer(express)
    if (process.env.LINTO_STACK_BLS_HTTP_PORT)
      if (process.env.LINTO_STACK_BLS_USE_LOGIN === 'false') {
        delete redSettings.adminAuth
      } else {
        const hashPassword = bcrypt.hashSync(process.env.LINTO_STACK_BLS_PASSWORD, 8)

        redSettings.adminAuth = {
          type: 'credentials',
          users: [{
            username: process.env.LINTO_STACK_BLS_USER,
            password: hashPassword,
            permissions: '*',
          }],
        }
      }

    redSettings.httpAdminRoot = ifHas(process.env.LINTO_STACK_BLS_SERVICE_UI_PATH, redSettings.httpAdminRoot)
    redSettings.httpNodeRoot = ifHas(process.env.LINTO_STACK_BLS_SERVICE_API_PATH, redSettings.httpNodeRoot)

    //Load auth service
    if (process.env.LINTO_STACK_OVERWATCH_SERVICE && process.env.LINTO_STACK_OVERWATCH_BASE_PATH)
      redSettings.functionGlobalContext.authServerHost = process.env.LINTO_STACK_OVERWATCH_SERVICE + process.env.LINTO_STACK_OVERWATCH_BASE_PATH

    redSettings.functionGlobalContext.sslStack = "http://"
    if (process.env.LINTO_STACK_USE_SSL === 'true') {
      redSettings.functionGlobalContext.sslStack = "https://"
    }

    // redSettings.editorTheme.palette.catalogues.push(redSettings.functionGlobalContext.sslStack + process.env.LINTO_STACK_DOMAIN + '/red/catalogue')
    redSettings.apiMaxLength = process.env.LINTO_STACK_BLS_API_MAX_LENGTH

    RED.init(server, redSettings)

    express.use(ifHas(process.env.LINTO_STACK_BLS_SERVICE_UI_PATH, redSettings.httpAdminRoot), RED.httpAdmin)
    express.use(ifHas(process.env.LINTO_STACK_BLS_SERVICE_API_PATH, redSettings.httpNodeRoot), RED.httpNode)

    server.listen(ifHas(process.env.LINTO_STACK_BLS_HTTP_PORT, redSettings.uiPort))
    server.timeout = 360000

    const events = RED.events
    events.once('flows:started', () => {
      if (redSettings.disableList) {
        for (let i in RED.nodes.getNodeList()) {
          if (redSettings.disableList.indexOf(RED.nodes.getNodeList()[i].name) > -1) {
            RED.nodes.disableNode(RED.nodes.getNodeList()[i].id)
          }
        }
      }
    })


    await RED.start()

    express.get('/red/print', function (req, res) {
      res.send(RED.nodes.getNodeList())
    })

    express.post('/red/node/module/:nodeName', async function (req, res) {
      if (req.params.nodeNameModule) {
        await RED.runtime.nodes.addModule({
          module: req.params.nodeNameModule
        })
        return res.send('Node installed')
      }
      return res.status(500).send('nodeName is missing')
    })

    express.post('/red/node/file', async function (req, res) {
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.')
      }

      let sampleFile, extensionFile
      sampleFile = req.files.files
      extensionFile = path.extname(sampleFile.name)

      if (TRANSFORM_EXTENSION_SUPPORTED.includes(extensionFile)) {
        try {
          const pathExtract = '/tmp/skills/' + path.basename(sampleFile.name, extensionFile)

          decompress(sampleFile.data, pathExtract).then((files) => {
            tar.pack(pathExtract, {
              map: function (header) {
                header.name = './' + header.name
                return header
              }
            }).pipe(fs.createWriteStream(pathExtract + '.tar'))
              .on('finish', async () => {
                let tarFiles = fs.readFileSync(pathExtract + '.tar')
                const moduleToAdd = {
                  tarball: {
                    name: path.basename(sampleFile.name, extensionFile),
                    size: tarFiles.length,
                    buffer: tarFiles
                  }
                }

                await RED.runtime.nodes.addModule(moduleToAdd).then(node => {
                  return res.status(200).send(node)
                }).catch((err) => {
                  if (err.code === 'module_already_loaded') return res.status(202).send({ error: 'module already loaded' })
                  else return res.status(400).send({ error: err.message })
                })
              })
          })
        } catch (err) { return res.status(err.status).send({ error: err.code }) }
      }

      else if (EXTENSION_SUPPORTED.includes(extensionFile)) {
        try {
          let moduleToAdd = {
            tarball: {
              name: sampleFile.name,
              size: sampleFile.size,
              buffer: sampleFile.data
            }
          }

          await RED.runtime.nodes.addModule(moduleToAdd).then(node => {
            return res.status(200).send(node)
          }).catch((err) => {
            if (err.code === 'module_already_loaded') return res.status(202).send({ error: 'module already loaded' })
            else return res.status(400).send({ error: err.message })
          })

        } catch (err) { return res.status(err.status).send({ error: err.code }) }
      }

      else return res.status(400).send({ error: 'Wrong extension. Supported extension are : .zip, .tar and .tar.gz' })
    })
  }
}

module.exports = RedManager