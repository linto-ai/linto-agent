const debug = require('debug')(`app:ingresscontroller:nginx`)
const fs = require('fs')
const NginxConfFile = require('nginx-conf').NginxConfFile;
const Docker = require('dockerode');
const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET_PATH });
const sleep = require('util').promisify(setTimeout)

class Nginx {
    constructor() {
        try {
            fs.copyFileSync(`${process.cwd()}/components/IngressController/Nginx/nginx.conf`, process.env.NGINX_CONF_PATH)
            this.createConf().then(res => { this.conf = res })
        } catch (err) {
            throw err
        }
    }

    async createConf() {
        return new Promise((resolve, reject) => {
            try {
                NginxConfFile.create(process.env.NGINX_CONF_PATH, function (err, conf) {
                    if (err) reject(err)
                    resolve(conf)
                })
            } catch (err) {
                reject(err)
            }
        })
    }

    addUpStream(config) {
        let idx = 0
        // Add upstream
        try {
            if (this.conf.nginx.upstream === undefined) {
                this.conf.nginx._add('upstream', config.service);
                this.conf.nginx.upstream._add('server', `${config.service}:80`);
                this.conf.nginx.upstream._add('least_conn', '');
            } else {
                this.conf.nginx._add('upstream', config.service);
                idx = this.conf.nginx.upstream.length - 1
                this.conf.nginx.upstream[idx]._add('server', `${config.service}:80`);
                this.conf.nginx.upstream[idx]._add('least_conn', '');
            }

            // Add location
            const prefix = `/${process.env.LINSTT_PREFIX}/${config.service}`

            if (this.conf.nginx.server.location === undefined) {
                this.conf.nginx.server._add('location', `${prefix}/`);
                this.conf.nginx.server.location._add('rewrite', `${prefix}/(.*) /$1 break`);
                this.conf.nginx.server.location._add('client_max_body_size', `200M`);
                this.conf.nginx.server.location._add('keepalive_timeout', `600s`);
                this.conf.nginx.server.location._add('proxy_connect_timeout', `600s`);
                this.conf.nginx.server.location._add('proxy_send_timeout', `600s`);
                this.conf.nginx.server.location._add('proxy_read_timeout', `600s`);
                this.conf.nginx.server.location._add('send_timeout', `600s`);
                this.conf.nginx.server.location._add('proxy_pass', `http://${config.service}`);
            } else {
                this.conf.nginx.server._add('location', `${prefix}/`);
                idx = this.conf.nginx.server.location.length - 1
                this.conf.nginx.server.location[idx]._add('rewrite', `${prefix}/(.*) /$1 break`);
                this.conf.nginx.server.location[idx]._add('client_max_body_size', `200M`);
                this.conf.nginx.server.location[idx]._add('keepalive_timeout', `600s`);
                this.conf.nginx.server.location[idx]._add('proxy_connect_timeout', `600s`);
                this.conf.nginx.server.location[idx]._add('proxy_send_timeout', `600s`);
                this.conf.nginx.server.location[idx]._add('proxy_read_timeout', `600s`);
                this.conf.nginx.server.location[idx]._add('send_timeout', `600s`);
                this.conf.nginx.server.location[idx]._add('proxy_pass', `http://${config.service}`);
            }
        } catch (err) {
            console.log(err)
        }
    }

    removeUpStream(serviceId) {
        try {
            //Remove upstream
            let findService = false
            if (this.conf.nginx.upstream != undefined) {
                if (Array.isArray(this.conf.nginx.upstream)) {
                    this.conf.nginx.upstream.forEach((upstream, idx) => {
                        if (upstream._getString().indexOf(serviceId) != -1) {
                            this.conf.nginx._remove('upstream', idx)
                            findService = true
                        }
                    });
                } else {
                    if (this.conf.nginx.upstream._getString().indexOf(serviceId) != -1) {
                        this.conf.nginx._remove('upstream')
                        findService = true
                    }
                }
            }

            //Remove location
            if (this.conf.nginx.server.location != undefined) {
                if (Array.isArray(this.conf.nginx.server.location)) {
                    this.conf.nginx.server.location.forEach((location, idx) => {
                        if (location._getString().indexOf(serviceId) != -1) {
                            this.conf.nginx.server._remove('location', idx)
                        }
                    });
                } else {
                    if (this.conf.nginx.server.location._getString().indexOf(serviceId) != -1)
                        this.conf.nginx.server._remove('location')
                }
            }

            return findService
        } catch (err) {
            console.error(err)
        }
    }

    async reloadNginx() {
        return new Promise(async (resolve, reject) => {
            try {
                const service = await docker.getService(process.env.NGINX_SERVICE_ID)
                while (true) {
                    try {
                        const spec = await service.inspect()
                        const newSpec = spec.Spec
                        newSpec.version = parseInt(spec.Version.Index) // version number of the service object being updated. This is required to avoid conflicting writes
                        newSpec.TaskTemplate.ForceUpdate = parseInt(spec.Spec.TaskTemplate.ForceUpdate) + 1 // counter that forces an update even if no relevant parameters have been changed
                        const time = 0.5
                        await sleep(time * 1000)
                        await service.update(newSpec)
                        break
                    } catch (err) {
                        debug("Service nginx update stopped due to another update process! Retry...")
                    }
                }
                debug("Reload done")
                resolve()
            } catch (err) {
                debug(err)
                reject(err)
            }
        })
    }

    async reloadNginx_deprecated() {
        return new Promise(async (resolve, reject) => {
            try {
                const nginx = await docker.listContainers({
                    "filters": {
                        "name": [`/*${process.env.NGINX_SERVICE_ID}*`]
                        //"label":[`com.docker.swarm.service.name=${process.env.NGINX_SERVICE_ID}`]
                    }
                })
                if (nginx.length == 0) throw ('Service Nginx is not running!!!')
                const nginx_id = nginx[0].Names[0].replace('/', '')
                const container = await docker.getContainer(nginx_id)
                container.exec({
                    "AttachStdin": false,
                    "AttachStdout": true,
                    "AttachStderr": true,
                    "Cmd": ["bash", "-c", "nginx -s reload 2> /etc/nginx/conf.d/.status"]
                }, function (err, exec) {
                    if (err) reject(err)
                    exec.start(function (err, stream) {
                        if (err) reject(err)
                    })
                })
                resolve()
            } catch (err) {
                reject(err)
            }
        })
    }
}


module.exports = new Nginx()
