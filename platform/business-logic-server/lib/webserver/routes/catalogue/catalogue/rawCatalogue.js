const debug = require('debug')('linto-red:webserver:front:red:catalogue:raw')
const fetch = require("node-fetch")

const fs = require('fs')

module.exports = {
  create: async function (jsonCatalogue, catalogueData) {
    try {
      let jsonStr = JSON.stringify(jsonCatalogue)
      fs.mkdirSync(catalogueData.dirPath, { recursive: true })
      fs.writeFileSync(catalogueData.dirPath + catalogueData.fileName, jsonStr)
      return jsonCatalogue
    } catch (err) {
      throw err
    }
  }
}