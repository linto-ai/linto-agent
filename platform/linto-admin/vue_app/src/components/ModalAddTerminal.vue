<template>
  <div class="modal-wrapper" v-if="modalVisible">
    <div class="modal">
      <div class="modal-header flex row">
        <span class="modal-header__tilte flex1">Add a device</span>
        <button class="button button-icon button--red" @click="closeModal()">
          <span class="button__icon button__icon--close"></span>
        </button>
      </div>
      <div class="modal-body">
        <div class="modal-body__content">
          <p>To create a new device, please register an unused <strong>serial number</strong></p>
          <AppInput :label="'Serial number'" :obj="sn" :test="'testStaticClientsSN'"></AppInput>

        </div>
      </div>
      <div class="modal-footer flex row">
        <div class="flex flex1 modal-footer-right">
          <button class="button button-icon-txt button--green" @click="handleForm()">
            <span class="button__icon button__icon--apply"></span>
            <span class="button__label">Create device</span>
          </button>
        </div>
      </div>
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
      sn: {
        value: '',
        error: null,
        valid: false
      }
    }
  },
  mounted () {
    bus.$on('add_static_device', (data) => {
      this.showModal()
    })
  },
  computed: {
    formValid () {
      return this.sn.valid
    }
  },
  methods: {
    showModal () {
      this.modalVisible = true
      this.sn = {
        value: '',
        error: null,
        valid: false
      }
    },
    closeModal () {
      this.modalVisible = false
    },
    async handleForm () {
      this.$options.filters.testStaticClientsSN(this.sn)
      if (this.sn.error === null) {
        this.$options.filters.testName(this.sn)
      }

      if (this.formValid) {
        await this.addStaticDevice()
      }
    },
    async addStaticDevice () {
      try {
        const payload = {
          sn: this.sn.value
        }
        const addDevice = await axios(`${process.env.VUE_APP_URL}/api/clients/static`, {
          method: 'post',
          data: {payload}
        })
        if (addDevice.data.status === 'success') {
          bus.$emit('app_notif', {
            status: 'success',
            msg: addDevice.data.msg,
            timeout: 3000,
            redirect: false
          })
          this.closeModal()
          bus.$emit('add_static_device_success', {})
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
  },
  components: {
    AppInput
  }
}
</script>