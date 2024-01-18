<template>
  <div class="modal-wrapper" v-if="modalVisible && dataLoaded && webappHost !== null">
    <div class="modal">
      <!-- HEADER -->
      <div class="modal-header flex row">
        <span class="modal-header__tilte flex1">Edit domain</span>
        <button class="button button-icon button--red" @click="closeModal()">
          <span class="button__icon button__icon--close"></span>
        </button>
      </div>
      <!-- End HEADER -->
      <!-- BODY -->
      <div class="modal-body flex col">
        <div class="modal-body__content flex col">
          <span class="subtitle" v-if="!addAppFormVisible">Domain applications</span>
          
          <div class="flex col" v-if="!addAppFormVisible">
            <span class="subtitle" v-if="webappHost.applications.length > 0">Applications</span>
            <div class="flex row"  v-if="webappHost.applications.length > 0">
              <table class="table">
                <thead>
                  <tr>
                    <th>Application name</th>
                    <th>Description</th>
                    <th>Slots</th>
                    <th>Request token</th>
                    <th>Edit</th>
                    <th>Dissociate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="app in webappHost.applications" 
                    :key="app.applicationId"
                    :class="editingIds.indexOf(app.applicationId) >= 0 ? 'active' : ''"
                  >
                    <td><strong>{{ workflowByName[app.applicationId].name }}</strong></td>
                    <td>{{ workflowByName[app.applicationId].description.length > 0 ? workflowByName[app.applicationId].description : 'No description' }}</td>
                    
                    <!-- Slots -->
                    <td v-if="editingIds.indexOf(app.applicationId) < 0">{{ app.maxSlots }}</td>
                    <td v-else>
                        <AppInput :label="'Max slots'" :obj="editingObj[editingObj.findIndex(item => item.applicationId === app.applicationId)].maxSlots" :test="'testInteger'" :type="'number'" :extraClass="'input--number'"></AppInput>
                    </td>
                    
                    <!-- Request Token -->
                    <td v-if="editingIds.indexOf(app.applicationId) < 0">{{ app.requestToken }}</td>
                    <td v-else>
                      <div class="flex row">
                        <input type="text" class="form__input" disabled="disabled" v-model="editingObj[editingObj.findIndex(item => item.applicationId === app.applicationId)].requestToken" />
                        <button class="button button-icon button--blue button--with-desc bottom" @click="generateToken(app.applicationId)" style="margin: 5px 0 0 5px;"
                        data-desc="Regenerate token">
                          <span class="button__icon button__icon--reset"></span>
                        </button>
                      </div>
                    </td>
                    
                    <td v-if="editingIds.indexOf(app.applicationId) < 0"><button class="button button-icon button--blue" @click="toggleEditParameters(webappHost, app)">
                      <span class="button__icon button__icon--edit"></span></button>
                    </td>
                    <td v-else>
                      <button @click="toggleEditParameters(webappHost, app)" class="button button-icon button--grey button--with-desc bottom" data-desc="Cancel changes" style="margin-right: 10px;">
                        <span class="button__icon button__icon--cancel"></span>
                      </button>
                      <button @click="updateApplicationParameters(app.applicationId)" class="button button-icon button--green button--with-desc bottom" data-desc="Validate changes">
                        <span class="button__icon button__icon--apply"></span>
                      </button>
                    </td>
                    
                    <td class="center">
                      <button class="button button--icon button--red" @click="removeAppFromWebappHost(webappHost, app)">
                        <span class="button__icon button__icon--trash"></span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="no-content" v-else>No application associated</div>
            <div class="divider small"></div>
            <div class="flex row" v-if="filteredApplicationWorkflows.length > 0">
              <button class="button button-icon-txt button--green" @click="showAddAppForm()">
                <span class="button__icon button__icon--add"></span>
                <span class="button__label">Associate to other applications</span>
              </button>
            </div>
          </div>
          <div class="flex col" v-else>
            <p>Please select applications to <strong>associate</strong> with the domain "<strong>{{ webappHost.originUrl }}</strong>"</p>
            <div class="flex row">
              <table class="table">
                <thead>
                  <tr>
                    <th colspan="2">Application name</th>
                    <th>Description</th>

                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="wf in filteredApplicationWorkflows" 
                    :key="wf._id" 
                    :class="[selectedAppsIds.indexOf(wf._id) >= 0 ? 'active' : '']"
                  >
                    <td><input type="checkbox" @change="selectApp($event, wf)"></td>
                    <td>{{ wf.name }}</td>
                    <td>{{ wf.description.length > 0 ?  wf.description : 'No description' }}</td>
                    <td v-if="selectedAppsIds.indexOf(wf._id) >= 0">
                      <AppInput :label="'Max slots'" :obj="selectedApps[selectedApps.findIndex(item => item.applicationId === wf._id)].maxSlots" :test="'testInteger'" :type="'number'" :extraClass="'input--number'"></AppInput>
                    </td>
                    <td v-else></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="divider small"></div>
            <div class="flex row">
              <button class="button button-icon-txt button--green" @click="addAppToWebappHost()">
                <span class="button__icon button__icon--apply"></span>
                <span class="button__label">Associate applications</span>
              </button>
            </div>
          </div>
        </div>
        
      </div>
      <!-- End BODY -->
      <div class="modal-footer">
        <div class="flex row" v-if="addAppFormVisible">
          <button class="button button-icon-txt button--grey" @click="hideAddAppForm()">
            <span class="button__icon button__icon--back"></span>
            <span class="button__label">Back to host applications</span>
          </button>
        </div>
      </div>
      <!-- FOOTER -->
    <!-- End FOOTER -->
    </div>
  </div>
