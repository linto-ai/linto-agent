<template>
  <div class="modal-wrapper" v-if="modalVisible">
    <div class="modal">
      <div class="modal-header flex row">
        <span class="modal-header__tilte flex1">Update associated device</span>
        <button class="button button-icon button--red" @click="closeModal()">
          <span class="button__icon button__icon--close"></span>
        </button>
      </div>
      <div class="modal-body">
        <div class="modal-body__content">
          <p>You're about to replace the actual device attached to device application "<strong>{{workflow.name}}</strong>". If you want to continue, please select a device in the following list and apply your choice.</p>
          <AppSelect :label="'Select a device'" :obj="targetDevice" :list="availableStaticClients" :params="{key:'_id', value:'sn', optLabel: 'sn'}" :disabled="noStaticDevice" :disabledTxt="'No device available'"></AppSelect>
        </div>
      </div>
      <div class="modal-footer flex row">
        <div class="flex flex1 modal-footer-right">
          <button class="button button-icon-txt button--green" @click="updateStaticDevice()">
            <span class="button__icon button__icon--apply"></span>
            <span class="button__label">Apply</span>
          </button>
        </div>
      </div>
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
      sn: null,
      workflow: null,
      targetDevice: {
        value: '',
        error: null,
        valid: false
      },
      staticClientsLoaded: false
    }
  },
  computed: {
    availableStaticClients () {
      return this.$store.getters.STATIC_CLIENTS_AVAILABLE
    },
    noStaticDevice () {
      return this.availableStaticClients.length === 0
    }
  },
  async mounted () {
    bus.$on('update_enrolled_static_device', async (data) => {
      this.sn = data.sn
      this.workflow = data.workflow
      this.showModal()
      await this.dispatchClients()
    })
  },
  methods: {
    showModal () {
      this.modalVisible = true
      this.targetDevice = {
        value: '',
        error: null,
        valid: false
      }
    },
    closeModal () {
      this.modalVisible = false
    },
    async updateStaticDevice () {
      this.$options.filters.testSelectField(this.targetDevice)
      if (this.targetDevice.valid) {
        try {
          const payload = {
            sn: this.sn,
            workflow: this.workflow,
            targetDevice: this.targetDevice.value
          }
          const updateDevice = await axios(`${process.env.VUE_APP_URL}/api/clients/static/replace`, {
            method: 'post', 
            data: { payload }
          })
          if (updateDevice.data.status === 'success') {
            bus.$emit('app_notif', {
              status: 'success',
              msg: updateDevice.data.msg,
              timeout: 3000,
              redirect: false
            })
            bus.$emit('update_enrolled_static_device', {})
            this.closeModal()
            
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
    async dispatchClients () {
      try {
        const dispatchClients = await this.$options.filters.dispatchStore('getStaticClients')
        if (dispatchClients.status === 'success') {
          this.staticClientsLoaded = true
        }  
      } catch (error) {
         bus.$emit('app_notif', {
            status: 'error',
            msg: !!error.msg ? error.msg : error,
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