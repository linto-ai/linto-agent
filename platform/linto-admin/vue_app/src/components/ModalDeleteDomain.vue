<template>
  <div class="modal-wrapper" v-if="modalVisible && dataLoaded">
    <div class="modal">
      <!-- HEADER -->
      <div class="modal-header flex row">
        <span class="modal-header__tilte flex1">Delete a domain</span>
        <button class="button button-icon button--red" @click="closeModal()">
          <span class="button__icon button__icon--close"></span>
        </button>
      </div>
      <!-- End HEADER -->
      <!-- BODY -->
      <div class="modal-body flex col">
        <div class="modal-body__content flex col">
         <p>Are you sure you want to <strong>delete</strong> the domain: "<strong>{{ webappHost.originUrl }}</strong>"</p>
        
        </div>
      </div>
      <!-- End BODY -->
      <!-- FOOTER -->
      <div class="modal-footer flex row">
        <div class="flex flex1 modal-footer-left">
          <button class="button button-icon-txt button--grey" @click="closeModal()">
            <span class="button__icon button__icon--cancel"></span>
            <span class="button__label">Cancel</span>
          </button>
        </div>
        <div class="flex flex1 modal-footer-right">
          <button class="button button-icon-txt button--red" @click="removeWebappHost()">
            <span class="button__icon button__icon--trash"></span>
            <span class="button__label">Delete</span>
          </button>
        </div>
      </div>
    <!-- End FOOTER -->
    </div>
  </div>
</template>
<script>
import { bus } from '../main.js'
import axios from 'axios'
export default {
  data () {
    return {
      modalVisible: false,
      webappHost: null
    }
  },
  async mounted () {
    bus.$on('delete_webapp_host', async (data) => {
      this.showModal()
      this.webappHost = data.webappHost
    })
  },
  computed: {
    dataLoaded () {
      return this.webappHost !== null
    }
  },
  methods: {
    showModal () {
      this.modalVisible = true
    },
    closeModal () {
      this.modalVisible = false
    },
    async removeWebappHost () {
      try { 
        const payload = {
          originUrl: this.webappHost.originUrl
        }
        const removeWebappHost = await axios(`${process.env.VUE_APP_URL}/api/webapphosts/${this.webappHost._id}`, {
          method: 'delete',
          data: {payload}
        })
        
        if (removeWebappHost.data.status === 'success') {
          this.closeModal()
          bus.$emit('delete_webapp_host_success', {})
          bus.$emit('app_notif', {
            status: 'success',
            msg: removeWebappHost.data.msg,
            timeout: 3000,
            redirect: false
          })
        } else {
          throw removeWebappHost.data.msg
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
  }
}
</script>