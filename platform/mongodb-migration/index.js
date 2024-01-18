require('./config.js')
const MongoDriver = require('./model/driver')
const migration = require(`./migrations/${process.env.LINTO_STACK_MONGODB_TARGET_VERSION}/index.js`)
const path = './migrations/';
const fs = require('fs');

function migrate() {
    return new Promise((resolve, reject) => {
        try {
            setTimeout(async() => {
                // Check if MongoDriver is connected
                if (!MongoDriver.constructor.checkConnection()) {
                    console.log('MongoDb migrate : Not connected')
                } else {
                    const getCurrentVersion = await migration.getCurrentVersion()
                    if (getCurrentVersion.length > 0 && !!getCurrentVersion[0].version) {
                        const currentVersion = getCurrentVersion[0].version
                        const versions = parseFolders()
                        const indexStart = versions.indexOf(currentVersion.toString())
                        const indexEnd = versions.indexOf(process.env.LINTO_STACK_MONGODB_TARGET_VERSION.toString())

                        if (parseInt(currentVersion) > parseInt(process.env.LINTO_STACK_MONGODB_TARGET_VERSION)) { // MIGRATE DOWN
                            try {
                                console.log('> MIGRATE DOWN')
                                for (let iteration of generatorMigrateDown(versions, indexStart, indexEnd)) {
                                    const res = await iteration
                                    if (res !== true) {
                                        reject(res)
                                    }
                                }
                            } catch (error) {
                                reject(error)
                            }
                        } else if (parseInt(currentVersion) <= parseInt(process.env.LINTO_STACK_MONGODB_TARGET_VERSION)) { // MIGRATE UP
                            try {
                                if (parseInt(currentVersion) < parseInt(process.env.LINTO_STACK_MONGODB_TARGET_VERSION)) {
                                    console.log('> MIGRATE UP')
                                } else if (parseInt(currentVersion) === parseInt(process.env.LINTO_STACK_MONGODB_TARGET_VERSION)) {
                                    console.log('> MIGRATE control current version')
                                }
                                for (let iteration of generatorMigrateUp(versions, indexStart, indexEnd)) {
                                    const res = await iteration
                                    if (res !== true) {
                                        reject(res)
                                    }
                                }
                                process.exit(0)
                            } catch (error) {
                                reject(error)
                            }
                        }
                    } else { // If database version is not found, execute Version 1 mongoUP
                        const initDb = require(`./migrations/1/index.js`)
                        const mig = await initDb.migrateUp()
                        if (mig === true) {
                            migrate()
                        }
                    }

                }
            }, 500)
        } catch (error) {
            reject(error)
            process.exit(1)
        }
    })
}

// Generator function to chain promises
function* generatorMigrateUp(versions, indexStart, indexEnd) {
    for (let i = indexStart; i <= indexEnd; i++) {
        yield(new Promise(async(resolve, reject) => {
            try {
                console.log('> Migrate up to version :', versions[i])
                const migrationFile = require(`./migrations/${versions[i]}/index.js`)
                const mig = await migrationFile.migrateUp()
                if (mig === true) {
                    resolve(mig)
                } else {
                    reject(mig)
                }
            } catch (err) {
                console.error(err)
                reject(err)
            }
        }))
    }
}

function* generatorMigrateDown(versions, indexStart, indexEnd) {
    // Execute migrate down for each version that are higher than the wanted one
    for (let i = indexStart; i > indexEnd; i--) {
        yield(new Promise(async(resolve, reject) => {
            try {
                console.log('> Migrate down to version :', versions[i])
                const migrationFile = require(`./migrations/${versions[i]}/index.js`)
                const mig = await migrationFile.migrateDown()
                if (mig === true) {
                    resolve(mig)
                } else {
                    reject(mig)
                }
            } catch (err) {
                console.error(err)
                reject(err)
            }
        }))
    }
    // Execute migrate up for the wanted version.
    const wantedVersion = require(`./migrations/${versions[indexEnd]}/index.js`)
    yield(new Promise(async(resolve, reject) => {
        try {
            console.log('> Migrate down to version :', versions[indexEnd])
            let migup = await wantedVersion.migrateUp()
            if (migup === true) {
                resolve(migup)
            } else {
                reject(migup)
            }
        } catch (error) {
            console.error(err)
            reject(err)
        }
    }))
}

function parseFolders() {
    try {
        return fs.readdirSync(path).filter(function(file) {
            return fs.statSync(path + '/' + file).isDirectory();
        })
    } catch (error) {
        return error
    }
}


migrate()