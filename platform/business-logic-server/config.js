const debug = require('debug')('linto-red:config')
const dotenv = require('dotenv')
const fs = require('fs')

function ifHas(element, defaultValue) {
  if (!element) return defaultValue
  return element
}

function configureDefaults() {
  try {
    dotenv.config()
    const envdefault = dotenv.parse(fs.readFileSync('.envdefault'))

    // Shared folder
    process.env.LINTO_SHARED_MOUNT = ifHas(process.env.LINTO_SHARED_MOUNT, envdefault.LINTO_SHARED_MOUNT)
    process.env.LINTO_STACK_NPM_CUSTOM_REGISTRY = ifHas(process.env.LINTO_STACK_NPM_CUSTOM_REGISTRY)

    // Node environment
    process.env.LINTO_STACK_NODE_ENV = ifHas(process.env.NODE_ENV, envdefault.NODE_ENV)
    process.env.LINTO_STACK_USE_SSL = ifHas(process.env.LINTO_STACK_USE_SSL, envdefault.LINTO_STACK_USE_SSL)

    // Server RED properties
    process.env.LINTO_STACK_BLS_HTTP_PORT = ifHas(process.env.LINTO_STACK_BLS_HTTP_PORT, 80)
    process.env.LINTO_STACK_BLS_SERVICE_UI_PATH = ifHas(process.env.LINTO_STACK_BLS_SERVICE_UI_PATH, envdefault.LINTO_STACK_BLS_SERVICE_UI_PATH)
    process.env.LINTO_STACK_BLS_SERVICE_API_PATH = '/red'

    process.env.LINTO_STACK_BLS_USE_LOGIN = ifHas(process.env.LINTO_STACK_BLS_USE_LOGIN, envdefault.LINTO_STACK_BLS_USE_LOGIN)
    process.env.LINTO_STACK_BLS_USER = ifHas(process.env.LINTO_STACK_BLS_USER, envdefault.LINTO_STACK_BLS_USER)
    process.env.LINTO_STACK_BLS_PASSWORD = ifHas(process.env.LINTO_STACK_BLS_PASSWORD, envdefault.LINTO_STACK_BLS_PASSWORD)
    process.env.LINTO_STACK_BLS_API_MAX_LENGTH = ifHas(process.env.LINTO_STACK_BLS_API_MAX_LENGTH, envdefault.LINTO_STACK_BLS_API_MAX_LENGTH)

    // STT properties
    process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE = ifHas(process.env.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE, envdefault.LINTO_STACK_STT_SERVICE_MANAGER_SERVICE)
    // Admin properties
    process.env.LINTO_STACK_ADMIN_URI = ifHas(process.env.LINTO_STACK_ADMIN_URI, envdefault.LINTO_STACK_ADMIN_URI)

    // Overwatch properties
    process.env.LINTO_STACK_OVERWATCH_SERVICE = ifHas(process.env.LINTO_STACK_OVERWATCH_SERVICE, envdefault.LINTO_STACK_OVERWATCH_SERVICE)
    process.env.LINTO_STACK_OVERWATCH_BASE_PATH = ifHas(process.env.LINTO_STACK_OVERWATCH_BASE_PATH, envdefault.LINTO_STACK_OVERWATCH_BASE_PATH)

    // TOCK properties
    process.env.LINTO_STACK_TOCK_BOT_API = ifHas(process.env.LINTO_STACK_TOCK_BOT_API, envdefault.LINTO_STACK_TOCK_BOT_API)
    process.env.LINTO_STACK_TOCK_SERVICE = ifHas(process.env.LINTO_STACK_TOCK_SERVICE, envdefault.LINTO_STACK_TOCK_SERVICE)
    process.env.LINTO_STACK_TOCK_NLP_API = ifHas(process.env.LINTO_STACK_TOCK_NLP_API, envdefault.LINTO_STACK_TOCK_NLP_API)

  } catch (e) {
    console.error(debug.namespace, e)
    process.exit(1)
  }
}
module.exports = configureDefaults()
