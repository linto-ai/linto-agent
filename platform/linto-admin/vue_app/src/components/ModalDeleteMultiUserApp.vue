<template>
  <div class="modal-wrapper" v-if="modalVisible">
    <div class="modal">
      <div class="modal-header flex row">
        <span class="modal-header__tilte flex1">Delete a multi-user application</span>
        <button class="button button-icon button--red" @click="closeModal()">
          <span class="button__icon button__icon--close"></span>
        </button>
      </div>
      <div class="modal-body">
        <div class="modal-body__content">
            Are you sure that you want to <strong>delete</strong> the multi-user application "<strong>{{ applicationWorkflowName }}</strong>" ?
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
          <button class="button button-icon-txt button--red" @click="removeApplicationWorkflow()">
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
      applicationWorkflowId: null,
      applicationWorkflowName: null,
      flowId: null
    }
  },
  mounted () {
    bus.$on('delete_application_workflow', (data) => {
      this.applicationWorkflowId = data._id,
      this.applicationWorkflowName = data.name
      this.flowId = data.flowId
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
    async removeApplicationWorkflow () {
      try {

        // Step 1: remove application from android users in DB
        const removeUsers = await this.removeApplicationFromAndroidUsers()
        // Step 2: remove application from web-app hosts in DB
        const removeFromHosts = await this.removeApplicationFromWebappHosts()
        // Step 3: remove BLS flow > "Success" NOT REQUIRED
        const removeFlow = await this.removeBLSFlow(this.flowId)
        // Step 4: Remove application workflow from DB 
        const removeApplication = await this.removeApplication(this.applicationWorkflowId)
         
         // success
        if(removeApplication === 'success') {
          bus.$emit('app_notif', {
            status: 'success',
            msg: `The application workflow "${this.applicationWorkflowName}" has been removed`,
            timeout: 3000,
            redirect: false
          })
          bus.$emit('delete_application_workflow_success', {})
          this.closeModal()
        }
      } catch (error) {
        console.error(error)
      }
    },
    async removeApplication (flowId) {
      try {
        const removeApp = await axios(`${process.env.VUE_APP_URL}/api/workflows/application/${flowId}`, {
          method: 'delete',
          data: { workflowName: this.applicationWorkflowName }
        })

        if (removeApp.data.status === 'success') {
          return 'success'
        } else {
          throw 'Error on deleting application workflow from database'
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
    },
    async removeBLSFlow (flowId) {
      try {
        const removeBLSFlow = await axios(`${process.env.VUE_APP_URL}/api/flow/${flowId}`, {
          method: 'delete'
        })
        if (removeBLSFlow.data.status === 'success') {
          return 'success'
        } else {
          throw 'Error on deleting application workflow from Business logic server'
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
    },
    async removeApplicationFromAndroidUsers () {
      try {
        const payload = {
          _id: this.applicationWorkflowId,
          name: this.applicationWorkflowName
        }
        const removeUserFromApp = await axios(`${process.env.VUE_APP_URL}/api/androidusers/applications`, {
          method: 'patch',
          data: { payload }
        })
        
        if (removeUserFromApp.data.status === 'success') {
          return 'success'
        } else {
          throw removeUserFromApp.data.msg
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
    },
     async removeApplicationFromWebappHosts () {
      try {
        const payload = {
          _id: this.applicationWorkflowId,
          name: this.applicationWorkflowName
        }
        const removeAppFromHost = await axios(`${process.env.VUE_APP_URL}/api/webapphosts/applications`, {
          method: 'patch',
          data: { payload }
        })
        
        if (removeAppFromHost.data.status === 'success') {
          return 'success'
        } else {
          throw removeAppFromHost.data.msg
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