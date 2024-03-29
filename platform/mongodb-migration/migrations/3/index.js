const MongoMigration = require(`../../model/migration.js`)
const schemas = {
    clientsStatic: require('./schemas/clients_static.json'),
    dbVersion: require('./schemas/db_version.json'),
    flowTmp: require('./schemas/flow_tmp.json'),
    users: require('./schemas/users.json'),
    workflowsStatic: require('./schemas/workflows_static.json'),
    workflowsApplication: require('./schemas/workflows_application.json'),
    mqtt_acls: require('./schemas/mqtt_acls.json'),
    mqtt_users: require('./schemas/mqtt_users.json'),
    androidUsers: require('./schemas/android_users.json'),
    webappHosts: require('./schemas/webapp_hosts.json'),
    localSkills: require('./schemas/local_skills.json'),
}

class Migrate extends MongoMigration {
    constructor() {
        super()
        this.version = 3
    }
    async migrateUp() {
        try {
            const collections = await this.listCollections()
            const collectionNames = []
            let migrationErrors = []
            collections.map(col => {
                collectionNames.push(col.name)
            })


            /************/
            /* FLOW_TMP */
            /************/
            if (collectionNames.indexOf('flow_tmp') >= 0) { // collection exist
                const flowTmp = await this.mongoRequest('flow_tmp', {})
                if (flowTmp.length > 0) { // collection exist and not empty
                    const schemaValid = this.testSchema(flowTmp, schemas.flowTmp)
                    if (schemaValid.valid) { // schema is valid
                        const neededVal = flowTmp.filter(ct => ct.id === 'tmp')
                        if (neededVal.length === 0) {
                            const payload = {
                                id: "tmp",
                                flow: [],
                                workspaceId: ""
                            }
                            await this.mongoInsert('flow_tmp', payload)
                        }
                    } else { // Schema is invalid
                        // Add errors to migrationErrors array
                        migrationErrors.push({
                            collectionName: 'flow_tmp',
                            errors: schemaValid.errors
                        })
                    }
                } else { // collection exist but empty
                    const payload = {
                        id: "tmp",
                        flow: [],
                        workspaceId: ""
                    }

                    // Insert default data
                    await this.mongoInsert('flow_tmp', payload)
                }
            } else { // collection does not exist
                const payload = {
                    id: "tmp",
                    flow: [],
                    workspaceId: ""
                }

                // Create collection and insert default data
                await this.mongoInsert('flow_tmp', payload)
            }

            /*********/
            /* USERS */
            /*********/
            if (collectionNames.indexOf('users') >= 0) { // collection exist
                const users = await this.mongoRequest('users', {})
                if (users.length > 0) { // collection exist and not empty
                    const schemaValid = this.testSchema(users, schemas.users)
                    if (!schemaValid.valid) { // schema is invalid
                        // Add errors to migrationErrors array
                        migrationErrors.push({
                            collectionName: 'users',
                            errors: schemaValid.errors
                        })
                    }
                }
            }

            /******************/
            /* CLIENTS_STATIC */
            /******************/
            if (collectionNames.indexOf('clients_static') >= 0) { // collection exist
                const clientsStatic = await this.mongoRequest('clients_static', {})

                if (clientsStatic.length > 0) { // collection exist and not empty
                    const schemaValid = this.testSchema(clientsStatic, schemas.clientsStatic)

                    if (!schemaValid.valid) { // schema is invalid
                        // Add errors to migrationErrors array
                        migrationErrors.push({
                            collectionName: 'clients_static',
                            errors: schemaValid.errors
                        })
                    }
                }
            }

            /********************/
            /* WORKFLOWS_STATIC */
            /********************/
            if (collectionNames.indexOf('workflows_static') >= 0) { // collection exist
                const workflowsStatic = await this.mongoRequest('workflows_static', {})
                if (workflowsStatic.length > 0) { // collection exist and not empty
                    const schemaValid = this.testSchema(workflowsStatic, schemas.workflowsStatic)

                    if (!schemaValid.valid) { // schema is invalid
                        // Add errors to migrationErrors array
                        migrationErrors.push({
                            collectionName: 'workflows_static',
                            errors: schemaValid.errors
                        })
                    }
                }
            }

            /*************************/
            /* WORKFLOWS_APPLICATION */
            /*************************/
            if (collectionNames.indexOf('workflows_application') >= 0) { // collection exist
                const workflowsApplication = await this.mongoRequest('workflows_application', {})
                if (workflowsApplication.length > 0) { // collection exist and not empty
                    const schemaValid = this.testSchema(workflowsApplication, schemas.workflowsApplication)
                    if (!schemaValid.valid) { // schema is invalid
                        // Add errors to migrationErrors array
                        migrationErrors.push({
                            collectionName: 'workflows_application',
                            errors: schemaValid.errors
                        })
                    }
                }
            }

            /******************/
            /* ANDROID_USERS */
            /*****************/
            if (collectionNames.indexOf('android_users') >= 0) { // collection exist
                const androidUsers = await this.mongoRequest('android_users', {})
                if (androidUsers.length > 0) { // collection exist and not empty
                    const schemaValid = this.testSchema(androidUsers, schemas.androidUsers)

                    if (!schemaValid.valid) { // schema is invalid
                        // Add errors to migrationErrors array
                        migrationErrors.push({
                            collectionName: 'android_users',
                            errors: schemaValid.errors
                        })
                    }
                }
            }

            /****************/
            /* WEBAPP_HOSTS */
            /***************/
            if (collectionNames.indexOf('webapp_hosts') >= 0) { // collection exist
                const webappHosts = await this.mongoRequest('webapp_hosts', {})
                if (webappHosts.length > 0) { // collection exist and not empty
                    const schemaValid = this.testSchema(webappHosts, schemas.webappHosts)

                    if (!schemaValid.valid) { // schema is invalid
                        // Add errors to migrationErrors array
                        migrationErrors.push({
                            collectionName: 'webapp_hosts',
                            errors: schemaValid.errors
                        })
                    }
                }
            }

            /*****************/
            /* LOCAL_SKILLS */
            /****************/
            if (collectionNames.indexOf('local_skills') >= 0) { // collection exist
                const localSkills = await this.mongoRequest('local_skills', {})
                if (localSkills.length > 0) { // collection exist and not empty
                    const schemaValid = this.testSchema(localSkills, schemas.localSkills)

                    if (!schemaValid.valid) { // schema is invalid
                        // Add errors to migrationErrors array
                        migrationErrors.push({
                            collectionName: 'local_skills',
                            errors: schemaValid.errors
                        })
                    }
                }
            }

            /*************/
            /* DBVERSION */
            /*************/
            if (collectionNames.indexOf('dbversion') >= 0) { // collection exist
                const dbversion = await this.mongoRequest('dbversion', {})
                const schemaValid = this.testSchema(dbversion, schemas.dbVersion)
                if (schemaValid.valid) { // schema valid
                    await this.mongoUpdate('dbversion', { id: 'current_version' }, { version: this.version })
                } else { // schema is invalid
                    migrationErrors.push({
                        collectionName: 'dbversion',
                        errors: schemaValid.errors
                    })
                }
            } else { // collection doesn't exist
                await this.mongoInsert('dbversion', {
                    id: 'current_version',
                    version: this.version
                })
            }


            /************************/
            /* MQTT AUTH COLLECTION */
            /************************/
            // Allways remove mqtt_user at the start
            if (collectionNames.indexOf('mqtt_users') >= 0) await this.mongoDrop('mqtt_users')

            if (collectionNames.indexOf('mqtt_users') >= 0) { // collection exist
                const mqtt_users = await this.mongoRequest('mqtt_users', {})
                if (mqtt_users.length > 0) { // collection exist and not empty
                    const schemaValid = this.testSchema(mqtt_users, schemas.mqtt_users)
                    if (!schemaValid.valid) { // schema is invalid
                        // Add errors to migrationErrors array
                        migrationErrors.push({
                            collectionName: 'mqtt_users',
                            errors: schemaValid.errors
                        })
                    }
                }
            }

            if (collectionNames.indexOf('mqtt_acls') >= 0) { // collection exist
                const mqtt_acls = await this.mongoRequest('mqtt_acls', {})
                if (mqtt_acls.length > 0) { // collection exist and not empty
                    const schemaValid = this.testSchema(mqtt_acls, schemas.mqtt_acls)
                    if (!schemaValid.valid) { // schema is invalid
                        // Add errors to migrationErrors array
                        migrationErrors.push({
                            collectionName: 'mqtt_acls',
                            errors: schemaValid.errors
                        })
                    }
                }
            } else {
                await this.mongoInsert('mqtt_acls', { topic: '+/tolinto/%u/#', acc: 3 })
                await this.mongoInsert('mqtt_acls', { topic: '+/fromlinto/%u/#', acc: 3 })
            }


            /**************************/
            /* REMOVE OLD COLLECTIONS */
            /**************************/
            // Remove if collection exist
            if (collectionNames.indexOf('workflows_templates') >= 0) await this.mongoDrop('workflows_templates')
            console.log('collectionNames', collectionNames)


            // RETURN
            if (migrationErrors.length > 0) {
                throw migrationErrors
            } else {
                await this.mongoUpdate('dbversion', { id: 'current_version' }, { version: this.version })
                console.log(`> MongoDB migration to version "${this.version}": Success `)
                return true
            }
        } catch (error) {
            console.error(error)
            if (typeof(error) === 'object' && error.length > 0) {
                console.error('======== Migration ERROR ========')
                error.map(err => {
                    if (!!err.collectionName && !!err.errors) {
                        console.error('> Collection: ', err.collectionName)
                        err.errors.map(e => {
                            console.error('Error: ', e)
                        })
                    }
                })
                console.error('=================================')
            }
            return error
        }
    }
    async migrateDown() {

        try {
            const collections = await this.listCollections()
            const collectionNames = []
            collections.map(col => {
                collectionNames.push(col.name)
            })

            return true
        } catch (error) {
            console.error(error)
            return false
        }

    }
}

module.exports = new Migrate()