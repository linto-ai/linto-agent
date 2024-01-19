const jwtDecode = require('jwt-decode')

const TokenGenerator = require('../../passport/tokenGenerator')
const MongoAndroidUsers = require(process.cwd() + '/lib/overwatch/mongodb/models/android_users')

const ANDROID_TOKEN = 'Android'
const randomstring = require('randomstring')

const { UnableToGenerateKeyToken } = require('../../error/exception/auth')

module.exports = async function (refreshToken) {
  let decodedToken = jwtDecode(refreshToken)
  let user = await MongoAndroidUsers.findOne({ email: decodedToken.data.email })
  if (user === undefined)
    return undefined

  decodedToken.data.salt = randomstring.generate(12)
  MongoAndroidUsers.update({ _id: user._id, keyToken: decodedToken.data.salt })
    .then(user => {
      if (!user) return done(new UnableToGenerateKeyToken())
    })

  return TokenGenerator(decodedToken.data, ANDROID_TOKEN).token
}