<template>
  <div class="modal-wrapper" v-if="modalVisible">
    <div class="modal">
      <!-- HEADER -->
      <div class="modal-header flex row">
        <span class="modal-header__tilte flex1">Create an user</span>
        <button class="button button-icon button--red" @click="closeModal()">
          <span class="button__icon button__icon--close"></span>
        </button>
      </div>
      <!-- End HEADER -->
      <!-- BODY -->
      <div class="modal-body flex col">
        <div class="modal-body__content flex col">
          <AppInput :label="'User email'" :obj="userEmail" :test="'testAndroidUserEmail'"></AppInput>
          <AppInput :label="'Password'" :obj="userPswd" :test="'testPassword'" :type="'password'"></AppInput>
          <AppInput :label="'Password confirmation'" :obj="userPswdConfirm" :test="'testPasswordConfirm'" :compare="userPswd" :type="'password'"></AppInput>
          <div class="flex col">
            <span class="form__label">Select applications :</span>
            <table class="table">
              <thead>
                <tr>
                  <th>Add</th>
                  <th>Application name</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="app in applicationWorkflows" 
                  :key="app._id"
                  :class="userApps.value.indexOf(app._id) >= 0 ? 'active' : ''"
                >
                  <td><input type="checkbox" name="app-wf" :value="app._id" @change="selectApp($event, app._id)"></td>
                  <td><strong>{{app.name}}</strong></td>
                  <td><span>{{!!app.description && app.description.length > 0 ? app.description : 'No descritpion' }}</span></td>
                </tr>
              </tbody>
            </table>
           <span class="form__error-field">{{ userApps.error }}</span>
          </div>
        </div>
      </div>
      <!-- End BODY -->
      <!-- FOOTER -->
      <div class="modal-footer flex row">
        <div class="flex flex1 modal-footer-right">
          <button class="button button-icon-txt button--green" @click="handleForm()">
            <span class="button__icon button__icon--apply"></span>
            <span class="button__label">Create user</span>
          </button>
        </div>
      </div>
    <!-- End FOOTER -->
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
      userApps: {
        value: []
      },
     androidUsersLoaded: false,
     applicationWorkflowsLoaded: false
    }
  },
  async mounted () {
    bus.$on('add_android_user', async (data) => {
      this.showModal()
      await this.refreshStore()
    })
  },
  computed: {
    androidUsers () {
      return this.$store.state.androidUsers
    },
    applicationWorkflows () {
      return this.$store.state.multiUserApplications
    },
    formValid () {
      return (this.userEmail.valid && this.userPswd.valid && this.userPswdConfirm.valid)
    }
  },
  watch: {
    'userEmail.value' (data) {
      this.userEmail.value = data.toLowerCase()
    }
  },
  methods: {
    showModal () {
      this.modalVisible = true
      this.userEmail = {
        value: '',
        error: null,
        valid: false
      }
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
      this.userApps = {
        value: []
      }
    },
    closeModal () {
      this.modalVisible = false
    },
    selectApp (event, appId) {
      if (event.srcElement.checked) {
        this.userApps.value.push(appId)
      } else {
        this.userApps.value.pop(appId)
      }
    },
    async handleForm () {
      this.$options.filters.testAndroidUserEmail(this.userEmail)
      this.$options.filters.testPassword(this.userPswd)
      this.$options.filters.testPasswordConfirm(this.userPswdConfirm, this.userPswd)
     
      if (this.formValid) {
        await this.addAndroidUser()
      } 
    },
    async addAndroidUser () {
      try {
        const payload = {
          email: this.userEmail.value,
          pswd: this.userPswd.value,
          applications: this.userApps.value
        }

        const addUser = await axios(`${process.env.VUE_APP_URL}/api/androidusers`, {
          method: 'post',
          data: { payload }
        })  
        if (addUser.data.status === 'success') {
          this.closeModal()
          await this.refreshStore()
          bus.$emit('app_notif', {
            status: 'success',
            msg: addUser.data.msg,
            timeout: 3000,
            redirect: false
          }) 
        }
        else {
          throw addUser.data.msg
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
    async refreshStore () {
      try {
        await this.dispatchStore('getAndroidUsers')
        await this.dispatchStore('getMultiUserApplications')
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
          case 'getAndroidUsers':
            this.androidUsersLoaded = dispatchSuccess
            break
          case 'getMultiUserApplications':
            this.applicationWorkflowsLoaded = dispatchSuccess
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
    AppSelect,
    AppInput
  }
}
</script>