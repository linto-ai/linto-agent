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
const debug = require('debug')('linto-admin:routes')

module.exports = (webServer) => {
    return {
        "/setup": require('./setup')(webServer),
        "/login": require('./login')(webServer),
        "/logout": require('./logout')(webServer),
        "/admin": require('./admin')(webServer),
        "/healthcheck": require('./healthcheck')(webServer),
        "/api": require('./api')(webServer),
        "/api/swagger": require('./api/swagger')(webServer),
        "/api/clients/static": require('./api/clients/static')(webServer),
        "/api/workflows": require('./api/workflows')(webServer),
        "/api/workflows/application": require('./api/workflows/application')(webServer),
        "/api/workflows/static": require('./api/workflows/static')(webServer),
        // Android users
        "/api/androidusers": require('./api/androidusers')(webServer),
        // Webapp hosts
        "/api/webapphosts": require('./api/webapphosts')(webServer),
        // Flow
        "/api/flow": require('./api/flow')(webServer),
        "/api/flow/tmp": require('./api/flow/tmp')(webServer),
        "/api/flow/node": require('./api/flow/node')(webServer),
        "/api/tock": require('./api/tock')(webServer),
        "/api/stt": require('./api/stt')(webServer),
        "/api/localskills": require('./api/localskills')(webServer),
        "/": require('./_root')(webServer)
    }
}