const debug = require('debug')('linto-overwatch:webserver:config:auth:local')

require('../passport/local')
const passport = require('passport')
const jwt = require('express-jwt')

const UsersAndroid = require(process.cwd() + '/lib/overwatch/mongodb/models/android_users')
const SlotsManager = require(process.cwd() + '/lib/overwatch/slotsManager/slotsManager')

const { UnreservedSlot, MalformedToken } = require('../error/exception/auth')

const refreshToken = require('./refresh')

module.exports = {
  authType: 'local',
  authenticate_android: passport.authenticate('local-android', { session: false }),
  authenticate_web: passport.authenticate('local-web', { session: false }),
  isAuthenticate: [
    jwt({
      secret: generateSecretFromHeaders,
      userProperty: 'payload',
      getToken: getTokenFromHeaders,
    }),
    (req, res, next) => {
      next()
    }
  ],
  refresh_android: [
    jwt({
      secret: generateRefreshSecretFromHeaders,
      userProperty: 'payload',
      getToken: getTokenFromHeaders,
    }),
    async (req, res, next) => {
      const { headers: { authorization } } = req
      let token = await refreshToken(authorization)
      res.local = token
      next()
    }
  ]
}

function getTokenFromHeaders(req, res, next) {
  const { headers: { authorization } } = req
  if (authorization && authorization.split(' ')[0] === 'Android') return authorization.split(' ')[1]
  else if (authorization && authorization.split(' ')[0] === 'WebApplication') return authorization.split(' ')[1]
  else return null
}

function generateSecretFromHeaders(req, payload, done) {
  if (!payload || !payload.data) {
    done(new MalformedToken())
  } else {
    const { headers: { authorization } } = req
    if (authorization.split(' ')[0] === 'Android') {
      UsersAndroid.findOne({ email: payload.data.email })
        .then(user => done(null, user.keyToken + authorization.split(' ')[0] + process.env.LINTO_STACK_OVERWATCH_JWT_SECRET))
    } else if (authorization.split(' ')[0] === 'WebApplication') {
      if (SlotsManager.getSn(payload.data.sessionId)) {
        done(null, payload.data.salt + authorization.split(' ')[0] + process.env.LINTO_STACK_OVERWATCH_JWT_SECRET)
      } else {
        done(new UnreservedSlot())
      }
    }
  }
}

function generateRefreshSecretFromHeaders(req, payload, done) {
  if (!payload || !payload.data) {
    done(new MalformedToken())
  } else {

    const { headers: { authorization } } = req
    if (authorization.split(' ')[0] === 'Android') {
      UsersAndroid.findOne({ email: payload.data.email })
        .then(user => {
          done(null, user.keyToken + authorization.split(' ')[0] + process.env.LINTO_STACK_OVERWATCH_REFRESH_SECRET + process.env.LINTO_STACK_OVERWATCH_JWT_SECRET)
        })
    }
  }
}