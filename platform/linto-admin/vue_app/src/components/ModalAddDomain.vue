<template>
  <div class="modal-wrapper" v-if="modalVisible">
    <div class="modal">
      <!-- HEADER -->
      <div class="modal-header flex row">
        <span class="modal-header__tilte flex1">Add a domain</span>
        <button class="button button-icon button--red" @click="closeModal()">
          <span class="button__icon button__icon--close"></span>
        </button>
      </div>
      <!-- End HEADER -->
      <!-- BODY -->
      <div class="modal-body flex col" v-if="dataLoaded">
        <div class="modal-body__content flex col" >
          <p>Please enter a <strong>domain origin url</strong>: </p>
          <div class="flex col">
            <AppInput :label="'Origin url'" :obj="webappHost" :test="'testUrl'"></AppInput>
          </div>
        </div>
      </div>
      <!-- End BODY -->
      <!-- FOOTER -->
      <div class="modal-footer flex row">
        <div class="flex flex1 modal-footer-right">
          <button class="button button-icon-txt button--green" @click="handleForm()">
            <span class="button__icon button__icon--apply"></span>
            <span class="button__label">Create domain</span>
          </button>
        </div>
      </div>
    <!-- End FOOTER -->
    </div>
  </div>
</template>
<script>
import AppInput from '@/components/AppInput.vue'
import { bus } from '../main.js'
import axios from 'axios'
export default {
  data () {
    return {
      modalVisible: false,
      webappHost: {
        value:'',
        error: null,
        valid: false
      },
      webappHostsLoaded: false
    }
  },
  async mounted () {
    bus.$on('add_webapp_host', async (data) => {
      this.showModal()
      await this.refreshStore()
    })
  },
  computed: {
    dataLoaded () {
      return this.webappHostsLoaded
    },
    webappHosts () {
      return this.$store.state.webappHosts
    },
    formValid () {
      return this.webappHost.valid
    }
  },
  methods: {
    showModal () {
      this.modalVisible = true
      // Reset values
      this.webappHost = {
        value:'',
        error: null,
        valid: false
      }
    },
    closeModal () {
      this.modalVisible = false
    },
    async handleForm () {
      this.$options.filters.testUrl(this.webappHost)
      if (this.formValid) {
        await this.createWebappHost()
      }
    },
    async createWebappHost () {
      try {
        const payload = {
          originUrl: this.webappHost.value
        }
        const createWebappHost = await axios(`${process.env.VUE_APP_URL}/api/webapphosts`, { 
            method: 'post',
            data: { payload }
        })
        if (createWebappHost.data.status === 'success') {
          this.closeModal()
          bus.$emit('app_notif',{
            status: 'success',
            msg: createWebappHost.data.msg,
            timeout: 3000,
            redirect: false
          })
          bus.$emit('add_webapp_host_success', {})
        }
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: !!error.msg ? error.msg : 'Error on creating web-app host',
          timeout: false,
          redirect: false
        })
      }
    },
    async refreshStore () {
      try {
        await this.dispatchStore('getWebappHosts')
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
    AppInput
  }
}
</script>