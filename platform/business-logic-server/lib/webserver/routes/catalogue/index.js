'use strict'
const debug = require('debug')('linto-red:webserver:front:catalogue')
const fs = require('fs')
const verdaccio = require('./catalogue/verdaccio')
const catalogueJson = require('./catalogue/rawCatalogue')

const catalogueData = {
  dirPath: './catalogues/',
  fileName: 'catalogues.json'
}

module.exports = (webServer) => {
  return {
    '/catalogue/:type': {
      method: 'post',
      controller: async (req, res, next) => {
        try {
          if (req.params.type === 'raw') {
            let catalogue = await catalogueJson.create(req.body, catalogueData)
            res.status(200).json({ msg: "Catalogue generated : " + req.body.name, ...catalogue })
            return
          }

          if (req.body.host === undefined)
            res.status('409').json({ error: "Registry not defined" })

          if (req.params.type === 'verdaccio') {
            let catalogue = await verdaccio.create(req.body.host, catalogueData)
            res.status(200).json({ msg: "Registry generated for : " + req.body.host, ...catalogue })
          } else {
            res.status('409').json({ error: "Registry parser type not implemented" })
          }
        } catch (err) {
          res.status('404').json(err)
        }
      }
    },
    '/catalogue': {
      method: 'get',
      controller: async (req, res, next) => {
        try {
          let jsonBuffer = fs.readFileSync(catalogueData.dirPath + catalogueData.fileName)
          let json = JSON.parse(jsonBuffer)
          res.status(200).json(json)
        } catch (err) {
          res.status('404').json({ error: "Catalogue not found" })
        }
      }
    }
  }
}
