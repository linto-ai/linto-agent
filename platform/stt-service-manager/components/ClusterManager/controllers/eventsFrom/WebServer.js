const debug = require('debug')(`app:dockerswarm:eventsFrom:WebServer`)

// this is bound to the component
module.exports = function () {
    if (!this.app.components['WebServer']) return

    this.app.components['WebServer'].on('startService', async (cb, payload) => {
        /**
          * Create a docker service by service Object
          * @param {Object} payload: {serviceId, externalAccess}
          * @returns {Object}
        */
        try {
            const service = await this.db.service.findService(payload.serviceId)
            if (!service) throw `Service '${payload.serviceId}' does not exist`
            if (service.isOn) throw `Service '${payload.serviceId}' is already started`
            const lmodel = await this.db.lm.findModel(service.LModelId)
            if (!lmodel) throw `Language Model used by this service has been removed`
            if (!lmodel.isGenerated) throw `Service '${payload.serviceId}' could not be started (Language Model '${service.LModelId}' has not been generated yet)`

            await this.cluster.startService(service)
            //const check = await this.cluster.checkServiceOn(service)
            const check = true
            if (check) {
                if (service.externalAccess)
                    this.emit("serviceStarted", { service: payload.serviceId })
                await this.db.service.updateService(payload.serviceId, { isOn: 1 })
            }
            else {
                await this.cluster.stopService(payload.serviceId)
                throw `Something went wrong. Service '${payload.serviceId}' is not started`
            }
            return cb({ bool: true, msg: `Service '${payload.serviceId}' is successfully started` })
        } catch (err) {
            return cb({ bool: false, msg: err })
        }
    })

    this.app.components['WebServer'].on('stopService', async (cb, serviceId) => {
        /**
          * delete a docker service by service Object
          * @param serviceId
          * @returns {Object}
        */
        try {
            const service = await this.db.service.findService(serviceId)
            if (service === -1) throw `Service '${serviceId}' does not exist`
            if (!service.isOn) throw `Service '${serviceId}' is not running`
            await this.cluster.stopService(serviceId)
            //await this.cluster.checkServiceOff(serviceId)
            await this.db.service.updateService(serviceId, { isOn: 0 })
            if (service.externalAccess)
                this.emit("serviceStopped", serviceId)
            return cb({ bool: true, msg: `Service '${serviceId}' is successfully stopped` })
        } catch (err) {
            return cb({ bool: false, msg: err })
        }
    })

    this.app.components['WebServer'].on('scaleService', async (cb, payload) => {
        /**
          * Update a docker service by service Object
          * @param {Object}: {serviceId, replicas}
          * @returns {Object}
        */
        try {
            payload.replicas = parseInt(payload.replicas)
            const service = await this.db.service.findService(payload.serviceId)
            if (!service) throw `Service '${payload.serviceId}' does not exist`
            if (payload.replicas < 1) throw 'The scale must be greater or equal to 1'
            await this.cluster.updateService(payload.serviceId, payload.replicas)
            //await this.cluster.checkServiceOn(payload)
            await this.db.service.updateService(payload.serviceId, { replicas: payload.replicas })
            this.emit("serviceScaled")
            return cb({ bool: true, msg: `Service '${payload.serviceId}' is successfully scaled` })
        } catch (err) {
            return cb({ bool: false, msg: err })
        }
    })
}
