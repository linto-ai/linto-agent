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

require('dotenv').config()
const debug = require('debug')('linto-overwatch:config')
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
		const envdefault = dotenv.parse(fs.readFileSync('.envdefault'))

		process.env.LINTO_STACK_DOMAIN = ifHas(process.env.LINTO_STACK_DOMAIN, envdefault.LINTO_STACK_DOMAIN)
		process.env.LINTO_STACK_OVERWATCH_BASE_PATH = ifHas(process.env.LINTO_STACK_OVERWATCH_BASE_PATH, envdefault.LINTO_STACK_OVERWATCH_BASE_PATH)

		//MQTT Configuration

		process.env.LINTO_STACK_MQTT_HOST = ifHas(process.env.LINTO_STACK_MQTT_HOST, envdefault.LINTO_STACK_MQTT_HOST)
		process.env.LINTO_STACK_MQTT_PORT = ifHas(process.env.LINTO_STACK_MQTT_PORT, envdefault.LINTO_STACK_MQTT_PORT)
		process.env.LINTO_STACK_MQTT_KEEP_ALIVE = ifHas(process.env.LINTO_STACK_MQTT_KEEP_ALIVE, envdefault.LINTO_STACK_MQTT_KEEP_ALIVE)

		if (process.env.LINTO_STACK_DOMAIN === 'undefined')
			process.env.LINTO_STACK_DOMAIN = process.env.LINTO_STACK_MQTT_HOST

		process.env.LINTO_STACK_MQTT_USE_LOGIN = ifHas(process.env.LINTO_STACK_MQTT_USE_LOGIN, envdefault.LINTO_STACK_MQTT_USE_LOGIN)
		if (process.env.LINTO_STACK_MQTT_USE_LOGIN === 'true') {
			process.env.LINTO_STACK_MQTT_USER = ifHas(process.env.LINTO_STACK_MQTT_USER, envdefault.LINTO_STACK_MQTT_USER)
			process.env.LINTO_STACK_MQTT_PASSWORD = ifHas(process.env.LINTO_STACK_MQTT_PASSWORD, envdefault.LINTO_STACK_MQTT_PASSWORD)
		}

		//MQTT WS configuration
		process.env.LINTO_STACK_WSS = ifHas(process.env.LINTO_STACK_WSS, envdefault.LINTO_STACK_WSS)
		process.env.LINTO_STACK_MQTT_OVER_WS = ifHas(process.env.LINTO_STACK_MQTT_OVER_WS, envdefault.LINTO_STACK_MQTT_OVER_WS)
		process.env.LINTO_STACK_MQTT_OVER_WS_ENDPOINT = ifHas(process.env.LINTO_STACK_MQTT_OVER_WS_ENDPOINT, envdefault.LINTO_STACK_MQTT_OVER_WS_ENDPOINT)

		process.env.LINTO_STACK_OVERWATCH_DEVICE_TOPIC_KEY = ifHas(process.env.LINTO_STACK_OVERWATCH_DEVICE_TOPIC_KEY, envdefault.LINTO_STACK_OVERWATCH_DEVICE_TOPIC_KEY)
		process.env.LINTO_STACK_OVERWATCH_WEB_TOPIC_KEY = ifHas(process.env.LINTO_STACK_OVERWATCH_WEB_TOPIC_KEY, envdefault.LINTO_STACK_OVERWATCH_WEB_TOPIC_KEY)

		//Mongo Configuration
		process.env.LINTO_STACK_MONGODB_SERVICE = ifHas(process.env.LINTO_STACK_MONGODB_SERVICE, envdefault.LINTO_STACK_MONGODB_SERVICE)
		process.env.LINTO_STACK_MONGODB_PORT = ifHas(process.env.LINTO_STACK_MONGODB_PORT, envdefault.LINTO_STACK_MONGODB_PORT)
		process.env.LINTO_STACK_MONGODB_DBNAME = ifHas(process.env.LINTO_STACK_MONGODB_DBNAME, envdefault.LINTO_STACK_MONGODB_DBNAME)

		//Mongo collection
		process.env.LINTO_STACK_MONGODB_COLLECTION_LINTOS = ifHas(process.env.LINTO_STACK_MONGODB_COLLECTION_LINTOS, envdefault.LINTO_STACK_MONGODB_COLLECTION_LINTOS)
		process.env.LINTO_STACK_MONGODB_COLLECTION_LOG = ifHas(process.env.LINTO_STACK_MONGODB_COLLECTION_LOG, envdefault.LINTO_STACK_MONGODB_COLLECTION_LOG)
		process.env.LINTO_STACK_MONGODB_COLLECTION_ANDROID_USER = ifHas(process.env.LINTO_STACK_MONGODB_COLLECTION_ANDROID_USER, envdefault.LINTO_STACK_MONGODB_COLLECTION_ANDROID_USER)

		process.env.LINTO_STACK_MONGODB_USE_LOGIN = ifHas(process.env.LINTO_STACK_MONGODB_USE_LOGIN, envdefault.LINTO_STACK_MONGODB_USE_LOGIN)
		if (process.env.LINTO_STACK_MONGODB_USE_LOGIN === 'true') {
			process.env.LINTO_STACK_MONGODB_USER = ifHas(process.env.LINTO_STACK_MONGODB_USER, envdefault.LINTO_STACK_MONGODB_USER)
			process.env.LINTO_STACK_MONGODB_PASSWORD = ifHas(process.env.LINTO_STACK_MONGODB_PASSWORD, envdefault.LINTO_STACK_MONGODB_PASSWORD)
		}

		process.env.LINTO_STACK_OVERWATCH_LOG_MONGODB = ifHas(process.env.LINTO_STACK_OVERWATCH_LOG_MONGODB, envdefault.LINTO_STACK_OVERWATCH_LOG_MONGODB)
		process.env.LINTO_STACK_OVERWATCH_HTTP_PORT = ifHas(process.env.LINTO_STACK_OVERWATCH_HTTP_PORT, 80)
		process.env.LINTO_STACK_OVERWATCH_AUTH_TYPE = ifHas(process.env.LINTO_STACK_OVERWATCH_AUTH_TYPE, envdefault.LINTO_STACK_OVERWATCH_AUTH_TYPE)

		process.env.LINTO_STACK_OVERWATCH_AUTH_TYPE.split(',').map(auth => {
			//TODO: Check if particular auth settings
			if (auth === 'ldap') {
				process.env.LINTO_STACK_OVERWATCH_AUTH_LDAP_SERVER_URL = ifHas(process.env.LINTO_STACK_OVERWATCH_AUTH_LDAP_SERVER_URL, envdefault.LINTO_STACK_OVERWATCH_AUTH_LDAP_SERVER_URL)
				process.env.LINTO_STACK_OVERWATCH_AUTH_LDAP_SERVER_SEARCH_BASE = ifHas(process.env.LINTO_STACK_OVERWATCH_AUTH_LDAP_SERVER_SEARCH_BASE, envdefault.LINTO_STACK_OVERWATCH_AUTH_LDAP_SERVER_SEARCH_BASE)
				process.env.LINTO_STACK_OVERWATCH_AUTH_LDAP_SERVER_SEARCH_FILTER = ifHas(process.env.LINTO_STACK_OVERWATCH_AUTH_LDAP_SERVER_SEARCH_FILTER, envdefault.LINTO_STACK_OVERWATCH_AUTH_LDAP_SERVER_SEARCH_FILTER)
			}
			if (auth === 'local') {
				process.env.LINTO_STACK_OVERWATCH_JWT_SECRET = ifHas(process.env.LINTO_STACK_OVERWATCH_JWT_SECRET, envdefault.LINTO_STACK_OVERWATCH_JWT_SECRET)
				process.env.LINTO_STACK_OVERWATCH_REFRESH_SECRET = ifHas(process.env.LINTO_STACK_OVERWATCH_REFRESH_SECRET, envdefault.LINTO_STACK_OVERWATCH_REFRESH_SECRET)
			}
		})

	} catch (e) {
		console.error(e)
		process.exit(1)
	}
}
module.exports = configureDefaults()