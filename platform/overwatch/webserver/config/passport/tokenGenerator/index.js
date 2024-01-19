const jwt = require('jsonwebtoken')

const TOKEN_DAYS_TIME = 10
const REFRESH_TOKEN_DAYS_TIME = 20

const ANDROID_TOKEN = 'Android'
const WEB_TOKEN = 'WebApplication'

module.exports = function (tokenData, type) {
  let expiration_time_days = 60
  const authSecret = tokenData.salt + type

  if (type === WEB_TOKEN) expiration_time_days = 1
  else delete tokenData.salt

  return {
    _id: tokenData._id,
    token: generateJWT(tokenData, authSecret, expiration_time_days, type)
  }
}

function generateJWT(data, authSecret, days = 10, type) {
  const today = new Date()
  const expirationDate = new Date(today)
  expirationDate.setDate(today.getDate() + days)

  let auth_token = jwt.sign({
    data,
    exp: parseInt(expirationDate.getTime() / 1000, TOKEN_DAYS_TIME),
  }, authSecret + process.env.LINTO_STACK_OVERWATCH_JWT_SECRET)

  if (type === ANDROID_TOKEN) {
    return {
      auth_token: auth_token,
      refresh_token: jwt.sign({
        data,
        exp: parseInt(expirationDate.getTime() / 1000, REFRESH_TOKEN_DAYS_TIME),
      }, authSecret + process.env.LINTO_STACK_OVERWATCH_REFRESH_SECRET + process.env.LINTO_STACK_OVERWATCH_JWT_SECRET),

      expiration_date: parseInt(expirationDate.getTime() / 1000, 10),
      session_id: data.sessionId
    }
  } else {
    return {
      auth_token: auth_token,
      topic: data.topic,
      session_id: data.sessionId
    }
  }
}
