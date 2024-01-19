const debug = require('debug')('linto-overwatch:webserver:config')

module.exports.loadAuth = () => {
  if (process.env.LINTO_STACK_OVERWATCH_AUTH_TYPE === '')
    return undefined

  return process.env.LINTO_STACK_OVERWATCH_AUTH_TYPE.split(',').map(auth => {
    debug(`LOADED STRATEGY ${auth}`)
    return {
      ...require(`./auth/${auth}`),
    }
  })
}