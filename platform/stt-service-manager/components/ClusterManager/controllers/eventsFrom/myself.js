const debug = require('debug')(`app:dockerswarm:eventsFrom:clusterManager:myself`)
const fs = require('fs')
const rimraf = require("rimraf");

// this is bound to the component
module.exports = function () {
    this.on('verifServices', async () => {
        try {
            debug('Start service verification')
            const services = await this.db.service.findServices()
            if (services !== -1) {
                services.forEach(async service => {
                    if (service.isOn) { //check if the service is running
                        const replicas = await this.cluster.serviceIsOn(service.serviceId)
                        if (replicas !== service.replicas) {
                            await this.cluster.stopService(service.serviceId).catch(err => { })
                            await this.cluster.startService(service)
                            //const check = await this.cluster.checkServiceOn(service)
                            const check = true
                            if (check && service.externalAccess) {
                                this.emit("serviceStarted", { service: service.serviceId })
                            }
                            debug(`**** Service ${service.serviceId} is restarted`)
                        } else {
                            if (service.externalAccess)
                                this.emit("serviceStarted", { service: service.serviceId })
                        }
                    } else { //
                        const replicas = await this.cluster.serviceIsOn(service.serviceId)
                        if (replicas > 0) {
                            debug(`**** Service ${service.serviceId} is stopped`)
                            await this.cluster.stopService(service.serviceId)
                        }
                    }
                })
            }
        } catch (err) {
            console.error(err)
        }
    })
    this.on('cleanServices', async () => {
        try {
            debug('Start service cleaning')
            const models = await this.db.lm.findModels()
            if (models !== -1) {
                models.forEach(async model => {
                    if (model.updateState > 0) { //check if service crashed during model generation
                        let update = {}
                        update['updateState'] = 0
                        update['updateStatus'] = ''
                        await this.db.lm.updateModel(model.modelId, update)
                        debug(`**** Language model ${model.modelId} is updated due to a service's crash`)
                    }
                })
            }
            //remove crashed files if exists
            fs.readdir(process.env.TEMP_FILE_PATH, (err, files) => {
                files.forEach(file => {
                    const path = `${process.env.TEMP_FILE_PATH}/${file}`
                    debug(`**** remove tmp file ${path} after a service's crash`);
                    rimraf(path, async (err) => { if (err) throw err })
                });
            });
        } catch (err) {
            console.error(err)
        }
    })
}