</template>
<script>
import AppInput from '@/components/AppInput.vue'
import AppSelect from '@/components/AppSelect.vue'
import { bus } from '../main.js'
import axios from 'axios'
import randomstring from 'randomstring'
export default {
  data () {
    return {
      modalVisible: false,
      webappHostId: null,
      selectedApps: [],
      selectedAppsIds: [],
      addAppFormVisible: false,
      applicationWorkflowsLoaded: false,
      webappHostsLoaded: false,
      originUrl: {
        value: '',
        error: null,
        valid: false
      },
      editingIds: [],
      editingObj: []
      
    }
  },
  async mounted () {
    bus.$on('edit_webapp_host_applications', async (data) => {
      this.showModal()
      await this.refreshStore()
      this.webappHostId = data.webappHost._id
      this.originUrl.value = data.webappHost.originUrl
      this.originUrl.valid = true
    })
  },
  computed: {
    dataLoaded () {
      return this.applicationWorkflowsLoaded && this.webappHostsLoaded
    },
    workflowByName () {
      return this.$store.getters.APP_WORKFLOWS_NAME_BY_ID
    },
    applicationWorkflows () {
      return this.$store.state.multiUserApplications
    },
    filteredApplicationWorkflows () {
      const hostApplications = this.webappHost.applications
      const allApps = this.applicationWorkflows
      let filteredApps = []

      if (hostApplications.length > 0) {
        allApps.map(app => {
          if(hostApplications.findIndex(item => item.applicationId === app._id) < 0) {
            filteredApps.push(app)
          }
        })
        return filteredApps
      } else {
        return this.applicationWorkflows
      }
    },
    webappHosts () {
      return this.$store.state.webappHosts
    },
    webappHost () {
      if(this.webappHostId !== null) {
        return this.$store.getters.WEB_APP_HOST_BY_ID(this.webappHostId)
      } else {
        return null
      }
    },
    addAppsValid () {
      let valid = true
      this.selectedApps.map(app => {
        if(!app.maxSlots.valid) {
          valid = false
        }
      })
      return valid
    }
  },
  methods: {
    showModal () {
      this.modalVisible = true
      this.originUrl = {
        value: '',
        error: null,
        valid: false
      },
      this.editingIds = []
      this.editingObj = []
    },
    closeModal () {
      this.modalVisible = false
      this.hideAddAppForm()
    },
    showAddAppForm () {
      this.addAppFormVisible = true
    },
    hideAddAppForm () {
      this.addAppFormVisible = false
      this.selectedApps = []
      this.selectedAppsIds = []
    },
    generateToken(applicationId) {
      this.editingObj[this.editingObj.findIndex(item => item.applicationId === applicationId)].requestToken = this.generateRequestToken()
    },
    async toggleEditParameters(webappHost, app){
      if(this.editingIds.indexOf(app.applicationId) < 0){
        this.editingIds.push(app.applicationId)
        this.editingObj.push({
          webappHostId: webappHost._id,
          applicationId:app.applicationId,
          maxSlots: {
            value: parseInt(app.maxSlots),
            error: null,
            valid: true
          },
          requestToken: app.requestToken
        })
      } else {
        this.editingIds.pop(app.applicationId)
        this.editingObj.pop(this.editingObj.findIndex(item => item.applicationId === app.applicationId))
      }
    },
    async updateApplicationParameters (applicationId) {
      try {
        let payload = this.editingObj[this.editingObj.findIndex(item => item.applicationId === applicationId)]
        this.$options.filters.testInteger(payload.maxSlots)
        payload.maxSlots.value = parseInt(payload.maxSlots.value)

        if(payload.maxSlots.valid) {
          const updateWebappHostApplication = await axios(`${process.env.VUE_APP_URL}/api/webapphosts/${payload.webappHostId}/applications`, {
          method: 'patch',
            data: {payload}
          })
          if (updateWebappHostApplication.data.status === 'success') {
            this.editingIds.pop(applicationId)
            this.editingObj.pop(this.editingObj.findIndex(item => item.applicationId === app.applicationId))

            await this.refreshStore()
            bus.$emit('app_notif', {
              status: 'success',
              msg: updateWebappHostApplication.data.msg,
              timeout: 3000,
              redirect: false
            })
          } else {
            throw updateWebappHostApplication.data.msg
          }
        }
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: error,
          timeout: false,
          redirect: false
        })
      }
    },
    selectApp (event, wf) {
      if (event.srcElement.checked) {
        this.selectedAppsIds.push(wf._id)
        this.selectedApps.push({
          applicationId: wf._id,
          requestToken: this.generateRequestToken(),
          maxSlots: {
            value: 0,
            error: null,
            valid: true
          }
        })
      } else {
        this.selectedAppsIds.pop(wf._id)
        this.selectedApps.splice(this.selectedApps.findIndex(item => item.applicationId === wf._id), 1)
      }
    },
    updateSelectedApps (event, workflowId) {
      if (event.srcElement.checked) {
        this.selectedApps.push(workflowId)
      } else {
        this.selectedApps.pop(workflowId)
      }
    },
    generateRequestToken () {
      const token = randomstring.generate(16)
      if(this.webappHosts.length > 0){
        const tokenExist = this.webappHosts.filter(wh => wh.requestToken === token)  
        if(tokenExist.length > 0) {
          this.generateRequestToken()
        } 
      }
      return token
    },
    async addAppToWebappHost () {
      try {
        if (this.selectedApps.length > 0 && this.addAppsValid) {
          let payload = {
            applications: []
          }
          this.selectedApps.map(app => {
            payload.applications.push({
              applicationId: app.applicationId,
              requestToken: app.requestToken,
              maxSlots: parseInt(app.maxSlots.value),
              slots: []
            })
          })
          const updateWebappHost = await axios(`${process.env.VUE_APP_URL}/api/webapphosts/${this.webappHost._id}/applications`, {
            method: 'put',
            data: { payload }
          })
          if (updateWebappHost.data.status === 'success') {
            this.hideAddAppForm()
            await this.refreshStore()
            bus.$emit('app_notif', {
              status: 'success',
              msg: updateWebappHost.data.msg,
              timeout: 3000,
              redirect: false
            })
          } else {
            throw updateWebappHost.data.msg
          }
        }
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: error,
          timeout: false,
          redirect: false
        })
      }
    },
    async removeAppFromWebappHost (webappHost, app) {
      try {
        const payload = {
          webappHost, 
          app
        }
        const removeApp = await axios(`${process.env.VUE_APP_URL}/api/webapphosts/${webappHost._id}/applications/${app.applicationId}`, {
          method: 'patch',
          data: { payload }
        })
        if (removeApp.data.status === 'success'){
          bus.$emit('app_notif', {
            status: 'success',
            msg: removeApp.data.msg,
            timeout: 3000,
            redirect: false
          })
          await this.refreshStore()
        } else {
          throw removeApp.data.msg
        }
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: error,
          timeout: false,
          redirect: false
        })
      }
    },
    async updateHostMaxSlots () {
      try {
        this.$options.filters.testInteger(this.maxSlots)
        if (this.maxSlots.valid) {
          const payload = {
            _id: this.webappHost._id,
            maxSlots: parseInt(this.maxSlots.value),
            originUrl: this.originUrl.value
          }
        await this.updateWebappHost(payload)
        }
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: error,
          timeout: false,
          redirect: false
        })
      }
    },
    async updateRequestToken () {
      try {
        const payload = {
          _id: this.webappHost._id,
          requestToken: this.requestToken,
          originUrl: this.originUrl.value
        }
        await this.updateWebappHost(payload)
      } catch (error) {
         bus.$emit('app_notif', {
          status: 'error',
          msg: error,
          timeout: false,
          redirect: false
        })
      }
    },
    async updateWebappHost (payload) {
      try {
        const updateWebappHost = await axios(`${process.env.VUE_APP_URL}/api/webapphosts/${payload._id}`, {
            method: 'put',
            data: { payload }
          })
          
          if (updateWebappHost.data.status === 'success') {
            bus.$emit('app_notif', {
              status: 'success',
              msg: updateWebappHost.data.msg,
              timeout: 3000,
              redirect: false
            })
            await this.refreshStore()
          } else {
              throw updateWebappHost.data.msg
          }
      } catch (error) {
         bus.$emit('app_notif', {
          status: 'error',
          msg: !!error.msg ? error.msg : error,
          timeout: false,
          redirect: false
        })
      }
    },
  
    async refreshStore () {
      try {
        await this.dispatchStore('getWebappHosts')
        await this.dispatchStore('getMultiUserApplications')
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: error,
          timeout: false,
          redirect: false
        })
      }
    },
    async dispatchStore (topic) {
      try {
        const dispatch = await this.$options.filters.dispatchStore(topic)
        const dispatchSuccess = dispatch.status == 'success' ? true : false
        if (dispatch.status === 'error') {
          throw dispatch.msg
        }
        switch(topic) {
          case 'getMultiUserApplications':
            this.applicationWorkflowsLoaded = dispatchSuccess
            break
          case 'getWebappHosts':
            this.webappHostsLoaded = dispatchSuccess
            break
          default:
            return
        }
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: error,
          timeout: false,
          redirect: false
        })
      }
    }
  },
  components: {
    AppSelect,
    AppInput
  }
}
</script>