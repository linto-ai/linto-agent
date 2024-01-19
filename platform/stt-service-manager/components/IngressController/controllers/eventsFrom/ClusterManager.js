const debug = require('debug')(`app:ingresscontroller:eventsFrom:ClusterManager`)

// this is bound to the component
module.exports = function () {
    if (!this.app.components['ClusterManager']) return

    if (process.env.INGRESS_CONTROLLER == "nginx") {
        this.app.components['ClusterManager'].on('serviceStarted', async (info) => {
            try {
                this.ingress.addUpStream(info)
                debug(`Reload nginx service ${process.env.NGINX_SERVICE_ID}`)
                await this.ingress.reloadNginx()
            } catch (err) {
                console.error(err)
            }
        })
        this.app.components['ClusterManager'].on('serviceStopped', async (serviceId) => {
            try {
                if (this.ingress.removeUpStream(serviceId)) {
                    debug(`Reload nginx service ${process.env.NGINX_SERVICE_ID}`)
                    await this.ingress.reloadNginx()
                }
            } catch (err) {
                console.error(err)
            }
        })
        this.app.components['ClusterManager'].on('serviceScaled', async () => {
            try {
                debug(`Reload nginx service ${process.env.NGINX_SERVICE_ID}`)
                await this.ingress.reloadNginx()
            } catch (err) {
                console.error(err)
            }
        })
    }

    if (process.env.INGRESS_CONTROLLER == "traefik") {
        this.app.components['ClusterManager'].on('serviceStarted', async (info) => {
            try {
                await this.ingress.addLabels(info.service)                
            } catch (err) {
                console.error(err)
            }
        })
        this.app.components['ClusterManager'].on('serviceStopped', async (serviceId) => {
        })
        this.app.components['ClusterManager'].on('serviceScaled', async () => {
        })
    }
}
