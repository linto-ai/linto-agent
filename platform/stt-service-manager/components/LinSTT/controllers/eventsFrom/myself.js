const debug = require('debug')(`app:linstt:events`)
const fs = require('fs').promises

// this is bound to the component
module.exports = function () {
    this.on('create', async (payload, type, cb) => {
    })
    this.on('update', async (payload, type, update, cb) => {

    })
    this.on('delete', async (payload, type, cb) => {

    })

}