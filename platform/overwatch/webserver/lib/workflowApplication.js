const debug = require('debug')('linto-overwatch:overwatch:webserver:lib:workflow')

const UsersAndroid = require(process.cwd() + '/lib/overwatch/mongodb/models/android_users')
const UsersWeb = require(process.cwd() + '/lib/overwatch/mongodb/models/webapp_hosts')

const Workflow = require(process.cwd() + '/lib/overwatch/mongodb/models/workflows_application')

const LINTO_SKILL_PREFIX = 'linto-skill-'

class WorkflowsApplicationApi {
  constructor() {
  }

  async getWorkflowApp(userData) {
    if (userData.email) {
      let user = await UsersAndroid.findOne({ email: userData.email })
      let application = await Workflow.getScopesByListId(user.applications)
      return formatApplication(application)
    } else return {}
  }
}

module.exports = new WorkflowsApplicationApi()

function formatApplication(applications) {
  let scopes = []
  let scope
  applications.map(app => {
    scope = {
      name: app.name,
      description: app.description,
      services: {}
    }

    for (let node of app.flow.configs) {
      if (node.type === 'linto-config-mqtt') scope.topic = node.scope
    }
    let skills = []
    for (let node of app.flow.nodes) {
      if (node.type === 'linto-transcribe-streaming') scope.services.streaming = true
      if (node.type.includes(LINTO_SKILL_PREFIX)) {
        let skill = { name: node.type.split(LINTO_SKILL_PREFIX)[1] }
        if (node.description) skill.description = node.description
        skills.push(skill)
      }
    }
    scope.skills = skills
    scopes.push(scope)
  })
  return scopes
}