const debug = require('debug')('linto-red:webserver:front:red:catalogue:verdaccio')
const fetch = require("node-fetch")

const fs = require('fs')

async function getDataFromAPI(url) {
  let response = await fetch(url)
  let json = await response.json()

  if (response.ok)
    return json
  else {
    throw json
  }
}

function writeFile(redCatalogue, catalogueData) {
  let jsonStr = JSON.stringify(redCatalogue)

  fs.mkdirSync(catalogueData.dirPath, { recursive: true })
  fs.writeFileSync(catalogueData.dirPath + catalogueData.fileName, jsonStr)
}

module.exports = {
  create: async function (host, catalogueData) {
    try {
      let redCatalogue = {
        name: "verdaccio-catalogue",
        updated_at: new Date(),
        modules: []
      }

      let url = host + "/-/verdaccio/packages"
      let catalogue = await getDataFromAPI(url)

      host += "/-/web/detail/"
      catalogue.map(mod_verdaccio => {
        let catalogue_module = {
          description: mod_verdaccio.description,
          version: mod_verdaccio.version,
          keywords: mod_verdaccio.keywords,
          types: ["node-red"],
          updated_at: mod_verdaccio.time,
          id: mod_verdaccio.name,
          url: host + mod_verdaccio.name,
          pkg_url: mod_verdaccio.dist.tarball

        }
        redCatalogue.modules.push(catalogue_module)
      })

      writeFile(redCatalogue, catalogueData)
      return redCatalogue
    } catch (err) {
      throw err
    }
  }
}