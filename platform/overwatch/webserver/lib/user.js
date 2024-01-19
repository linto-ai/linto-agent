const debug = require('debug')('linto-overwatch:overwatch:webserver:lib:workflow')

const UsersAndroid = require(process.cwd() + '/lib/overwatch/mongodb/models/android_users')

class WorkflowsApplicationApi {
  constructor() {
  }

  async logout(user) {
    UsersAndroid.findOne({ email: user.email })
    .then(user => {
      UsersAndroid.update({
        _id: user._id,
        keyToken: ''
      }).then(user => {
        if (!user)
          return done(null, false, { errors: 'Unable to generate keyToken' })
      })
    }).catch('ok')
  }
}


module.exports = new WorkflowsApplicationApi()