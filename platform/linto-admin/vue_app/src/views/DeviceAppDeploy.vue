<template>
  <div v-if="dataLoaded && allRequiredAvailable">
    <h1>Deploy a specific application bound to a device</h1>
    <div class="flex col">
      <!-- Workflow name -->
      <AppInput 
        :label="'Application name'" 
        :obj="workflowName" 
        :test="'testDeviceWorkflowName'"
        :required="true"
      ></AppInput>

      <!-- Workflow description -->
      <AppTextarea 
        :obj="workflowDescription" 
        :label="'Application description'"
        :required="false"
      ></AppTextarea>

    <!-- device -->
      <AppSelect 
        :label="'Choose a device'" 
        :obj="associated_device" 
        :list="availableStaticDevices" 
        :params="{key:'_id', value:'sn' , optLabel: 'sn'}"
        :disabled="availableStaticDevices.length === 0"
        :disabledTxt="'No device available'"
        :required="true"
      ></AppSelect>

      <!-- STT language -->
      <AppSelect 
        :label="'Select a language'" 
        :obj="sttServiceLanguage" 
        :list="sttAvailableLanguages" 
        :params="{key:'value', value:'value', optLabel: 'value'}" 
        :disabled="noSttService" 
        :disabledTxt="'Create a STT service'"
        :required="true"
      ></AppSelect> 
      
      <AppFormLabel
        :label="'Features'"
        :helperBtn="true"
        :helperBtnContent="'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam ac leo nec lacus porttitor feugiat luctus in purus. Ut eget felis quis ligula consequat bibendum non a felis. Donec ut viverra enim, at sagittis nisi. Etiam ornare mauris ac mi cursus, eu pretium elit dapibus. Aliquam mollis congue libero. Sed malesuada tempor eleifend. Integer at dapibus ex.'"
      ></AppFormLabel>

      <div 
        class="application-features-container flex col"
        :class="featuresError !== null ? 'error' : ''"
      >
        <!-- Smart assistant -->
        <AppSelect 
          :noLabel="true" 
          :obj="sttCommandService" 
          :list="!!sttServiceCmdByLanguage['cmd'] ? sttServiceCmdByLanguage['cmd'] : []" 
          :list2="!!sttServiceCmdByLanguage['generating'] ? sttServiceCmdByLanguage['generating'] : []"
          :params="{key:'_id', value:'serviceId', optLabel: 'serviceId'}" 
          :disabled="sttServiceLanguage.value === ''" 
          :disabledTxt="'Please select a language'"
          :required="true"
          :checkboxOptionEnabled="true" 
          :checkboxOptionLabel="'Smart assistant'"
          :checkboxOptionId="'stt-comand-custom'"
        ></AppSelect>
        <!-- Chatbot -->
        <AppInput 
          :noLabel="true" 
          :obj="chatbot" 
          :test="'testPath'"
          :required="true"
          :checkboxOptionEnabled="true" 
          :checkboxOptionLabel="'Chatbot'"
          :checkboxOptionId="'chatbot-custom'"
          :placeholder="'/example/path'"
        ></AppInput>
        
        <!-- Dictation -->
        <AppSelect 
          :noLabel="true" 
          :obj="sttLVOnlineService" 
          :list="!!sttServiceLVOnlineByLanguage['lvOnline'] ? sttServiceLVOnlineByLanguage['lvOnline'] : []" 
          :list2="!!sttServiceLVOnlineByLanguage['generating'] ? sttServiceLVOnlineByLanguage['generating'] : []"
          :options="{label: 'Use an external service', value:'external'}"
          :params="{key:'_id', value:'serviceId', optLabel: 'serviceId'}" 
          :disabled="sttServiceLanguage.value === ''" 
          :disabledTxt="'Please select a language'"
          :disabled2="!sttServiceLVOnlineByLanguage['lvOnline'] || sttServiceLVOnlineByLanguage['lvOnline'].length === 0" 
          :disabled2Txt="'No service available'"
          :checkboxOptionEnabled="true" 
          :checkboxOptionLabel="'Dictation'"
          :checkboxOptionId="'dictation-custom'"
        ></AppSelect>

        <!-- Dictation external -->
        <AppInput 
          v-if="sttLVOnlineService.value === 'external'"
          :label="'External streaming service'" 
          :obj="sttLVOnlineExternalService" 
          class="dictation-external deploy-form"
          :placeholder="'/example/path'"
          :test="'notEmpty'"
        ></AppInput>
        <span class="form__error-field features-error" v-if="featuresError !== null">{{ featuresError }}</span>
      </div>

      <!-- Submit -->
      <div class="flex row">
        <a href="/admin/applications/device" class="button button-icon-txt button--grey" style="margin-right: 20px;">
          <span class="button__icon button__icon--cancel"></span>
          <span class="button__label">Cancel</span>
        </a>
        <button class="button button-icon-txt button--green" @click="handleForm()">
          <span class="button__icon" :class="submitting ? 'button__icon--loading' : 'button__icon--deploy'"></span>
          <span class="button__label">{{ deployLabel }}</span>
        </button> 
      </div>
    </div>
  </div>
  <div v-else>
    <span v-html="requiredErrorMsg"></span>
  </div>
