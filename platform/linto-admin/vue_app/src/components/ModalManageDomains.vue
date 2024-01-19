<template>
  <div class="modal-wrapper" v-if="modalVisible && dataLoaded">
    <div class="modal">
      <!-- HEADER -->
      <div class="modal-header flex row">
        <span class="modal-header__tilte flex1">Manage domains for application "{{ appName }}"</span>
        <button class="button button-icon button--red" @click="closeModal()">
          <span class="button__icon button__icon--close"></span>
        </button>
      </div>
      <!-- End HEADER -->
      <!-- BODY -->
      <div class="modal-body flex col">
        <div class="modal-body__content flex col">
          <div class="flex row button--toggle__container">
            <span class="button--toggle__label">Domain authentication: </span>
            <button class="button--toggle" :class="webappAuth ? 'enabled': 'disabled'" @click="toggleWebappAuth()">
              <span class="button--toggle__disc"></span>
            </button>
          </div>

          <p v-if="registeredHosts.length > 0"> List of registered <strong>domains</strong> in multi-user application "<strong>{{ appName }}</strong>".</p>
          <div class="flex row" v-if="registeredHosts.length > 0">
            <table class="table">
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>Request token</th>
                  <th>maxSlots</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="host in registeredHosts" :key="host._id">
                  <td><strong>{{ host.originUrl }}</strong></td>
                  <td>{{ host.applications.filter(app => app.applicationId === workflowId)[0].requestToken }}</td>
                  <td>{{ host.applications.filter(app => app.applicationId === workflowId)[0].maxSlots }}</td>
                  <td>
                    <button class="button button-icon button--red" @click="removeAppFromWebappHost(host, workflowId)">
                      <span class="button__icon button__icon--trash"></span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="flex col no-content" v-if="registeredHosts.length === 0 ">No domain was found for this application.</div>
        </div>
      </div>
      <!-- End BODY -->
      <!-- FOOTER -->
      <div class="modal-footer flex row">
        <div class="flex flex1 modal-footer-right">
          <a href="/admin/domains" class="button button-icon-txt button--blue">
            <span class="button__icon button__icon--goto"></span>
            <span class="button__label">Manage domains</span>
          </a>
        </div>
      </div>
    <!-- End FOOTER -->
    </div>
  </div>
</template>
<script>
import AppSelect from '@/components/AppSelect.vue'
import { bus } from '../main.js'
import axios from 'axios'
export default {
  data () {
    return {
      modalVisible: false,
      workflowId: null,
      appName: null,
      webappHostsLoaded: false,
      applicationWorkflowLoaded: false
    }
  },
  async mounted () {
    bus.$on('manage_webapp_hosts', async (data) => {
      this.showModal()
      this.workflowId = data.workflowId
      this.appName = data.appName
      await this.refreshStore()
    })
  },
  computed: {
    dataLoaded () {
      return this.applicationWorkflowLoaded && this.webappHostsLoaded
    },
    notRegisteredHosts () {
      if (this.registeredHosts.length > 0 ) { 
        let allHosts = this.$store.state.webappHosts
        let notRegHosts = []
        allHosts.map(host => {
          notRegHosts.push(host)
          this.registeredHosts.map(regHost => {
            if(host._id === regHost._id) {
              notRegHosts.splice(notRegHosts.findIndex(item => item._id === host._id), 1)
            }
          })
        })
        return notRegHosts
      } else {
        return this.$store.state.webappHosts
      }
    },
    registeredHosts () {
      return this.$store.getters.WEB_APP_HOST_BY_APP_ID(this.workflowId)
    },
    applicationWorkflow () {
      return this.$store.getters.APP_WORKFLOW_BY_ID(this.workflowId)
    },
    webappAuth () {
      return this.applicationWorkflow.flow.nodes[this.applicationWorkflow.flow.nodes.findIndex(f => f.type === 'linto-application-in')].auth_web
    }
  },
  methods: {
    showModal () {
      this.modalVisible = true
    },
    closeModal () {
      this.modalVisible = false
    },
    async toggleWebappAuth () {
      try {
        const updateWebappAuth = await axios(`${process.env.VUE_APP_URL}/api/workflows/application/${this.workflowId}/webappAuth`, {
          method: 'put'
        })

        if(updateWebappAuth.data.status === 'success') {
          bus.$emit('app_notif', {
            status: 'success',
            msg: updateWebappAuth.data.msg,
            timeout: 3000,
            redirect: false
          })
          await this.refreshStore()
        } else {
          throw updateWebappAuth.data.msg
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
    async removeAppFromWebappHost (webappHost, appId) {
      try {
        const payload = {webappHost}
        const removeAppFromWebappHost = await axios(`${process.env.VUE_APP_URL}/api/webapphosts/${webappHost._id}/applications/${appId}`, {
          method: 'patch',
          data: {payload}
        })

        if (removeAppFromWebappHost.data.status === 'success'){
          bus.$emit('app_notif', {
            status: 'success',
            msg: removeAppFromWebappHost.data.msg,
            timeout: 3000,
            redirect: false
          })
          await this.refreshStore()
        } else {
          throw removeAppFromWebappHost.data.msg
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
    async refreshStore () {
      try {
        await this.dispatchStore('getWebappHosts')
        await this.dispatchStore('getMultiUserApplications')
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: !!error.msg ? error.msg : error,
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
          case 'getWebappHosts':
            this.webappHostsLoaded = dispatchSuccess
            break
          case 'getMultiUserApplications':
            this.applicationWorkflowLoaded = dispatchSuccess
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
    AppSelect
  }
}
</script>