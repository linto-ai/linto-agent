const debug = require('debug')(`app:dockerswarm:eventsFrom:LinSTT`)

// this is bound to the component
module.exports = function () {
    if (!this.app.components['LinSTT']) return

    this.app.components['LinSTT'].on('serviceReload', async (modelId) => {
        try {
            const services = await this.db.service.findServices({ isOn: 1, LModelId: modelId })
            services.forEach(async (service) => {
                debug(`Reload running service ${service.serviceId} using the model ${modelId}`)
                await this.cluster.updateService(service.serviceId)
            })
        } catch (err) {
            console.error(err)
        }
    })
}