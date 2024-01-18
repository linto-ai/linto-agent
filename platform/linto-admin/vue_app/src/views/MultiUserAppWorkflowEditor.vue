<template>
  <div v-if="dataLoaded && sttServicesAvailable">
    <div class="flex1 flex col">
      <h1>Workflow editor - {{ currentWorkflow.name }}</h1>
      <div class="flex col flex1">
        <details open class="description">
          <summary>Infos</summary>
          <span>The workflow editor uses an embedded application called node-red. You will have to log in to the node-red application to be able to edit workflows.<br/>
          <strong>Please log in with the following credentials :</strong>
          <ul>
            <li>Login : <strong>{{ noderedUser }}</strong> </li>
            <li>Password : <strong>{{ noderedPassword }}</strong></li>
          </ul>
          For more informations about node-red workflows, please read the <a href="https://doc.linto.ai/" target="_blank">documentation</a>.
          </span>
        </details>
        <div class="block block--transparent block--no-margin block--no-padding flex1 flex">
          <NodeRedIframe :contextFrame="'applicationWorkflow'" :blsurl="blsUrl" :noderedFlowId="currentWorkflow.flowId" :workflowId="applicationWorkflowId" :workflowName="currentWorkflow.name" v-if="dataLoaded"></NodeRedIframe>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <div v-if="dataLoaded && !sttServicesAvailable">
      Used STT language model(s) in generation process. <a href="/admin/applications/multi">Back to overview</a>.
    </div>
    <div v-if="!dataLoaded && !sttServicesAvailable">Loading...</div>
  </div>
</template>
<script>
import { bus } from '../main.js'
import axios from 'axios'
import NodeRedIframe from '@/components/NodeRedIframe.vue'
export default {
  data () {
    return {
      loading: true,
      blsUp: false,
      blsUrl: '',
      noderedUser: process.env.VUE_APP_NODERED_USER,
      noderedPassword: process.env.VUE_APP_NODERED_PASSWORD,
      applicationWorkflowsLoaded: false,
      applicationWorkflowId: null,
      sttCommandService: null,
      largeVocabStreaming: null,
      sttServicesLoaded: false,
      sttLanguageModelsLoaded: false
    }
  },
  beforeRouteEnter (to, form, next) {
    // Check if Business logic server is UP before enter route
    next(vm => vm.isBlsUp())
  },
  async mounted () {
    this.applicationWorkflowId = this.$route.params.workflowId
    
    await this.refreshStore()
    
    bus.$on('save_as_workflow_template_success', async (data) => {
      await this.refreshStore()
    })
    bus.$on('iframe_reload', async () => {
      await this.refreshStore()
    })
  },
  computed: {
    dataLoaded () {
      return this.applicationWorkflowsLoaded && this.blsUp && !this.currentWorkflow.error && this.sttServicesLoaded && this.sttLanguageModelsLoaded
    },
    currentWorkflow () {
      return this.$store.getters.APP_WORKFLOW_BY_ID(this.applicationWorkflowId)
    },
    sttServices () {
      return this.$store.getters.STT_SERVICES_AVAILABLE
    },
    sttLanguageModels () {
      return this.$store.state.sttLanguageModels
    },
    // check if STT services are available for this workflow
    sttServicesAvailable () {
      if (this.dataLoaded && !!this.currentWorkflow.sttServices && !!this.sttServices) {
        let sttServiceCmdGenerating = this.sttServices.generating.cmd.filter(mg => mg.serviceId === this.currentWorkflow.sttServices.cmd) 
        
        let sttServiceLVOnlineGenerating = this.sttServices.generating.lvOnline.filter(mg => mg.serviceId === this.currentWorkflow.sttServices.lvOnline) 
        
        let sttServiceLVOfflineGenerating = this.sttServices.generating.lvOffline.filter(mg => mg.serviceId === this.currentWorkflow.sttServices.lvOffline) 

        if (sttServiceCmdGenerating.length > 0 || sttServiceLVOnlineGenerating.length > 0 || sttServiceLVOfflineGenerating.length > 0) {
          return false
        } else {
          return true
        }
      }
    }
  },
  watch: {
    currentWorkflow (data) {
     if(!data.error) {
        this.blsUrl = `${process.env.VUE_APP_NODERED}/#flow/${this.currentWorkflow.flowId}`
     }
    },
  },
  methods: {
    async isBlsUp () {
      try {
        const connectBls = await axios.get(process.env.VUE_APP_NODERED)
        if (connectBls.status === 200) {
          this.blsUp = true
        }
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: 'Cannot connect to Business logic server',
          timeout: false
        })
      }
     },
     async refreshStore () {
      try {
        await this.dispatchStore('getMultiUserApplications')
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
        switch(topic) {
          case 'getMultiUserApplications':
            this.applicationWorkflowsLoaded = dispatchSuccess
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
    NodeRedIframe
  }
}
</script>