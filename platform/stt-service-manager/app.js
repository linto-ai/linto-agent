const debug = require('debug')('app:main')
const ora = require('ora')

class App {
    constructor() {
        try {
            // Load env variables
            require('./config')
            // Check mongo driver
            //const MongoDriver = require(`${process.cwd()}/models/driver.js`)
            //if( ! (MongoDriver.constructor.db && MongoDriver.constructor.db.serverConfig.isConnected()) ) throw "Failed to connect to MongoDB server"
            // Auto-loads components based on process.env.COMPONENTS list
            this.components = {}
            this.db = {}
            process.env.COMPONENTS.split(',').reduce((prev, componentFolderName) => {
                return prev.then(async () => { await this.use(componentFolderName) })
            }, Promise.resolve()).then(() => {
                // Do some stuff after all components being loaded
                if (this.components['ClusterManager'] !== undefined) {
                    this.components['ClusterManager'].emit('verifServices')
                    this.components['ClusterManager'].emit('cleanServices')
                }
            })
        } catch (e) {
            console.error(debug.namespace, e)
        }
    }


    async use(componentFolderName) {
        let spinner = ora(`Registering component : ${componentFolderName} \n`).start()
        try {
            // Component dependency injections with inversion of control based on events emitted between components
            // Component is an async singleton - requiring it returns a reference to an instance
            //console.log(this)
            const component = await require(`${__dirname}/components/${componentFolderName}`)(this)
            this.components[component.id] = component // We register the instancied component reference in app.components object
            //console.log(component)
            spinner.succeed(`Registered component : ${component.id}`)
        } catch (e) {
            if (e.name == "COMPONENT_MISSING") {
                return spinner.warn(`Skipping ${componentFolderName} - this component depends on : ${e.missingComponents}`)
            }
            spinner.fail(`Error in component loading : ${componentFolderName}`)
            console.error(debug.namespace, e)
            process.exit(1)
        }
    }
}

module.exports = new App()