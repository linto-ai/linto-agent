const debug = require('debug')('app:model:serviceupdates')
const datetime = require('node-datetime')
const MongoModel = require(`${process.cwd()}/models/model.js`)

class ServiceUpdates extends MongoModel {
    constructor() {
        super('Services') // "context" est le nom de ma collection
    }

    //create a new instance
    async createService(obj) {
        try {
            let newService = {
                serviceId: obj.serviceId,
                tag: obj.tag,
                replicas: obj.replicas,
                LModelId: obj.LModelId,
                AModelId: obj.AModelId,
                externalAccess: obj.externalAccess,
                lang: obj.lang,
                isOn: 0,
                date: datetime.create().format('m/d/Y-H:M:S')
            }
            return await this.mongoInsert(newService)
        } catch (err) {
            throw "> ServiceCollection ERROR: " + err
        }
    }

    // find service by name
    async findService(serviceId) {
        try {
            const service = await this.mongoRequest({ serviceId: serviceId })
            if (service.length == 0) return false
            else return service[0]
        } catch (err) {
            throw "> ServiceCollection ERROR: " + err
        }
    }

    // find all services
    async findServices(request = {}) {
        try {
            return await this.mongoRequest(request)
        } catch (err) {
            throw "> ServiceCollection ERROR: " + err
        }
    }

    // update service by name
    async updateService(id, obj) {
        try {
            obj.date = datetime.create().format('m/d/Y-H:M:S')
            return await this.mongoUpdate({ serviceId: id }, obj)
        } catch (err) {
            throw "> ServiceCollection ERROR: " + err
        }
    }

    // delete service by name
    async deleteService(serviceId) {
        try {
            return await this.mongoDelete({ serviceId: serviceId })
        } catch (err) {
            throw "> ServiceCollection ERROR: " + err
        }
    }
}

module.exports = new ServiceUpdates()
