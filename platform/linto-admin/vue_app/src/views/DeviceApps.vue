<template>
  <div v-if="dataLoaded">
    <h1>Device applications</h1>
    <div class="flex col" >
      <h2>Deployed applications</h2>
      <div class="flex row">
        <table class="table" v-if="deviceApplications.length > 0">
          <thead>
            <tr>
              <th>Application name</th>
              <th>Associated device</th>
              <th>Description</th>
              <th>Deployed workflow</th>
              <th>Application parameters</th>
              <th>Dissociate</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="wf in deviceApplications" :key="wf._id">
              <td><strong>{{wf.name}}</strong></td>
              <td class="right">
                <strong class="button__label">{{ wf.associated_device }}</strong>
                <button class="button button-icon button--bluemid button--with-desc bottom" data-desc="Use an other device" @click="updateEnrolledStaticDevice(wf.associated_device, {name: wf.name, _id: wf._id})">
                  <span class="button__icon button__icon--settings"></span>
                </button>
              </td>
              <td class="table--desc">{{ !!wf.description && wf.description.length > 0 ? wf.description : 'No description'}}</td>
              <td v-if="!!sttAvailableServices.allServicesNames && (
                  (wf.featureServices.cmd !== '' && sttAvailableServices.allServicesNames.indexOf(wf.featureServices.cmd) < 0) || 
                  (wf.featureServices.streamingInternal === 'true' && wf.featureServices.lvOnline !== '' && sttAvailableServices.allServicesNames.indexOf(wf.featureServices.lvOnline) < 0))">
                <a href="javascript:;" class="button button-icon-txt button--red button--with-desc bottom" data-desc="STT service not found">
                  <span class="button__icon button__icon--close"></span>
                  <span class="button__label">{{wf.name}}</span>
                </a>
              </td>
              <td v-else>
                <a v-if="generating.indexOf(wf.featureServices.cmd) >= 0 || generating.indexOf(wf.featureServices.lvOnline) >= 0" href="javascript:;" class="button button-icon-txt button--grey button--with-desc bottom" data-desc="Can't acces application while language model is in generation process...">
                  <span class="button__icon button__icon--loading"></span>
                  <span class="button__label">{{wf.name}}</span>
                </a>
                <a v-else :href="`/admin/applications/device/workflow/${wf._id}`" class="button button-icon-txt button--bluemid button--with-desc bottom" data-desc="Edit on Node-red interface">
                  <span class="button__icon button__icon--workflow"></span>
                  <span class="button__label">{{wf.name}}</span>
                </a>
              </td>
              <td class="center">
                <button class="button button-icon-txt button--blue button--with-desc bottom" data-desc="Edit services parameters" @click="updateWorkflowServicesSettings(wf)">
                  <span class="button__icon button__icon--edit"></span>
                  <span class="button__label">Edit</span>
                </button>
              </td>
              <td class="center">
                <button class="button button-icon button--red button--with-desc bottom" data-desc="Dissociate device and delete workflow" @click="dissociateTerminal(wf.associated_device, {name: wf.name, _id: wf._id})">
                  <span class="button__icon button__icon--close"></span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="no-content" v-else>No device application found</div>
      </div>
      <div class="divider"></div>
      <div class="flex row">
        <a href="/admin/applications/device/deploy" class="button button-icon-txt button--green">
          <span class="button__icon button__icon--add"></span>
          <span class="button__label">Create a device application</span>
        </a>
      </div>
    </div>
  </div>
  <div v-else>Loading...</div>
</template>
<script>
import { bus } from '../main.js'
export default {
  data () {
    return {
      staticClientsLoaded: false,
      deviceApplicationsLoaded: false,
      sttServicesLoaded: false,
      sttLanguageModelsLoaded: false,
      socket: null,
      generating: []
    }
  },
  async created () {
    // Request store
    await this.refreshStore()
  },
  async mounted () {
    // Events
    bus.$on('update_enrolled_static_device_success', async (data) => {
      await this.refreshStore()
    })
    bus.$on('update_workflow_services_success', async (data) => {
      await this.refreshStore()
    })
    bus.$on('update_enrolled_static_device', async (data) => {
      await this.refreshStore()
    })
    bus.$on('dissociate_static_device_success', async (data) => {
      await this.refreshStore()
    })
  },
  computed: {
    staticClients () {
      return this.$store.state.staticClients
    },
    associatedStaticClients () {
      return this.store.getters.STATIC_CLIENTS_ENROLLED
    },
    workflowByClients () {
      return this.$store.getters.STATIC_WORKFLOWS_BY_CLIENTS
    },
    dataLoaded () {
      return this.staticClientsLoaded && this.deviceApplicationsLoaded && this.sttServicesLoaded && this.sttLanguageModelsLoaded
    },
    deviceApplications () {
      return this.$store.state.deviceApplications
    },
    sttAvailableServices () {
      return this.$store.getters.STT_SERVICES_AVAILABLE
    }
  },
  watch: {
    'sttAvailableServices.generating' (data) {
      let generating = []
      if(data.cmd.length > 0) {
        data.cmd.map(cmd => {
          generating.push(cmd.serviceId)
        })
      }
      if(data.lvOnline.length > 0) {
        data.lvOnline.map(lvOnline => {
          generating.push(lvOnline.serviceId)
        })
      }
      this.generating = generating
    }
  },
  methods: {
    // Update serial number static device associated to a workflow
    updateEnrolledStaticDevice (sn, workflow) {
      bus.$emit('update_enrolled_static_device', {sn, workflow})
    },
    // Updat a static workflow settings (mqtt, stt, nlu...)
    updateWorkflowServicesSettings (workflow) {
      bus.$emit('update_workflow_services', {
        application: {
          _id: workflow._id, 
          name: workflow.name,
          description: workflow.description
        },
        type:'device'
      })
    },
    // Dissociate device from a workflow and remove workflow
    dissociateTerminal (sn, workflow){
      bus.$emit('dissociate_static_device', {sn , workflow})
    },
    
    async refreshStore () {
      try {
        await this.dispatchStore('getStaticClients')
        await this.dispatchStore('getDeviceApplications')
        await this.dispatchStore('getSttServices')
        await this.dispatchStore('getSttLanguageModels')
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
        if(process.env.VUE_APP_DEBUG === true) {
          console.log(topic, dispatchSuccess)
        }
        switch(topic) {
          case 'getStaticClients':
            this.staticClientsLoaded = dispatchSuccess
            break
          case 'getDeviceApplications':
            this.deviceApplicationsLoaded = dispatchSuccess
            break
          case 'getSttServices':
            this.sttServicesLoaded = dispatchSuccess
            break
          case 'getSttLanguageModels':
            this.sttLanguageModelsLoaded = dispatchSuccess
            break
          default:
            return
        }  
      } catch (error) {
        if(process.env.VUE_APP_DEBUG === true) {
          console.error(topic, error)
        }
        bus.$emit('app_notif', {
          status: 'error',
          msg: error,
          timeout: false,
          redirect: false
        })
      } 
    } 
  }
}
</script>