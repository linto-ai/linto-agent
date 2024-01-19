const debug = require('debug')(`app:ingresscontroller:traefik`)
const Docker = require('dockerode');
const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET_PATH });

class Traefik {
    constructor() {
    }
    async addLabels(serviceId) {
        return new Promise(async (resolve, reject) => {
            try {
                const service = await docker.getService(serviceId)
                const spec = await service.inspect()
                const newSpec = spec.Spec
                newSpec.version = spec.Version.Index

                //Service Prefix
                const prefix= `/${process.env.LINSTT_PREFIX}/${serviceId}`

                //services & routers
                const enableLable = `traefik.enable`
                const portLable = `traefik.http.services.${serviceId}.loadbalancer.server.port`
                const entrypointLable = `traefik.http.routers.${serviceId}.entrypoints`
                const ruleLable = `traefik.http.routers.${serviceId}.rule`
                newSpec.Labels[enableLable] = 'true'
                newSpec.Labels[portLable] = '80'
                newSpec.Labels[entrypointLable] = 'http'
                newSpec.Labels[ruleLable] = `Host(\`${process.env.LINTO_STACK_DOMAIN}\`) && PathPrefix(\`${prefix}\`)`

                //middlewares
                const prefixLabel = `traefik.http.middlewares.${serviceId}-prefix.stripprefix.prefixes`
                const middlewareLabel = `traefik.http.routers.${serviceId}.middlewares`
                newSpec.Labels[prefixLabel] = prefix
                newSpec.Labels[middlewareLabel] = `${serviceId}-prefix@docker`

                //ssl
                const secureentrypoints = `traefik.http.routers.${serviceId}-secure.entrypoints`
                const securetls = `traefik.http.routers.${serviceId}-secure.tls`
                const securemiddleware = `traefik.http.routers.${serviceId}-secure.middlewares`
                const securerule = `traefik.http.routers.${serviceId}-secure.rule`

                if (process.env.LINTO_STACK_USE_SSL != undefined && process.env.LINTO_STACK_USE_SSL == 'true') {
                    newSpec.Labels[secureentrypoints] = "https"
                    newSpec.Labels[securetls] = "true"
                    newSpec.Labels[securemiddleware] = `${serviceId}-prefix@docker`
                    newSpec.Labels[securerule] = `Host(\`${process.env.LINTO_STACK_DOMAIN}\`) && PathPrefix(\`${prefix}\`)`
                    newSpec.Labels[middlewareLabel] = `ssl-redirect@file, ${serviceId}-prefix@docker`
                }

                //basicAuth
                if (process.env.LINTO_STACK_HTTP_USE_AUTH != undefined && process.env.LINTO_STACK_HTTP_USE_AUTH == 'true') {
                    if (process.env.LINTO_STACK_USE_SSL != undefined && process.env.LINTO_STACK_USE_SSL == 'true')
                        newSpec.Labels[securemiddleware] = `basic-auth@file, ${serviceId}-prefix@docker`
                    else
                        newSpec.Labels[middlewareLabel] = `basic-auth@file, ${serviceId}-prefix@docker`
                }

                await service.update(newSpec)
                resolve()
            } catch (err) {
                debug(err)
                reject(err)
            }
        })
    }

}


module.exports = new Traefik()