</template>
<script>
import AppInput from '@/components/AppInput.vue'
import AppSelect from '@/components/AppSelect.vue'
import AppFormLabel from '@/components/AppFormLabel.vue'
import AppTextarea from '@/components/AppTextarea.vue'
import { bus } from '../main.js'
import axios from 'axios'
export default {
  data () {
    return {
      workflowName: {
        value: '',
        error: null,
        valid: false
      },
      workflowDescription: {
        value: '',
        error: null,
        valid: true
      },
      sttServiceLanguage: {
        value: '',
        error: null,
        valid: false
      },
      associated_device: {
        value: '',
        error: null,
        valid: false
      },
      sttCommandService: {
        value: '',
        error: null,
        valid: false
      },
      sttLVOnlineService: {
        value: '',
        error: null,
        valid: false
      },
      sttLVOnlineExternalService: {
        value: '',
        error: null,
        valid: false
      },
      sttLVOfflineService: {
        value: '',
        error: null,
        valid: false
      },
      chatbot: {
        value:'',
        error: null,
        valid: false
      },
      featuresError: null,
      flowId: null,
      // Services loading status
      sttLanguageModelsLoaded:false,
      sttServicesLoaded: false,
      tockApplicationsLoaded: false,
      devicesLoaded: false,
      // Workflow creation steps
      submitting: false,
      blsFlowUpdate: false,
      blsFlowStatus: 'Posting workflow on Business logic Server',
      workflowUpdate: false,
      workflowStatus: 'Registering the new workflow',
      staticDeviceUpdate: false,
      staticDeviceStatus: 'Attaching static device to created workflow',
      nluLexSeedUpdate: false,
      nluLexSeedStatus: 'Updating natural language understanding dictionnaries',
      sttLexSeedUpdate: false,
      sttLexSeedStatus: 'Updating LinSTT service dictionnaries',
      requiredErrorMsg: ''
    }
  },
  computed: {
    devices () {
      return this.$store.state.staticClients
    },
    dataLoaded () {
      return (this.sttLanguageModelsLoaded && this.sttServicesLoaded && this.tockApplicationsLoaded && this.devicesLoaded)
    },
    availableStaticDevices () {
      return this.$store.getters.STATIC_CLIENTS_AVAILABLE
    },
    sttServices () {
      return this.$store.getters.STT_SERVICES_AVAILABLE
    },
    sttAvailableLanguages () {
      if (this.sttServicesLoaded && !!this.sttServices.cmd) {
        let sttLang = []
        if (!!this.sttServices.cmd && this.sttServices.cmd.length > 0) {
          this.sttServices.cmd.map(service => {
            if(sttLang.filter(lang => lang.value === service.lang).length === 0) {
              sttLang.push({ value: service.lang })
            }
          })
        }
        return sttLang
      } else {
        return ''
      }
    },
    sttServiceCmdByLanguage () {
      if (this.dataLoaded && this.sttServiceLanguage.value !== '') {
        let resp = []
        resp['generating'] = []
        if(!!this.sttServices.cmd && this.sttServices.cmd.length > 0) {
          resp['cmd'] = this.sttServices.cmd.filter(service => service.lang === this.sttServiceLanguage.value).length > 0 ? this.sttServices.cmd.filter(service => service.lang === this.sttServiceLanguage.value) : []
        }
        if(!!this.sttServices.generating.cmd && this.sttServices.generating.cmd.length > 0) {
          resp['generating'] = this.sttServices.generating.cmd.filter(service => service.lang === this.sttServiceLanguage.value).length > 0 ? this.sttServices.generating.cmd.filter(service => service.lang === this.sttServiceLanguage.value) : []
        }
        return resp
      } else {
        return []
      }
    },
    sttServiceLVOnlineByLanguage () {
      if (this.dataLoaded && this.sttServiceLanguage.value !== '') {
         let resp = []
        resp['generating'] = []
        if(!!this.sttServices.lvOnline && this.sttServices.lvOnline.length > 0) {
          resp['lvOnline'] = this.sttServices.lvOnline.filter(service => service.lang === this.sttServiceLanguage.value).length > 0 ? this.sttServices.lvOnline.filter(service => service.lang === this.sttServiceLanguage.value) : []
        }
        
        if(!!this.sttServices.generating.lvOnline && this.sttServices.generating.lvOnline.length > 0) {
          resp['generating'] = this.sttServices.generating.lvOnline.filter(service => service.lang === this.sttServiceLanguage.value).length > 0 ? this.sttServices.generating.lvOnline.filter(service => service.lang === this.sttServiceLanguage.value) : []
        }
        return resp
      } else {
        return []
      }
    },
    sttServiceLVOfflineByLanguage () {
      if (this.dataLoaded && this.sttServiceLanguage.value !== '') {
        let resp = []
        resp['generating'] = []
        if(!!this.sttServices.lvOffline && this.sttServices.lvOffline.length > 0) {
          resp['lvOffline'] = this.sttServices.lvOffline.filter(service => service.lang === this.sttServiceLanguage.value).length > 0 ? this.sttServices.lvOffline.filter(service => service.lang === this.sttServiceLanguage.value) : []
        }
        if(!!this.sttServices.generating.lvOffline && this.sttServices.generating.lvOffline.length > 0) {
          resp['generating'] = this.sttServices.generating.lvOffline.filter(service => service.lang === this.sttServiceLanguage.value).length > 0 ? this.sttServices.generating.lvOffline.filter(service => service.lang === this.sttServiceLanguage.value) : []
        }
        return resp
      } else {
        return []
      }
    },
    noSttService () {
      return !this.sttServicesLoaded ||(!!this.sttServices.cmd && this.sttServices.cmd.length === 0)
    },
    tockApplications () {
      return this.$store.state.tockApplications
    },
    formValid () {
      let sttCommandEnabledBox = document.getElementById('stt-comand-custom')
      let chatbotEnabledBox = document.getElementById('chatbot-custom')
      let dictationEnabledBox = document.getElementById('dictation-custom')
      if(this.sttLVOnlineService.value === 'external') {
        return (
          this.workflowName.valid && 
          this.sttServiceLanguage.valid && 
          this.associated_device.valid && 
          this.workflowDescription.valid && 
          this.sttLVOnlineExternalService.value !== '' && 
          (chatbotEnabledBox.checked ? this.chatbot.valid : true) &&
          (sttCommandEnabledBox.checked ? this.sttCommandService.valid : true) &&
          (dictationEnabledBox.checked ? this.sttLVOnlineExternalService.valid : true) 
        )
      } else {
        return (
          this.workflowName.valid && 
          this.sttServiceLanguage.valid && 
          this.associated_device.valid && 
          this.workflowDescription.valid &&
          (chatbotEnabledBox.checked ? this.chatbot.valid : true) && 
          (sttCommandEnabledBox.checked ? this.sttCommandService.valid : true) &&
          (dictationEnabledBox.checked ? this.sttLVOnlineService.valid : true)
        )
      }
    },
    deployLabel () {
      if (this.submitting) {
        return 'Creating application'
      } else {
        return 'Create application'
      }
    },
    allRequiredAvailable () {
      let valid = true
      // STT
      if(!!this.sttServices.cmd && this.sttServices.cmd.length === 0) {
        valid = false
        this.requiredErrorMsg = 'No STT service found. Please create one before creating an application. <a href="https://doc.linto.ai/#/services/linstt_howtouse" target="_blank">Documentation</a>'
      }
      return valid
    }
  },
  async created () {
    await this.refreshStore()
  },
  methods: {
    showModal () {
      this.modalVisible = true
    },
    closeModal () {
      this.modalVisible = false
    },
    async handleForm () {
      this.featuresError = null
      let sttCommandEnabledBox = document.getElementById('stt-comand-custom')
      let chatbotEnabledBox = document.getElementById('chatbot-custom')
      let dictationEnabledBox = document.getElementById('dictation-custom')
      
      /* Workflow Name */ 
      this.$options.filters.testMultiUserWorkflowName(this.workflowName) // Test if workflow name is not used
      if (this.workflowName.error === null) {
        this.$options.filters.testName(this.workflowName)
      }
      
      /* Device */
      await this.$options.filters.testStaticClientsSN(this.associated_device)
      if (this.associated_device.error === null) {
        this.$options.filters.testName(this.associated_device)
      }

      /* Application language */
      this.$options.filters.testSelectField(this.sttServiceLanguage)

      /* Workflow description */
      this.$options.filters.testContent(this.workflowDescription)

      
      /* Features */
      // Smart assistant => STT Command service
      if(sttCommandEnabledBox.checked) {
        this.$options.filters.testSelectField(this.sttCommandService)
      } else {
        this.sttCommandService = {
          value: '',
          error: null,
          valid: false
        }
      }
  
      // Chatbot enabled 
      if(chatbotEnabledBox.checked) {
        this.$options.filters.testPath(this.chatbot)
      } else {
        this.chatbot = {
          value: '',
          error: null,
          valid: false
        }
      }

      // Dicatation enabled 
      if(dictationEnabledBox.checked) {
        if(this.sttLVOnlineService.value === 'external') {
          this.$options.filters.notEmpty(this.sttLVOnlineExternalService)
        }
        this.$options.filters.testSelectField(this.sttLVOnlineService)
        
      } else {
        this.sttLVOnlineService = {
          value: '',
          error: null,
          valid: false
        }
      }
        
      if (this.formValid) {
        await this.createApplication()
      }
    },
    async createApplication () {
      try { 
        let payload = {
          workflowName: this.workflowName.value,
          workflowDescription: this.workflowDescription.value.replace(/\n/g,' '),
          language: this.sttServiceLanguage.value,
          nluAppName: this.workflowName.value.replace(/\s/g,'_'),
          smart_assistant: this.sttCommandService.value,
          streamingService: this.sttLVOnlineService.value === 'external' ? this.sttLVOnlineExternalService.value : this.sttLVOnlineService.value,
          streamingServiceInternal: !(this.sttLVOnlineService.value === 'external'),
          chatbot: this.chatbot.value,
          device: this.associated_device.value
        }

        this.submitting = true
        
        // STEP 1 : Post workflow template on BLS
        const postBls = await this.postFlowOnBLS(payload)
        if(postBls === 'success') {
          if (this.flowId !== null) {
            payload.flowId = this.flowId
            // STEP 2 : Post workflow on Database
            const postWorkflow = await this.postWorkflow(payload)
            if (postWorkflow === 'success') {
              // STEP 3 : Update static device
              const updateStaticDevice = await this.updateStaticDevice(payload)
              
              if (updateStaticDevice === 'success' ) {
                // STEP 4 : NLU lexical seeding
                setTimeout( async ()=> {
                  const nluLexicalSeeding = await this.nluLexicalSeeding(payload)
                  if (nluLexicalSeeding === 'success') {
                    // STEP 5 : STT lexical seeding
                    const sttLexicalSeeding = await this.sttLexicalSeeding(payload)
                    if (sttLexicalSeeding === 'success') {
                      this.submitting = false
                      bus.$emit('app_notif', {
                        status: 'success',
                        msg: `Application "${payload.workflowName}" has been created`,
                        timeout: 3000,
                        redirect: `${process.env.VUE_APP_URL}/admin/applications/device`
                      })
                    }
                  }
                }, 1500)
              }
            }
          }
        }
      } catch (error) {
        this.submitting = false
        bus.$emit('app_notif', {
          status: 'error',
          msg: error,
          timeout: false,
          redirect: false
        })
      }
    },
    async postFlowOnBLS (payload) {
      try {
        const postBls = await axios(`${process.env.VUE_APP_URL}/api/flow/postbls/device`, {
          method: 'post', 
          data: { payload }
        })
        if(postBls.data.status === 'success' && !!postBls.data.flowId) {
          this.blsFlowUpdate = true
          this.blsFlowStatus = 'The workflow template has been posted on Business Logic Server' 
          this.flowId = postBls.data.flowId
          return 'success'
        } else {
          throw postBls.data.msg
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
    async postWorkflow (payload) {
      try {
        const postWorkflow = await axios(`${process.env.VUE_APP_URL}/api/workflows/static`, {
            method: 'post', 
            data: { payload }
          })
          if (postWorkflow.data.status === 'success') {
            this.workflowUpdate = true
            this.workflowStatus = `The workflow "${payload.workflowName}" has been registered`
            return 'success'
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
    async nluLexicalSeeding (payload) {
      try {
        const nluLexSeed = await axios(`${process.env.VUE_APP_URL}/api/tock/lexicalseeding`, {
          method: 'post', 
          data: { payload }
        })
        if(nluLexSeed.data.status === 'success') {
          this.nluLexSeedUpdate = true
          this.nluLexSeedStatus = 'Natural language understanding dictionnaries have been updated'
          return 'success'
        } else {
          throw nluLexSeed
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
    async sttLexicalSeeding (payload) {
      try {
        const sttLexSeed = await axios(`${process.env.VUE_APP_URL}/api/stt/lexicalseeding`, {
          method: 'post', 
          data: { 
            payload : {
              flowId: payload.flowId,
              service_name: payload.sttCommandService
            }
          }
        })
        if(sttLexSeed.data.status === 'success') {
          this.sttLexSeedUpdate = true
          this.sttLexSeedStatus = 'STT service dictionnaries have been updated'
          return 'success'
        } else {
          throw sttLexSeed
        }
      } catch (error) {
        this.sttLexSeedStatus = error.data.msg
        bus.$emit('app_notif', {
          status: 'error',
          msg: error.data.msg,
          timeout: false,
          redirect: false
        })
      }
    },
    async updateStaticDevice (payload) {
      try {
          await this.dispatchStore('getDeviceApplications')
          // Get created device application
          let apps = this.$store.state.deviceApplications
          let newApp = apps.filter(app => app.name === payload.workflowName)
          if(newApp.length > 0) {
            const devicePayload = {
              associated_workflow: {
                _id: newApp[0]._id,
                name: newApp[0].name
              }
            }
            // Update device
            const updateStaticDevice = await axios(`${process.env.VUE_APP_URL}/api/clients/static/${payload.device}`, {
              method: 'patch', 
              data: { payload: devicePayload }
            })
            if(updateStaticDevice.data.status === 'success') {
              this.staticDeviceUpdate = true
              this.staticDeviceStatus = `The device "${this.sn}" has been attached to device application "${payload.workflowName}"`
              return 'success'
            } else if (updateStaticDevice.data.status === 'error') {
              this.staticDeviceUpdate = false
              this.staticDeviceStatus = updateStaticDevice.data.msg
              throw updateStaticDevice.data.msg
            }
          } else {
            throw 'application not found'
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
        await this.dispatchStore('getSttServices')
        await this.dispatchStore('getStaticClients')
        await this.dispatchStore('getSttLanguageModels')
        await this.dispatchStore('getTockApplications')
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
        //Debug
        if(process.env.VUE_APP_DEBUG === true) {
          console.log(topic, dispatchSuccess)
        }
        switch(topic) {
          case 'getSttServices':
            this.sttServicesLoaded = dispatchSuccess
            break
          case 'getTockApplications': 
            this.tockApplicationsLoaded = dispatchSuccess
            break
          case 'getSttLanguageModels':
            this.sttLanguageModelsLoaded = dispatchSuccess
            break
          case 'getStaticClients':
            this.devicesLoaded = dispatchSuccess
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
  },
  components: {
    AppFormLabel,
    AppInput,
    AppSelect,
    AppTextarea
  }
}
</script>