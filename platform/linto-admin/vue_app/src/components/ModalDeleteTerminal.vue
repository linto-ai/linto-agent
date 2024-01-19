<template>
  <div class="modal-wrapper" v-if="modalVisible">
    <div class="modal">
      <div class="modal-header flex row">
        <span class="modal-header__tilte flex1">Delete a device</span>
        <button class="button button-icon button--red" @click="closeModal()">
          <span class="button__icon button__icon--close"></span>
        </button>
      </div>
      <div class="modal-body">
        <div class="modal-body__content">
            Are you sure that you want to <strong>delete</strong> the device with serial number "<strong>{{ sn }}</strong>" ?
        </div>
      </div>
      <div class="modal-footer flex row">
        <div class="flex flex1 modal-footer-left">
          <button class="button button-icon-txt button--grey" @click="closeModal()">
            <span class="button__icon button__icon--cancel"></span>
            <span class="button__label">Cancel</span>
          </button>
        </div>
        <div class="flex flex1 modal-footer-right">
          <button class="button button-icon-txt button--red" @click="deleteStaticDevice(sn)">
            <span class="button__icon button__icon--delete"></span>
            <span class="button__label">Delete</span>
          </button>
        </div>
      </div>
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
      sn: null
    }
  },
  mounted () {
    bus.$on('delete_static_device', (data) => {
      this.sn = data.sn
      this.showModal()
    })
  },
  methods: {
    showModal () {
      this.modalVisible = true
    },
    closeModal () {
      this.modalVisible = false
    },
    async deleteStaticDevice (sn) {
      try { 
        const deleteDevice = await axios(`${process.env.VUE_APP_URL}/api/clients/static/${sn}`, {
          method: 'delete'
        })

        if (deleteDevice.data.status === 'success') {
          bus.$emit('app_notif', {
            status: 'success',
            msg: deleteDevice.data.msg,
            timeout: 3000,
            redirect: false
          })
          this.closeModal()
          bus.$emit('delete_static_device_success', {})
        } else {
          throw deleteDevice.data.msg
        }
      } catch (error) {
        console.error(error)
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