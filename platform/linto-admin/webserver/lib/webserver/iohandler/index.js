const debug = require('debug')('linto-admin:ioevents')
const EventEmitter = require('eventemitter3')

class IoHandler extends EventEmitter {
    constructor(webServer) {
        super()
        this.webServer = webServer

        //Adds socket.io
        webServer.io = require('socket.io').listen(webServer.httpServer)

        //http AND io uses same session middleware
        webServer.io.use((socket, next) => {
            if (socket) {
                webServer.session(socket.request, socket.request.res, next)
            }
        })
        webServer.io.on('connection', (socket) => {
            debug(webServer.io)

            //Secures websocket usage with session
            if (process.env.NODE_ENV !== 'production') {
                socket.request.session.logged = 'on'
                socket.request.session.save()
            }
            if (!socket.request.session || socket.request.session.logged != 'on') return socket.disconnect()
            debug('new Socket connected')

            socket.on('linto_subscribe', (data) => {
                this.emit('linto_subscribe', data)
            })
            socket.on('linto_subscribe_all', (data) => {
                this.emit('linto_subscribe_all', data)
            })
            socket.on('linto_unsubscribe_all', (data) => {
                this.emit('linto_unsubscribe_all', data)
            })
            socket.on('tolinto_ping', (data) => {
                this.emit('linto_ping', data)
            })
            socket.on('tolinto_say', (data) => {
                this.emit('linto_say', data)
            })
            socket.on('tolinto_volume', (data) => {
                this.emit('linto_volume', data)
            })
            socket.on('tolinto_volume_end', (data) => {
                this.emit('linto_volume_end', data)
            })
            socket.on('tolinto_mute', (data) => {
                this.emit('linto_mute', data)
            })
            socket.on('tolinto_unmute', (data) => {
                this.emit('linto_unmute', data)
            })
        })
    }

    //broadcasts to connected sockets
    notify(msgType, payload) {
        this.webServer.io.emit('linto_' + msgType, payload)
    }
}

module.exports = IoHandler