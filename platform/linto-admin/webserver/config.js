/*
 * Copyright (c) 2017 Linagora.
 *
 * This file is part of Business-Logic-Server
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

const debug = require('debug')('linto-admin:config')
const dotenv = require('dotenv')
const fs = require('fs')

function ifHasNotThrow(element, error) {
    if (!element) throw error
    return element
}

function ifHas(element, defaultValue) {
    if (!element) return defaultValue
    return element
}

function configureDefaults() {
    try {

        dotenv.config()
        const envdefault = dotenv.parse(fs.readFileSync('.envdefault'))

        // Global
        process.env.NODE_ENV = ifHas(process.env.NODE_ENV, envdefault.NODE_ENV)
        process.env.TZ = ifHas(process.env.TZ, envdefault.TZ)

        // Webserver
        process.env.LINTO_STACK_ADMIN_HTTP_PORT = ifHas(process.env.LINTO_STACK_ADMIN_HTTP_PORT, envdefault.LINTO_STACK_ADMIN_HTTP_PORT)
        process.env.LINTO_STACK_DOMAIN = ifHas(process.env.LINTO_STACK_DOMAIN, envdefault.LINTO_STACK_DOMAIN)
        process.env.LINTO_STACK_ADMIN_API_WHITELIST_DOMAINS = ifHas(process.env.LINTO_STACK_ADMIN_API_WHITELIST_DOMAINS, envdefault.LINTO_STACK_ADMIN_API_WHITELIST_DOMAINS)
        process.env.LINTO_STACK_ADMIN_COOKIE_SECRET = ifHas(process.env.LINTO_STACK_ADMIN_COOKIE_SECRET, envdefault.LINTO_STACK_ADMIN_COOKIE_SECRET)
        process.env.LINTO_STACK_USE_SSL = ifHas(process.env.LINTO_STACK_USE_SSL, envdefault.LINTO_STACK_USE_SSL)

        // BLS
        process.env.LINTO_STACK_BLS_SERVICE = ifHas(process.env.LINTO_STACK_BLS_SERVICE, envdefault.LINTO_STACK_BLS_SERVICE)
        process.env.LINTO_STACK_BLS_USE_LOGIN = ifHas(process.env.LINTO_STACK_BLS_USE_LOGIN, envdefault.LINTO_STACK_BLS_USE_LOGIN)
        process.env.LINTO_STACK_BLS_USER = ifHas(process.env.LINTO_STACK_BLS_USER, envdefault.LINTO_STACK_BLS_USER)
        process.env.LINTO_STACK_BLS_PASSWORD = ifHas(process.env.LINTO_STACK_BLS_PASSWORD, envdefault.LINTO_STACK_BLS_PASSWORD)
        LINTO_STACK_BLS_SERVICE_UI_PATH = ifHas(process.env.LINTO_STACK_BLS_SERVICE_UI_PATH, envdefault.LINTO_STACK_BLS_SERVICE_UI_PATH)
        LINTO_STACK_BLS_SERVICE_API_PATH = '/red'

        // Mqtt
        process.env.LINTO_STACK_MQTT_HOST = ifHas(process.env.LINTO_STACK_MQTT_HOST, envdefault.LINTO_STACK_MQTT_HOST)
        process.env.LINTO_STACK_MQTT_PORT = ifHas(process.env.LINTO_STACK_MQTT_PORT, envdefault.LINTO_STACK_MQTT_PORT)
        process.env.LINTO_STACK_MQTT_USER = ifHas(process.env.LINTO_STACK_MQTT_USER, envdefault.LINTO_STACK_MQTT_USER)
        process.env.LINTO_STACK_MQTT_PASSWORD = ifHas(process.env.LINTO_STACK_MQTT_PASSWORD, envdefault.LINTO_STACK_MQTT_PASSWORD)
        process.env.LINTO_STACK_MQTT_USE_LOGIN = ifHas(process.env.LINTO_STACK_MQTT_USE_LOGIN, envdefault.LINTO_STACK_MQTT_USE_LOGIN)
        process.env.LINTO_STACK_MQTT_DEFAULT_HW_SCOPE = ifHas(process.env.LINTO_STACK_MQTT_DEFAULT_HW_SCOPE, envdefault.LINTO_STACK_MQTT_DEFAULT_HW_SCOPE)

        // Database (mongodb)
        process.env.LINTO_STACK_MONGODB_DBNAME = ifHas(process.env.LINTO_STACK_MONGODB_DBNAME, envdefault.LINTO_STACK_MONGODB_DBNAME)
        process.env.LINTO_STACK_MONGODB_SERVICE = ifHas(process.env.LINTO_STACK_MONGODB_SERVICE, envdefault.LINTO_STACK_MONGODB_SERVICE)
        process.env.LINTO_STACK_MONGODB_PORT = ifHas(process.env.LINTO_STACK_MONGODB_PORT, envdefault.LINTO_STACK_MONGODB_PORT)
        process.env.LINTO_STACK_MONGODB_USE_LOGIN = ifHas(process.env.LINTO_STACK_MONGODB_USE_LOGIN, envdefault.LINTO_STACK_MONGODB_USE_LOGIN)
        process.env.LINTO_STACK_MONGODB_USER = ifHas(process.env.LINTO_STACK_MONGODB_USER, envdefault.LINTO_STACK_MONGODB_USER)
        process.env.LINTO_STACK_MONGODB_PASSWORD = ifHas(process.env.LINTO_STACK_MONGODB_PASSWORD, envdefault.LINTO_STACK_MONGODB_PASSWORD)
        process.env.LINTO_STACK_MONGODB_TARGET_VERSION = ifHas(process.env.LINTO_STACK_MONGODB_TARGET_VERSION, envdefault.LINTO_STACK_MONGODB_TARGET_VERSION)

        // Redis
        process.env.LINTO_STACK_REDIS_SESSION_SERVICE_PORT = ifHas(process.env.LINTO_STACK_REDIS_SESSION_SERVICE_PORT, envdefault.LINTO_STACK_REDIS_SESSION_SERVICE_PORT)
        process.env.LINTO_STACK_REDIS_SESSION_SERVICE = ifHas(process.env.LINTO_STACK_REDIS_SESSION_SERVICE, envdefault.LINTO_STACK_REDIS_SESSION_SERVICE)

        // NLU - TOCK
        process.env.LINTO_STACK_TOCK_SERVICE = ifHas(process.env.LINTO_STACK_TOCK_SERVICE, envdefault.LINTO_STACK_TOCK_SERVICE)
        process.env.LINTO_STACK_TOCK_NLP_API = ifHas(process.env.LINTO_STACK_TOCK_NLP_API, envdefault.LINTO_STACK_TOCK_NLP_API)
        process.env.LINTO_STACK_TOCK_SERVICE_PORT = ifHas(process.env.LINTO_STACK_TOCK_SERVICE_PORT, envdefault.LINTO_STACK_TOCK_SERVICE_PORT)
        process.env.LINTO_STACK_TOCK_BASEHREF = ifHas(process.env.LINTO_STACK_TOCK_BASEHREF, envdefault.LINTO_STACK_TOCK_BASEHREF)
        process.env.LINTO_STACK_TOCK_BASEHREF = process.env.LINTO_STACK_TOCK_BASEHREF === 'undefined' ? '' : process.env.LINTO_STACK_TOCK_BASEHREF

        process.env.LINTO_STACK_TOCK_LOGIN = ifHas(process.env.LINTO_STACK_TOCK_LOGIN, envdefault.LINTO_STACK_TOCK_LOGIN)
        process.env.LINTO_STACK_TOCK_PASSWORD = ifHas(process.env.LINTO_STACK_TOCK_PASSWORD, envdefault.LINTO_STACK_TOCK_PASSWORD)

        // STT service-manager
        process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE = ifHas(process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE, envdefault.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE)
        process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE_LOGIN = ifHas(process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE_LOGIN, envdefault.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE_LOGIN)
        process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE_PASSWORD = ifHas(process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE_PASSWORD, envdefault.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE_PASSWORD)

    } catch (e) {
        console.error(debug.namespace, e)
        process.exit(1)
    }
}
module.exports = configureDefaults()