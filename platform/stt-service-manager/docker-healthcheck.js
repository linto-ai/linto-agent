const fetch = require('node-fetch')

fetch(`http://localhost:${process.env.LINTO_STACK_STT_SERVICE_MANAGER_HTTP_PORT}`).catch(err => {
  throw err.message
})