/**
 * Events from app.logicmqtt
 */
const debug = require('debug')(`linto-client:lasvegas:events`)
//Shell execution
const child_process = require('child_process')
const exec = child_process.exec

function lasVegas(app) {
    if (!app.localmqtt || !app.logicmqtt) return

    app.logicmqtt.on("logicmqtt::message", async (payload) => {
        debug("Received %O", payload)
        let runningVideo = false
        if (!!payload.topicArray && payload.topicArray[3] === "demo_mode") {
            if (payload.value === "start") {
                let cmd = `export DISPLAY=:0 && cvlc --loop --no-osd --aspect-ratio 15:9 -f /home/pi/demo.mp4`
                runningVideo = exec(cmd, function (err, stdout, stderr) {
                    debug(err, stdout, stderr)
                })
                debug(runningVideo)
            }
            if (payload.value === "stop") {
                let cmd = "sudo killall vlc"
                debug(cmd)
                let proc = exec(cmd, function (err, stdout, stderr) { })
            }
        }
    })

}

module.exports = lasVegas