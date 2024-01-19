<template>
  <div id="app-notif-top" :class="showNotif ? 'opened' : 'closed'" v-if="dataLoaded && generating.length > 0">
    <div class="flex row">
      <div class="flex row">
        <h3 class="flex">Language models currently being generated</h3>
      </div>
      <div id="app-notif-top-data" class="flex row">
        <table class="model-generating-table">
          <tbody v-if="generating.length > 0">
            <tr v-for="model in generating" :key="model.sttServiceName">
              <td class="model-generating__label">{{ model.sttServiceName }}</td>
              <td>
                <div class="model-generating__prct-wrapper">
                  <div class="model-generating__prct-value" :style="`width:${model.prct}%;`"></div>
                  <span class="model-generating__prct-label">{{ model.prct }}%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex row">
        <button id="model-generating-refresh" class="button button-icon button--bluemid button--with-desc" data-desc="Refresh" @click="refreshStore()" style="margin-left: 10px;">
          <span class="button__icon button__icon--reset"></span>
        </button>
      </div>
    </div>
    <button id="close-notif-top" class="button button-icon button--bluedark" @click="hideNotif()">
      <span class="button__icon button__icon--arrow" :class="showNotif ? 'opened' : 'closed'"></span>
    </button>
  </div>
</template>
<script>
import { bus } from '../main.js'
export default {
  data () {
    return {
      showNotif: false,
      sttServicesLoaded: false,
      sttLanguageModelsLoaded: false,
      generating: []
    }
  },
  async mounted () {
    await this.refreshStore()
  },
  computed: {
    dataLoaded () {
      return this.sttServicesLoaded && this.sttLanguageModelsLoaded
    },
    sttServices () {
      return this.$store.getters.STT_SERVICES_AVAILABLE
    },
    sttLanguageModels () {
      return this.$store.state.sttLanguageModels
    }
  },
  watch: {
    'sttServices.generating' (data) {
      let generating = []
      if(data.cmd.length > 0) {
        data.cmd.map(cmd => {
          generating.push({
            sttServiceName: cmd.serviceId,
            prct: cmd.langModel.updateState
          })
        })
      }
      if(data.lvOnline.length > 0) {
        data.lvOnline.map(lvOnline => {
          generating.push({
            sttServiceName: lvOnline.serviceId,
            prct: lvOnline.langModel.updateState
          })
        })
      }
      if(data.lvOffline.length > 0) {
        data.lvOffline.map(lvOffline => {
          generating.push({
            sttServiceName: lvOffline.serviceId,
            prct: lvOffline.langModel.updateState
          })
        })
      }
      this.generating = generating
    }
  },
  methods: {
    hideNotif() {
      this.showNotif = !this.showNotif
    },
    async refreshStore () {
      try {
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
