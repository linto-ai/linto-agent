const debug = require('debug')('linto-overwatch:overwatch:watcher:logic:mongodb:models:workflows_application')

const MongoModel = require('../model.js')

class ScopesModel extends MongoModel {
  constructor() {
    super('workflows_application')
  }

  async getScopesById(id) {
    try {
      let workflowRaw = await this.mongoRequest({ _id: this.getObjectId(id) })
      if (workflowRaw.length !== 0) {
        for (let node of workflowRaw[0].flow.configs) {
          if (node.type === 'linto-config-mqtt') return node.scope
        }
      }
    } catch (err) {
      console.error(err)
      return err
    }
  }

  async getScopesByListId(idList) {
    try {
      let listWorkflow = []
      for (let id of idList) {
        let workflowRaw = await this.mongoRequest({ _id: this.getObjectId(id) })
        if (workflowRaw.length !== 0 && workflowRaw[0]) listWorkflow.push(workflowRaw[0])
      }
      return listWorkflow
    } catch (err) {
      console.error(err)
      return err
    }
  }
}

module.exports = new ScopesModel()