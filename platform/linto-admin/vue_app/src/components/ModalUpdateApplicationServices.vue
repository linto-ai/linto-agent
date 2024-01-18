<template>
  <div class="modal-wrapper" v-if="modalVisible && dataLoaded">
    <div class="modal">
      <div class="modal-header flex row">
        <span class="modal-header__tilte flex1">Application services settings</span>
        <button class="button button-icon button--red" @click="closeModal()">
          <span class="button__icon button__icon--close"></span>
        </button>
      </div>
      <div class="modal-body">
        <div class="modal-body__content">
          <p>Update application <strong>"{{applicationName.value}}"</strong> services settings. This will apply modifications to the application workflow.</p>
          <!-- Application name -->
          <AppInput 
            :label="'Application name'" 
            :obj="applicationName" 
            :test="'testName'"
            :required="true"
          ></AppInput>
          
          <!-- Descritpion -->
          <AppTextarea 
            :obj="applicationDescription" 
            :label="'Description'"
            :required="false"
          ></AppTextarea>

          <!-- STT language -->
          <AppSelect 
            :label="'Language'" 
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
          >

          
            <!-- STT services command  -->
            <AppSelect 
              :noLabel="true" 
              :obj="sttCommandService" 
              :list="!!sttServiceCmdByLanguage['cmd'] ? sttServiceCmdByLanguage['cmd'] : []" 
              :list2="!!sttServiceCmdByLanguage['generating'] ? sttServiceCmdByLanguage['generating'] : []"
              :params="{key:'_id', value:'serviceId', optLabel: 'serviceId'}" 
              :disabled="sttServiceLanguage.value === ''" 
              :disabledTxt="'Please select a language'"
              :disabled2="noSttService"
              :disabled2Txt="'Create a STT service'"
              :checkboxOptionEnabled="true" 
              :checkboxOptionLabel="'Smart assistant'"
              :checkboxOptionId="'stt-comand-custom'"
              :checked="applicationSettings.command.enabled === true"

            ></AppSelect> 

            <!-- Chatbot -->
            <AppInput 
            :noLabel="true" 
            :obj="chatbot" 
            :test="'testPath'"
            :checkboxOptionEnabled="true" 
            :checkboxOptionLabel="'chatbot'"
            :checkboxOptionId="'chatbot-custom'"
            :checked="applicationSettings.chatbot.enabled === true"
            
          ></AppInput>

            <!-- LinSTT Large vocabulary online (streaming) -->
            <AppSelect 
              :noLabel="true" 
              :obj="largeVocabStreaming" 
              :list="!!sttServiceLVOnlineByLanguage['lvOnline'] ? sttServiceLVOnlineByLanguage['lvOnline'] : []" 
              :list2="!!sttServiceLVOnlineByLanguage['generating'] ? sttServiceLVOnlineByLanguage['generating'] : []"
              :params="{key:'_id', value:'serviceId', optLabel: 'serviceId'}" 
              :disabled="sttServiceLanguage.value === ''" 
              :disabledTxt="'Please select a language'"
              :options="{label: 'Use an external service', value:'external'}"
              :checkboxOptionEnabled="true" 
              :checkboxOptionLabel="'Dictation'"
              :checkboxOptionId="'dictation-custom'"
              :checked="applicationSettings.streaming.enabled === true"
              :settingsUpdate="true"
            ></AppSelect>

            <AppInput 
            v-if="largeVocabStreaming.value === 'external' && showExternalStreamingField"
            :label="'External streaming service'" 
            :obj="sttLVOnlineExternalService" 
            class="dictation-external"
            :placeholder="'/example/path'"
            :test="'notEmpty'"
          ></AppInput>

            
         </div>
         <!-- TOCK application --> 
            <AppSelect 
              :label="'Tock application (NLU)'" 
              :obj="tockApplicationName" 
              :list="tockApplications" 
              :params="{key:'name', value:'name', optLabel: 'name'}" 
              :options="{value:'new', label:'Create a new tock application'}"
              :required="true"
            ></AppSelect>

        </div>
      </div>
      <div class="modal-footer flex row">
        <div class="flex flex1 modal-footer-right">
          <button class="button button-icon-txt button--green" @click="handleForm()">
            <span class="button__icon button__icon--apply"></span>
            <span class="button__label">Apply</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import AppInput from '@/components/AppInput.vue'
