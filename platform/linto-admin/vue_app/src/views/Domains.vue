<template>
  <div v-if="dataLoaded">
    <h1>Domains</h1>
    <div class="flex col">
      <h2>Registered domains</h2>
      <div class="flex row">
        <table class="table" v-if="webappHosts.length > 0">
          <thead>
            <tr>
              <th>Domain</th>
              <th>Applications</th>
              <th>Domain settings</th>
              <th>Manage applications</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="webapp in webappHosts" :key="webapp._id">
              <td><strong>{{ webapp.originUrl }}</strong></td>
              <td>
                <ul class="array-list" v-if="webapp.applications.length > 0">
                  <li v-for="app in webapp.applications" :key="app.applicationId">
                    {{workflowByName[app.applicationId].name }}
                  </li>
                </ul>
                <span class="none" v-else>none</span>
              </td>
              <td class="center">
                <button class="button button-icon-txt button--blue" @click="editWebappHost(webapp)">
                  <span class="button__icon button__icon--edit"></span>
                  <span class="button__label">Edit</span>
                </button>
              </td>
              <td>
                <button class="button button-icon-txt button--bluemid" @click="editWebappHostApplications(webapp)">
                  <span class="button__icon button__icon--settings"></span>
                  <span class="button__label">Manage</span>
                </button>
              </td>
              <td class="center">
                  <button class="button button-icon button--red" @click="deleteWebappHost(webapp)">
                  <span class="button__icon button__icon--trash"></span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        
      </div>
      <div class="divider"></div>
      <div class="flex row">
        <button class="button button-icon-txt button--green" @click="addWebappHost()">
          <span class="button__icon button__icon--add"></span>
          <span class="button__label">Add a domain</span>
        </button>
      </div>
    </div>
  </div>
  <div v-else>Loading...</div>
</template>
<script>
import { bus } from '../main.js'
import axios from 'axios'
export default {
  data () {
    return {
      webappHostsLoaded: false,
      applicationWorkflowsLoaded: false
    }
  },
  async created () {
    // Request store
    await this.refreshStore()
  },
  async mounted () {
    // Events
    bus.$on('add_webapp_host_success', async (data) => {
      await this.refreshStore()
    })
    bus.$on('delete_webapp_host_success', async (data) => {
      await this.refreshStore()
    })
  },
  computed: {
    dataLoaded () {
      return this.webappHostsLoaded && this.applicationWorkflowsLoaded
    },
    webappHosts () {
      return this.$store.state.webappHosts
    },
    workflowByName () {
      return this.$store.getters.APP_WORKFLOWS_NAME_BY_ID
    }
  },
  methods: {
    addWebappHost () {
      bus.$emit('add_webapp_host', {})
    },
    deleteWebappHost (webapp) {
      bus.$emit('delete_webapp_host', { webappHost : webapp })
    },
    editWebappHost (webapp) {
      bus.$emit('edit_webapp_host', { webappHost : webapp })
    },
    editWebappHostApplications (webapp) {
      bus.$emit('edit_webapp_host_applications', { webappHost : webapp })
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
            this.applicationWorkflowsLoaded = dispatchSuccess
            break
          default:
            return
        }
      } catch (error) {
        console.error(error)
        bus.$emit('app_notif', {
          status: 'error',
          msg: error.error,
          timeout: false,
          redirect: false
        })
      }
    }
  }
}
</script>