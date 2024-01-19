const MongoLogsCollection = require(process.cwd() + '/lib/overwatch/mongodb/models/logs')
const MongoLintoCollection = require(process.cwd() + '/lib/overwatch/mongodb/models/lintos')

const SlotsManager = require(process.cwd() + '/lib/overwatch/slotsManager/slotsManager')

module.exports = function (topic, payload) {
  const [_clientCode, _channel, _sn, _etat, _type, _id] = topic.split('/')
  const jsonPayload = JSON.parse(payload)

  if (_sn.indexOf(process.env.LINTO_STACK_OVERWATCH_WEB_TOPIC_KEY) !== -1) {  // Web client only
    if (jsonPayload.connexion === "offline") {
      SlotsManager.removeSlot(_sn)
    } else if (jsonPayload.connexion === "online" && SlotsManager.getSnByToken(_sn, jsonPayload.auth_token)) {
      console.log('User has taken a slot')
    }
  } else {  // Other client : Static or Android
    const lastModified = new Date(Date.now())
    const connexionStatus = jsonPayload.connexion

    if (process.env.LINTO_STACK_OVERWATCH_LOG_MONGODB === 'true') {
      MongoLogsCollection.insertLog({
        sn: _sn,
        status: connexionStatus,
        date: lastModified
      })
    }

    let dataLinto = {
      sn: _sn,
      connexion: connexionStatus,
    }
    connexionStatus === 'offline' ? dataLinto.last_down = lastModified : dataLinto.last_up = lastModified
    MongoLintoCollection.updateLinto(dataLinto)

  }

}