import AppSelect from '@/components/AppSelect.vue'
import AppTextarea from '@/components/AppTextarea.vue'
import AppFormLabel from '@/components/AppFormLabel.vue'
import { bus } from '../main.js'
import axios from 'axios'
export default {
  data () {
    return {
      modalVisible: false,
      application: null,
      applicationType: null,
      applicationId: null,
      applicationName: {
        value: '',
        error: null,
        valid: false
      },
      applicationDescription: {
        value: '',
        error: null,
        valid: false
      },
      sttServiceLanguage: {
        value: '',
        error: null,
        valid: false
      },
      largeVocabStreaming :{
        value: '',
        error: null,
        valid: false
      },
      sttLVOnlineExternalService: {
        value: '',
        error: null,
        valid: false
      },  
      sttCommandService: {
        value: '',
        error: null,
        valid: false
      },
      chatbot: {
        value: '',
        error: null,
        valid: false
      },
      tockApplicationName: {
        value: '',
        error: null,
        valid: false
      },
      sttServicesLoaded: false,
      tockApplicationsLoaded: false,
      sttLanguageModelsLoaded: false,
      applicationWorkflowsLoaded: false,
      applicationSettings: null
      }
  },
  async mounted () {
    bus.$on('update_workflow_services', async (data) => {
      this.resetModalData()
      this.application = data.application
      this.applicationName = {
        value: data.application.name,
        error: null,
        valid: true
      }
      this.applicationDescription = {
        value: data.application.description,
        error: null,
        valid: true
      }
      this.applicationId = data.application._id
        
      this.applicationType = data.type

      await this.refreshStore()
      this.showModal()
    })

    bus.$on('feature_update_settings', () => {
      this.updateSettings()
    })
  },
  computed: {
    dataLoaded () {
      return (this.sttServicesLoaded && this.applicationWorkflowsLoaded && this.tockApplicationsLoaded && this.sttLanguageModelsLoaded && this.currentApp !== null && this.applicationSettings !== null)
    },
    currentApp () {
      if(this.applicationType === 'application') {
        return this.$store.getters.APP_WORKFLOW_BY_ID(this.applicationId) 
      }
      else if(this.applicationType === 'device') {
        return this.$store.getters.STATIC_WORKFLOW_BY_ID(this.applicationId) 
      }
    },
    sttServices () {
      return this.$store.getters.STT_SERVICES_AVAILABLE
    },
    sttAvailableLanguages () {
      if (this.sttServicesLoaded && !!this.sttServices.cmd) {
        let sttLang = []
        if (this.sttServices.cmd.length > 0) {
          this.sttServices.cmd.map(s => {
            if(sttLang.filter(lang => lang.value === s.lang).length === 0) {
              sttLang.push({ value: s.lang })
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
      if(this.largeVocabStreaming.value === 'external') {
        return (
          this.applicationName.valid && 
          this.sttServiceLanguage.valid && 
          this.applicationDescription.valid && 
          this.sttLVOnlineExternalService.value !== '' && 
          (chatbotEnabledBox.checked ? this.chatbot.valid : true) &&
          (sttCommandEnabledBox.checked ? this.sttCommandService.valid : true) &&
          (dictationEnabledBox.checked ? this.sttLVOnlineExternalService.valid : true) 
        )
      } else {
        return (
          this.applicationName.valid && 
          this.sttServiceLanguage.valid && 
          this.applicationDescription.valid &&
          (chatbotEnabledBox.checked ? this.chatbot.valid : true) && 
          (sttCommandEnabledBox.checked ? this.sttCommandService.valid : true) &&
          (dictationEnabledBox.checked ? this.largeVocabStreaming.valid : true)
        )
      }
    },
    showExternalStreamingField () {
      return this.applicationSettings.streaming.internal === 'false'
    }
  },
  watch: {
    currentApp (data) {
      if(!!data) {
        this.applicationSettings = this.$options.filters.getSettingsByApplication(data)

        // language
        this.sttServiceLanguage.value = this.applicationSettings.language
        this.sttServiceLanguage.valid = true
        
        // STT command service
        if(this.applicationSettings.command.enabled) {
          this.sttCommandService.value = this.applicationSettings.command.value
          this.sttCommandService.valid = true
        }

        // streaming
        if(this.applicationSettings.streaming.enabled) {
          if(this.applicationSettings.streaming.internal === 'false') {
            this.largeVocabStreaming = {
              value: 'external',
              valid: true,
              error: null
            }
            this.sttLVOnlineExternalService.value = this.applicationSettings.streaming.value
            this.sttLVOnlineExternalService.valid = true
          } else {
            this.largeVocabStreaming.value = this.applicationSettings.streaming.value
            this.largeVocabStreaming.valid = true
          }
        }
        
        // Chatbot
        if(this.applicationSettings.chatbot.enabled) {
            this.chatbot.value = this.applicationSettings.chatbot.value
            this.chatbot.valid = true
        }

        // Tock
        this.tockApplicationName.value = this.applicationSettings.tock.value
        this.tockApplicationName.valid = true
      }
    }
  },
  methods: {
    resetModalData () {
      this.applicationId = null
      this.applicationName = {
        value: '',
        error: null,
        valid: false
      }
      this.applicationDescription = {
        value: '',
        error: null,
        valid: false
      }
      this.sttServiceLanguage = {
        value: '',
        error: null,
        valid: false
      },
      this.largeVocabStreaming = {
        value: '',
        error: null,
        valid: false
      }
      this.sttLVOnlineExternalService = {
        value: '',
        error: null,
        valid: false
      },  
      this.sttCommandService = {
        value: '',
        error: null,
        valid: false
      },
      this.chatbot = {
        value: '',
        error: null,
        valid: false
      }
      this.tockApplicationName = {
        value: '',
        error: null,
        valid: false
      }
    },
    showModal () {
      this.modalVisible = true
    },
    closeModal () {
      this.modalVisible = false
    },
    updateSettings () {
      let sttCommandEnabledBox = document.getElementById('stt-comand-custom')
      let chatbotEnabledBox = document.getElementById('chatbot-custom')
      let dictationEnabledBox = document.getElementById('dictation-custom')
      this.applicationSettings = {
        language: this.sttServiceLanguage.value,
        command: {
          enabled: sttCommandEnabledBox.checked,
          value: !sttCommandEnabledBox.checked ? '' : this.sttCommandService.value
        },
        streaming: {
          enabled: dictationEnabledBox.checked,
          internal: this.largeVocabStreaming.value === 'external' ? 'false' : 'true',
          value: this.largeVocabStreaming.value === 'external' ? this.sttLVOnlineExternalService.value : this.largeVocabStreaming.value
        },
        chatbot: {
          enabled: chatbotEnabledBox.checked,
          value: !chatbotEnabledBox.checked ? '' : this.chatbot.value
        },
        tock: {
          value: this.tockApplicationName.value
        }
      }
    },
    async handleForm () {
      let sttCommandEnabledBox = document.getElementById('stt-comand-custom')
      let chatbotEnabledBox = document.getElementById('chatbot-custom')
      let dictationEnabledBox = document.getElementById('dictation-custom')
      
      // Test workflow name
      this.$options.filters.testName(this.applicationName) // Test if workflow name is valid
      
      // Test STT language
      this.$options.filters.testSelectField(this.sttServiceLanguage)


      // Test Tock application name 
      this.$options.filters.testSelectField(this.tockApplicationName)

      if (this.applicationDescription.value.length > 0) {
       this.$options.filters.testContent(this.applicationDescription)
      } else {
        this.applicationDescription.valid = true
      }
      this.updateSettings()

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
        if(this.largeVocabStreaming.value === 'external') {
          this.$options.filters.notEmpty(this.sttLVOnlineExternalService)
        }
        this.$options.filters.testSelectField(this.largeVocabStreaming)
        
      } else {
        this.largeVocabStreaming = {
          value: '',
          error: null,
          valid: false
        }
      }

      if (this.formValid) {
        await this.updateWorkflowSettings(this.applicationSettings)
      }
    },
    async updateWorkflowSettings (settings) {
     const payload = {
        applicationName: this.applicationName.value,
        applicationDescription: this.applicationDescription.value,
        settings,
        type: this.applicationType
      }
      try {
        const updateWorkflow = await axios(`${process.env.VUE_APP_URL}/api/workflows/${this.applicationId}/services/multiuser`, {
          method: 'patch',
          data: { payload }
        })
        if (updateWorkflow.data.status === 'success') {
            bus.$emit('update_workflow_services_success', {})
            bus.$emit('app_notif', {
              status: 'success',
              msg: updateWorkflow.data.msg,
              timeout: 3000,
              redirect: false
            })
            this.closeModal()

        } else {
          throw updateWorkflow
        }
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: 'Error on updating workflow',
          timeout: false,
          redirect: false
        })
      }
    },
    async refreshStore () {
      try {
        await this.dispatchStore('getMultiUserApplications')
        await this.dispatchStore('getSttServices')
        await this.dispatchStore('getSttLanguageModels')
        await this.dispatchStore('getTockApplications')
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
          case 'getSttServices':
              this.sttServicesLoaded = dispatchSuccess
              break
          case 'getTockApplications': 
            this.tockApplicationsLoaded = dispatchSuccess
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
    AppInput,
    AppSelect,
    AppTextarea,
    AppFormLabel
  }
}
</script>