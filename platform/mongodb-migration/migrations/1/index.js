const MongoMigration = require(`../../model/migration.js`)
const schemas = {
    context: require('./schemas/context.json'),
    context_types: require('./schemas/context_types.json'),
    dbversion: require('./schemas/dbversion.json'),
    flow_pattern: require('./schemas/flow_pattern.json'),
    flow_pattern_tmp: require('./schemas/flow_pattern_tmp.json'),
    lintos: require('./schemas/lintos.json'),
    users: require('./schemas/users.json'),
    linto_users: require('./schemas/linto_users.json')
}

class Migrate extends MongoMigration {
    constructor() {
        super()
        this.version = 1
    }
    async migrateUp() {
        try {
            const collections = await this.listCollections()
            const collectionNames = []
            let migrationErrors = []
            collections.map(col => {
                collectionNames.push(col.name)
            })

            /*****************/
            /* CONTEXT_TYPES */
            /*****************/
            if (collectionNames.indexOf('context_types') >= 0) { // collection exist
                const contextTypes = await this.mongoRequest('context_types', {})
                if (contextTypes.length > 0) { // collection exist and not empty
                    const schemaValid = this.testSchema(contextTypes, schemas.context_types)
                    if (schemaValid.valid) { // schema is valid
                        const fleetVal = contextTypes.filter(ct => ct.name === 'Fleet')
                        if (fleetVal.length === 0) {
                            await this.mongoInsert('context_types', { name: 'Fleet' })
                        }

                        const applicationVal = contextTypes.filter(ct => ct.name === 'Application')
                        if (applicationVal.length === 0) {
                            await this.mongoInsert('context_types', { name: 'Application' })
                        }
                    } else { // schema is invalid
                        migrationErrors.push({
                            collectionName: 'context_types',
                            errors: schemaValid.errors
                        })
                    }
                } else { // collection exist but empty
                    const payload = [
                        { name: 'Fleet' },
                        { name: 'Application' }
                    ]
                    this.mongoInsertMany('context_types', payload)
                }
            } else { // collection does not exist
                const payload = [
                    { name: 'Fleet' },
                    { name: 'Application' }
                ]
                await this.mongoInsertMany('context_types', payload)
            }


            /********************/
            /* FLOW_PATTERN_TMP */
            /********************/
            if (collectionNames.indexOf('flow_pattern_tmp') >= 0) { // collection exist
                const flowPatternTmp = await this.mongoRequest('flow_pattern_tmp', {})
                if (flowPatternTmp.length > 0) { // collection exist and not empty
                    const schemaValid = this.testSchema(flowPatternTmp, schemas.flow_pattern_tmp)
                    if (schemaValid.valid) { // schema is valid
                        const neededVal = flowPatternTmp.filter(ct => ct.id === 'tmp')
                        if (neededVal.length === 0) {
                            const payload = {
                                id: "tmp",
                                flow: [],
                                workspaceId: ""
                            }
                            await this.mongoInsert('flow_pattern_tmp', payload)
                        }
                    } else { // Schema is invalid
                        // Add errors to migrationErrors array
                        migrationErrors.push({
                            collectionName: 'flow_pattern_tmp',
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
                    await this.mongoInsert('flow_pattern_tmp', payload)
                }
            } else { // collection does not exist
                const payload = {
                    id: "tmp",
                    flow: [],
                    workspaceId: ""
                }

                // Create collection and insert default data
                await this.mongoInsert('flow_pattern_tmp', payload)
            }

            /****************/
            /* FLOW_PATTERN */
            /****************/
            const flowPatternPayload = require('./json/linto-fleet-default-flow.json')
            if (collectionNames.indexOf('flow_pattern') >= 0) { // collection exist
                const flowPattern = await this.mongoRequest('flow_pattern', {})
                if (flowPattern.length > 0) { // collection exist and not empty
                    const schemaValid = this.testSchema(flowPattern, schemas.flow_pattern)
                    if (schemaValid.valid) { // schema is invalid
                        const neededVal = flowPattern.filter(ct => ct.name === 'linto-fleet-default')
                        if (neededVal.length === 0) { // required value doesn't exist
                            await this.mongoInsert('flow_pattern', flowPatternPayload)
                        }
                    } else { // schema is invalid
                        // Add errors to migrationErrors array
                        migrationErrors.push({
                            collectionName: 'flow_pattern',
                            errors: schemaValid.errors
                        })
                    }
                } else { //collection exist but empty
                    await this.mongoInsert('flow_pattern', flowPatternPayload)
                }
            } else { // collection doesn't exist
                await this.mongoInsert('flow_pattern', flowPatternPayload)
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

            /***********/
            /* CONTEXT */
            /***********/
            if (collectionNames.indexOf('context') >= 0) { // collection exist
                const context = await this.mongoRequest('context', {})

                if (context.length > 0) { // collection exist and not empty
                    const schemaValid = this.testSchema(context, schemas.context)

                    if (!schemaValid.valid) { // schema is invalid
                        // Add errors to migrationErrors array
                        migrationErrors.push({
                            collectionName: 'context',
                            errors: schemaValid.errors
                        })
                    }
                }
            }



            /**********/
            /* LINTOS */
            /**********/
            if (collectionNames.indexOf('lintos') >= 0) { // collection exist
                const lintos = await this.mongoRequest('lintos', {})

                if (lintos.length > 0) { // collection exist and not empty
                    const schemaValid = this.testSchema(lintos, schemas.lintos)

                    if (!schemaValid.valid) { // schema is invalid
                        // Add errors to migrationErrors array
                        migrationErrors.push({
                            collectionName: 'lintos',
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

                const schemaValid = this.testSchema(dbversion, schemas.dbversion)
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

            /*****************/
            /* ANDROID_USERS */
            /*****************/
            if (collectionNames.indexOf('linto_users') >= 0) { // collection exist
                const linto_users = await this.mongoRequest('linto_users', {})
                if (linto_users.length > 0) { // collection exist and not empty
                    const schemaValid = this.testSchema(linto_users, schemas.linto_users)
                    if (!schemaValid.valid) { // schema is invalid
                        // Add errors to migrationErrors array
                        migrationErrors.push({
                            collectionName: 'linto_users',
                            errors: schemaValid.errors
                        })
                    }
                }
            }

            // RETURN
            if (migrationErrors.length > 0) {
                throw migrationErrors
            } else {
                await this.mongoUpdate('dbversion', { id: 'current_version' }, { version: 1 })
                console.log(`> MongoDB migration to version "${this.version}": Success `)
                return true
            }
        } catch (error) {
            console.error(error)
            if (typeof (error) === 'object') {
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
        console.log('Miration to version 1. This is the lowest version you can migrate to')
        return true
    }
}

module.exports = new Migrate()