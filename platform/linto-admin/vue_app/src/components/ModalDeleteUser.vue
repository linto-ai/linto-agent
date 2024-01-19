<template>
  <div class="modal-wrapper" v-if="modalVisible && dataLoaded">
    <div class="modal">
      <!-- HEADER -->
      <div class="modal-header flex row">
        <span class="modal-header__tilte flex1">Delete an user</span>
        <button class="button button-icon button--red" @click="closeModal()">
          <span class="button__icon button__icon--close"></span>
        </button>
      </div>
      <!-- End HEADER -->
      <!-- BODY -->
      <div class="modal-body flex col">
        <div class="modal-body__content flex col">
         <p>Are you sure that you want to <strong>delete</strong> the user "<strong>{{ userEmail }}</strong>"</p>
        
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
          <button class="button button-icon-txt button--red" @click="removeUser()">
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
      userId: null,
      userEmail: null
    }
  },
  async mounted () {
    bus.$on('delete_android_user', async (data) => {
      this.showModal()
      this.userId = data.userId
      this.userEmail = data.email
    })
  },
  computed: {
    dataLoaded () {
      return this.userId !== null && this.userEmail !== null
    }
  },
  methods: {
    showModal () {
      this.modalVisible = true
    },
    closeModal () {
      this.modalVisible = false
    },
    async removeUser () {
      try {
        const payload = {
          email: this.userEmail
        }
        const removeUser = await axios(`${process.env.VUE_APP_URL}/api/androidusers/${this.userId}`, {
          method: 'delete',
          data: { payload }
        })
        if (removeUser.data.status === 'success') {
          this.closeModal()
          bus.$emit('delete_android_user_success', {})
          bus.$emit('app_notif', {
            status: 'success',
            msg: removeUser.data.msg,
            timeout: 3000,
            redirect: false
          })
        } else {
          throw removeUser.data.msg
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