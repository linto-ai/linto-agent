// Copyright (C) 2019 LINAGORA
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

const debug = require('debug')('linto-client:ctl')
require('./config')
const ora = require('ora')

class App {
    constructor() {
        // This LinTO terminal
        this.terminal = require('./lib/terminal') // Specific enrolments for this specific terminal
        // Inits conversationData to void object, this is is the "context" transfered between client and server on "nlp/file/####"
        this.conversationData = {}
        // Load components 
        process.env.COMPONENTS.split(',').reduce((prev, component) => {
            return prev.then(async () => { await this.use(component) })
        }, Promise.resolve()).then(() => {
            // All components are now loaded.
            // Binding controllers on events sent by components
            require('./controller/logicmqttevents.js')(this)
            require('./controller/localmqttevents.js')(this)
            //require('./controller/lasvegas.js')(this)
        })
    }

    async use(component) {
        let spinner = ora(`Loading behaviors : ${component}`).start()
        try {
            const injectComponent = require(`./components/${component}`) //component dependency injections with inversion of control
            await new injectComponent(this) //shall allways RESOLVE a component injected version of this.
            spinner.succeed(`Loaded : ${component}`)
            return
        } catch (e) {
            spinner.fail(`Error in component invocation : ${component}`)
            console.error(debug.namespace, e)
            process.exit(1)
        }
    }
}

module.exports = new App()