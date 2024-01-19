<template>
  <div class="modal-wrapper" v-if="modalVisible && dataLoaded && user !== null">
    <div class="modal">
      <!-- HEADER -->
      <div class="modal-header flex row">
        <span class="modal-header__tilte flex1">Edit an user</span>
        <button class="button button-icon button--red" @click="closeModal()">
          <span class="button__icon button__icon--close"></span>
        </button>
      </div>
      <!-- End HEADER -->
      <!-- BODY -->
      <div class="modal-body flex col">
        <div class="modal-body__content flex col">
          <span class="subtitle">User informations</span>
          <div class="flex row">
            <AppInput :label="'Email'" :obj="userEmail" :test="'testAndroidUserEmail'" :class="'flex2'"></AppInput>
            <div class="flex flex1 row">
              <button class="button button-icon-txt button--green" style="margin: 23px 0 0 10px" @click="updateUserEmail(user)">
                <span class="button__icon button__icon--save"></span>
                <span class="button__label">Save</span>
              </button>
            </div>
          </div>

          <span class="subtitle">Update password</span>
          <div class="flex row">
            <div class="flex col flex2">
              <AppInput :label="'New password'" :obj="userPswd" :test="'testPassword'" :type="'password'"></AppInput>

              <AppInput :label="'Password confirmation'" :obj="userPswdConfirm" :test="'testPasswordConfirm'" :compare="userPswd" :type="'password'"></AppInput>
            </div>
            <div class="flex flex1 row">
               <button class="button button-icon-txt button--green" style="margin: 103px 0 0 10px" @click="updateUserPassword(user)">
                <span class="button__icon button__icon--save"></span>
                <span class="button__label">Save</span>
              </button>
            </div>
          </div>
        </div>
      <!-- End BODY -->
      <!-- FOOTER -->
    <!-- End FOOTER -->
    </div>
    </div>
  </div>
</template>
<script>
import AppInput from '@/components/AppInput.vue'
import AppSelect from '@/components/AppSelect.vue'
import { bus } from '../main.js'
import axios from 'axios'
export default {
  data () {
    return {
      modalVisible: false,
      userId: null,
      androidUsersLoaded: false,
      userEmail: {
        value: '',
        error: null,
        valid: false
      },
      userPswd: {
        value: '',
        error: null,
        valid: false
      },
      userPswdConfirm: {
        value: '',
        error: null,
        valid: false
      },
    }
  },
  async mounted () {
    bus.$on('edit_android_user', async (data) => {
      this.showModal()
      await this.refreshStore()
      this.userId = data.user._id
      this.userEmail.value = data.user.email
      this.userEmail.valid = true
    })
  },
  computed: {
    dataLoaded () {
      return this.androidUsersLoaded
    },
    workflowByName () {
      return this.$store.getters.APP_WORKFLOWS_NAME_BY_ID
    },
    applicationWorkflows () {
      return this.$store.state.multiUserApplications
    },
    user () {
      if(this.userId !== null) {
        return this.$store.getters.ANDROID_USER_BY_ID(this.userId)
      } else {
        return null
      }
    }
  },
  methods: {
    showModal () {
      this.modalVisible = true
    },
    closeModal () {
      this.modalVisible = false
      this.userEmail = {
        value: '',
        error: null,
        valid: false
      }
    },
    async updateUserEmail (user) {
      try {
        this.$options.filters.testAndroidUserEmail(this.userEmail)
        if (this.userEmail.valid) {
          const payload = {
            _id: user._id,
            email: this.userEmail.value
          }

          const updateUser = await axios(`${process.env.VUE_APP_URL}/api/androidusers/${payload._id}`,{
            method: 'put',
            data: { payload }
          })

          if (updateUser.data.status === 'success') {
            bus.$emit('app_notif', {
              status: 'success',
              msg: updateUser.data.msg,
              timeout: 3000,
              redirect: false
            })
            await this.refreshStore()
            this.closeModal()
          } else {
            throw updateUser.data.msg
          }
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
    async updateUserPassword (user) {
      try {
        this.$options.filters.testPassword(this.userPswd)
        this.$options.filters.testPasswordConfirm(this.userPswdConfirm, this.userPswd)
        if (this.userPswd.valid && this.userPswdConfirm.valid) {
          const payload = {
            email: user.email,
            _id: user._id,
            newPswd: this.userPswd.value,
            newPswdConfirmation: this.userPswd.value
          }
          const updateUser = await axios(`${process.env.VUE_APP_URL}/api/androidusers/${user._id}/pswd`, {
            method: 'put',
            data: { payload }
          })

          if (updateUser.data.status === 'success'){
            this.userPswd = {
              value: '',
              error: null,
              valid: false
            }
            this.userPswdConfirm = {
              value: '',
              error: null,
              valid: false 
            }
            bus.$emit('app_notif', {
              status: 'success',
              msg: updateUser.data.msg,
              timeout: 3000,
              redirect: false
            })
            await this.refreshStore()
          } else {
            throw updateUser.data.msg
        }
        } 
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: !!error.msg ? error.msg : error,
          timeout: false,
          redirect: false
        })
      }
    },
    async refreshStore () {
      try {
        await this.dispatchStore('getAndroidUsers')
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
          case 'getAndroidUsers':
            this.androidUsersLoaded = dispatchSuccess
            break
          default:
            return
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
    AppSelect,
    AppInput
  }
}
</script>