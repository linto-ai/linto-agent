const debug = require('debug')('linto-overwatch:overwatch:slotManager')
const jwtDecode = require('jwt-decode')

const SLOT_ALIVE_TIMEOUT = 1200000 // 20min

const MqttUsers = require(process.cwd() + '/lib/overwatch/mongodb/models/mqtt_users')

let slots = {}
let timesoutSlotManager = {}

let self = module.exports = {
  createSlotTimeout: sn => {
    timesoutSlotManager[sn] = setTimeout(function () {
      debug(`User slots ${sn} has been expired`)
      delete self.removeSlot(sn)
    }, SLOT_ALIVE_TIMEOUT)
  },
  refreshTimeout: sn => {
    debug(`User slots ${sn} has been refresh`)
    clearTimeout(timesoutSlotManager[sn])
    self.createSlotTimeout(sn)
  },
  get: () => slots,
  getSn: (sn) => {
    self.refreshTimeout(sn)
    return slots[sn]
  },
  getSnByToken: (sn, token) => {
    let decodedToken = jwtDecode(token.split('WebApplication')[1])
    if (decodedToken && decodedToken.data && decodedToken.data.sessionId === sn)
      return self.getSn(decodedToken.data.sessionId)
    return undefined
  },
  takeSlot: async (sn, data) => {
    await MqttUsers.insertMqttUsers({ username: sn, password: data.password })

    self.createSlotTimeout(sn)
    slots[sn] = data
    return data
  },
  takeSlotIfAvailable: (sn, app, originUrl) => {
    if (app.maxSlots > self.countSlotsApplication(app.applicationId)) {
      return self.takeSlot(sn, { originUrl, applicationId: app.applicationId, password: app.password })
    } else return undefined
  },
  countSlotsApplication: (appId) => {
    let count = 0
    Object.keys(slots).forEach(key => {
      if (slots[key].applicationId === appId) count++
    })
    return count
  },
  removeSlot: async (sn) => {
    if (slots[sn]) {
      await MqttUsers.deleteMqttUser(sn)
      clearTimeout(timesoutSlotManager[sn])
      delete slots[sn]
    }
  }
}
