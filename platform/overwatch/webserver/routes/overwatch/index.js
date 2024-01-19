/*
 * Copyright (c) 2018 Linagora.
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

'use strict'
const debug = require('debug')('linto-overwatch:webserver:overwatch')

module.exports = (webServer) => {
    return [
        {
            name: 'healthcheck',
            path: '/healthcheck',
            method: 'get',
            controller: async (req, res, next) => {
                res.sendStatus(200)
            }
        },
        {
            name: 'auths',
            path: '/auths',
            method: 'get',
            controller: async (req, res, next) => {
                let authMethods = []
                process.env.LINTO_STACK_OVERWATCH_AUTH_TYPE.split(',').map(auth => {
                    authMethods.push({type : auth, basePath : `/${auth}`})
                })
                res.status(200).json(authMethods)
            }
        }
    ]
}