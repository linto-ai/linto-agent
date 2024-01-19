const debug = require('debug')(`app:servicemanager:eventsFrom:WebServer`)

// this is bound to the component
module.exports = function () {
    if (!this.app.components['WebServer']) return

    this.app.components['WebServer'].on('createService', async (cb, payload) => {
        /**
          * Create a service by its "serviceId"
          * @param {Object} payload: {serviceId, replicas, tag}
          * @returns {Object}
        */
        try {
            const res = await this.db.service.findService(payload.serviceId)
            if (res) throw `Service '${payload.serviceId}' exists`
            if (payload.replicas == undefined) throw 'Undefined field \'replicas\' (required)'
            if (payload.replicas < 1) throw '\'replicas\' must be greater or equal to 1'
            if (payload.tag == undefined) throw 'Undefined field \'tag\' (required)'
            if (!this.verifTag(payload.tag)) throw `Unrecognized \'tag\'. Supported tags are: ${this.tag}`
            if (payload.languageModel == undefined) throw 'Undefined field \'languageModel\' (required)'
            const lmodel = await this.db.lm.findModel(payload.languageModel)
            if (!lmodel) throw `Language Model '${payload.languageModel}' does not exist`

            if (payload.externalAccess == undefined) throw 'Undefined field \'externalAccess\' (required)'
            if (payload.externalAccess.toLowerCase() != "yes" && payload.externalAccess.toLowerCase() != "no") throw 'Unrecognized \'externalAccess\'. Supported values are: yes|no'

            let externalAccess = 0
            if (payload.externalAccess.toLowerCase() == "yes")
                externalAccess = 1


            const request = {
                serviceId: payload.serviceId,
                tag: payload.tag,
                replicas: parseInt(payload.replicas),
                LModelId: lmodel.modelId,
                AModelId: lmodel.acmodelId,
                externalAccess: externalAccess,
                lang: lmodel.lang
            }
            await this.db.service.createService(request)
            return cb({ bool: true, msg: `Service '${payload.serviceId}' is successfully created` })
        } catch (err) {
            return cb({ bool: false, msg: err })
        }
    })

    this.app.components['WebServer'].on('updateService', async (cb, payload) => {
        /**
          * Update a service by its "serviceId"
          * @param {Object} payload: {serviceId, replicas, tag}
          * @returns {Object}
        */
        try {
            let update = {}
            const service = await this.db.service.findService(payload.serviceId)
            if (!service) throw `Service '${payload.serviceId}' does not exist`
            if (service.isOn) throw `Service '${payload.serviceId}' is running`

            if (payload.replicas != undefined) {
                if (payload.replicas < 1) throw '\'replicas\' must be greater or equal to 1'
                update.replicas = parseInt(payload.replicas)
            }
            if (payload.tag != undefined) {
                if (!this.verifTag(payload.tag)) throw `Unrecognized 'tag'. Supported tags are: ${this.tag}`
                update.tag = payload.tag
            }
            if (payload.languageModel != undefined) {
                const lmodel = await this.db.lm.findModel(payload.languageModel)
                if (!lmodel) throw `Language Model '${payload.languageModel}' does not exist`
                update.LModelId = lmodel.modelId
                update.AModelId = lmodel.acmodelId
            }

            if (payload.externalAccess != undefined) {
                if (payload.externalAccess.toLowerCase() != "yes" && payload.externalAccess.toLowerCase() != "no") throw 'Unrecognized \'externalAccess\'. Supported values are: yes|no'
                update.externalAccess = 0
                if (payload.externalAccess.toLowerCase() == "yes")
                    update.externalAccess = 1
            }

            await this.db.service.updateService(payload.serviceId, update)
            return cb({ bool: true, msg: `Service '${payload.serviceId}' is successfully updated` })
        } catch (err) {
            return cb({ bool: false, msg: err })
        }
    })

    this.app.components['WebServer'].on('deleteService', async (cb, serviceId) => {
        /**
          * Remove a service by its "serviceId"
          * @param serviceId
          * @returns {Object}
        */
        try {
            const service = await this.db.service.findService(serviceId)
            if (!service) throw `Service '${serviceId}' does not exist`
            if (service.isOn) throw `Service '${serviceId}' is running`
            await this.db.service.deleteService(serviceId)
            return cb({ bool: true, msg: `Service '${serviceId}' is successfully removed` })
        } catch (err) {
            return cb({ bool: false, msg: err })
        }
    })

    this.app.components['WebServer'].on('getService', async (cb, serviceId) => {
        /**
          * Find a service by its "serviceId"
          * @param serviceId
          * @returns {Object}
        */
        try {
            const res = await this.db.service.findService(serviceId)
            if (!res) throw `Service '${serviceId}' does not exist`
            return cb({ bool: true, msg: res })
        } catch (err) {
            return cb({ bool: false, msg: err })
        }
    })

    this.app.components['WebServer'].on('getReplicasService', async (cb, serviceId) => {
        /**
          * get number of replicas for a giving service
          * @param serviceId
          * @returns {Object}
        */
        try {
            const service = await this.db.service.findService(serviceId)
            if (!service) throw `Service '${serviceId}' does not exist`
            return cb({ bool: true, msg: service.replicas })
        } catch (err) {
            return cb({ bool: false, msg: err })
        }
    })

    this.app.components['WebServer'].on('getModeService', async (cb, serviceId) => {
        /**
          * get number of replicas for a giving service
          * @param serviceId
          * @returns {Object}
        */
        try {
            const service = await this.db.service.findService(serviceId)
            if (!service) throw `Service '${serviceId}' does not exist`
            return cb({ bool: true, msg: service.tag })
        } catch (err) {
            return cb({ bool: false, msg: err })
        }
    })

    this.app.components['WebServer'].on('getServices', async (cb) => {
        /**
          * Find all created services
          * @param None
          * @returns {Object}
        */
        try {
            const res = await this.db.service.findServices()
            return cb({ bool: true, msg: res })
        } catch (err) {
            return cb({ bool: false, msg: err })
        }
    })

    this.app.components['WebServer'].on('getRunningServices', async (cb) => {
        /**
          * Find running docker services
          * @param None
          * @returns {Object}
        */
        try {
            const res = await this.db.service.findServices({ isOn: 1 })
            return cb({ bool: true, msg: res })
        } catch (err) {
            return cb({ bool: false, msg: err })
        }
    })
}
