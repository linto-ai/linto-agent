<template>
  <div class="modal-wrapper" v-if="modalVisible">
    <div class="modal">
      <div class="modal-header flex row">
        <span class="modal-header__tilte flex1">Dissociate a device</span>
        <button class="button button-icon button--red" @click="closeModal()">
          <span class="button__icon button__icon--close"></span>
        </button>
      </div>
      <div class="modal-body">
        <div class="modal-body__content">
            Are you sure that you want to <strong>dissociate</strong> the device with serial number "<strong>{{ sn }}</strong>" and remove the device application "<strong>{{workflow.name }}</strong>" ?
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
          <button class="button button-icon-txt button--red" @click="dissociateStaticDevice(sn, workflow)">
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
      sn: null,
      workflow: null
    }
  },
  mounted () {
    bus.$on('dissociate_static_device', (data) => {
      this.sn = data.sn
      this.workflow = data.workflow
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
    async dissociateStaticDevice (sn, workflow) {
      try {
        const payload = {
          sn
        }
        const dissociateStaticDevice = await axios(`${process.env.VUE_APP_URL}/api/workflows/static/${workflow._id}`, {
          method: 'delete',
          data: { payload }
        })
        if (dissociateStaticDevice.data.status === 'success') {
          bus.$emit('app_notif', {
            status: 'success',
            msg: dissociateStaticDevice.data.msg,
            timeout: 3000,
            redirect: false
          })
          this.closeModal()
          bus.$emit('dissociate_static_device_success', {})
        } else {
          throw dissociateStaticDevice.data.msg
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