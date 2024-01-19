const debug = require('debug')(`app:clustermanager:dockerswarm`)
const Docker = require('dockerode');
const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET_PATH });
const sleep = require('util').promisify(setTimeout)

class DockerSwarm {
    constructor() {
        this.checkSwarm()
    }

    serviceOption(params) {
        return {
            "Name": params.serviceId,
            "Labels": {
                "com.docker.stack.image" : `${params.image}:${process.env.LINSTT_IMAGE_TAG}`,
                "com.docker.stack.namespace" : `${process.env.LINSTT_STACK_NAME}`
            },
            "TaskTemplate": {
                "ContainerSpec": {
                    "Image": `${params.image}:${process.env.LINSTT_IMAGE_TAG}`,
                    "Env": [
                        `PUCTUATION_HOST=${process.env.PUCTUATION_HOST}`,
                        `PUCTUATION_PORT=${process.env.PUCTUATION_PORT}`,
                        `PUCTUATION_ROUTE=${process.env.PUCTUATION_ROUTE}`,
                        `SPEAKER_DIARIZATION_HOST=${process.env.SPEAKER_DIARIZATION_HOST}`,
                        `SPEAKER_DIARIZATION_PORT=${process.env.SPEAKER_DIARIZATION_PORT}`
                    ],
                    "Mounts": [
                        {
                            "ReadOnly": false,
                            "Source": `${process.env.FILESYSTEM}/${process.env.LM_FOLDER_NAME}/${params.LModelId}`,
                            "Target": "/opt/models/LM",
                            "Type": "bind"
                        },
                        {
                            "ReadOnly": true,
                            "Source": `${process.env.FILESYSTEM}/${process.env.AM_FOLDER_NAME}/${params.AModelId}`,
                            "Target": "/opt/models/AM",
                            "Type": "bind"
                        }
                    ],
                    "DNSConfig": {}
                },
                "Networks": [
                    {
                        "Target": process.env.LINSTT_NETWORK
                    }
                ]
            },
            "Mode": {
                "Replicated": {
                    "Replicas": params.replicas
                }
            },
            "EndpointSpec": {
                "mode": "dnsrr"
            }
        }
    }

    checkSwarm() {
        docker.swarmInspect(function (err) {
            if (err) throw err
        })
    }

    async checkServiceOn(params) { //check if service is correctly started
        try {
            const time = 0.5 //in seconds
            let retries = process.env.CHECK_SERVICE_TIMEOUT / time
            let status = {}

            while (retries > 0) {
                await sleep(time * 1000)
                const service = await docker.listContainers({
                    "filters": { "label": [`com.docker.swarm.service.name=${params.serviceId}`] }
                })
                if (service.length == 0)
                    retries = retries - 1
                debug(service.length, params.replicas)
                if (service.length == params.replicas) {
                    status = 1
                    break
                } else if (retries === 0) {
                    status = 0
                    const serviceLog = await docker.getService(params.serviceId)
                    var logOpts = {
                        stdout: 1,
                        stderr: 1,
                        tail:100,
                        follow:0
                    };
                    serviceLog.logs(logOpts, (logs, err)=>{
                        console.log(err)
                    })
                    break
                }
            }
            return status
        } catch (err) {
            debug(err)
            return 0
        }
    }

    async checkServiceOff(serviceId) { //check if service is correctly stopped
        try {
            const time = 0.5 //in seconds
            while (true) {
                await sleep(time * 1000)
                const service = await docker.listContainers({
                    "filters": { "label": [`com.docker.swarm.service.name=${serviceId}`] }
                })
                debug(service.length)
                if (service.length === 0) break
            }
            return 1
        } catch (err) {
            debug(err)
            return -1
        }
    }

    async listDockerServices() {
        return new Promise((resolve, reject) => {
            try {
                docker.listServices(function (err, services) {
                    if (err) reject(err)
                    resolve(services)
                })
            } catch (err) {
                reject(err)
            }
        })
    }

    startService(params) {
        return new Promise((resolve, reject) => {
            try {
                switch (params.tag) {
                    case 'offline': params["image"] = process.env.LINSTT_OFFLINE_IMAGE; break
                    case 'online': params["image"] = process.env.LINSTT_STREAMING_IMAGE; break
                    default: throw 'Undefined service tag'
                }
                const options = this.serviceOption(params)
                docker.createService(options, function (err) {
                    if (err) reject(err)
                    resolve()
                })
            } catch (err) {
                reject(err)
            }
        })
    }

    async updateService(serviceId,replicas=null) {
        return new Promise(async (resolve, reject) => {
            try {
                const service = await docker.getService(serviceId)
                const spec = await service.inspect()
                const newSpec = spec.Spec
                newSpec.version = parseInt(spec.Version.Index) // version number of the service object being updated. This is required to avoid conflicting writes
                newSpec.TaskTemplate.ForceUpdate = parseInt(spec.Spec.TaskTemplate.ForceUpdate) + 1 // counter that forces an update even if no relevant parameters have been changed
                if (replicas != null)
                    newSpec.Mode.Replicated.Replicas = replicas
                await service.update(newSpec)
                resolve()
            } catch (err) {
                debug(err)
                reject(err)
            }
        })
    }

    async stopService(serviceId) {
        return new Promise(async (resolve, reject) => {
            try {
                const service = await docker.getService(serviceId)
                await service.remove()
                resolve()
            } catch (err) {
                reject(err)
            }
        })
    }

    getServiceInfo(serviceId) {
        return docker.getService(serviceId)
    }

    async serviceIsOn(serviceId) {
        try {
            const info = await docker.listContainers({
                "filters": { "label": [`com.docker.swarm.service.name=${serviceId}`] }
            })
            return info.length
        } catch (err) {
            debug(err)
            return 0
        }
    }

}

module.exports = new DockerSwarm()