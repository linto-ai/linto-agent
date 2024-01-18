<template>
  <div
    id="iframe-container"
    :class="fullScreen ? 'iframe--fullscreen' : 'iframe--default'"
    class="flex1 flex col"
  >
    <div class="iframe__controls flex row">
      <div class="flex1 flex row iframe__controls-left">
        <button
          class="button button-icon button--with-desc  button--blue"
          :class="fullScreen ? 'enabled' : 'disabled'"
          @click="toggleFullScreen()"
          :data-desc="fullScreen ? 'Leave full screen' : 'Full screen'"
          style="margin-right: 10px;"
        ><span class="button__icon" :class="fullScreen ? 'button__icon--leave-fullscreen' : 'button__icon--fullscreen'"></span></button>
      </div>
      <div class="flex1 flex row iframe__controls-right">

        <!-- Save and publish -->
        <button
          class="button button-icon-txt button--valid"
          @click="saveAndPublish()"
          v-if="contextFrame !== 'sandbox'"
        >
          <span class="button__icon button__icon--publish"></span>
          <span class="button__label">Save and publish</span>
        </button>
      </div>
    </div>
    <AppIframe
      :iframeUrl="iframeUrl"
      :key="refresh"
    ></AppIframe>
  </div>
</template>
<script>
import axios from 'axios'
import { bus } from '../main.js'
import AppIframe from '@/components/AppIframe.vue'
export default {
  props: ['contextFrame','blsurl','noderedFlowId','workflowId', 'workflowName'],
  data () {
    return {
      iframeUrl: '',
      fullScreen: false,
      payload: {},
      refresh: 1
    }
  },
  mounted () {
    if (this.blsurl !== null && typeof(this.blsurl) !== 'undefined') {
      this.iframeUrl = this.blsurl
      
    } else {
      this.iframeUrl = process.env.VUE_APP_NODERED
    }

    //'contextFrame','blsurl','noderedFlowId','wokflowId'
    if (!!this.contextFrame) {
      this.payload.contextFrame = this.contextFrame
    }
    if (!!this.blsurl) {
      this.payload.blsurl = this.blsurl
    }
    if (!!this.noderedFlowId) {
      this.payload.noderedFlowId = this.noderedFlowId
    }
    if (!!this.workflowId) {
      this.payload.workflowId = this.workflowId
    }
    if (!!this.workflowName) {
      this.payload.workflowName = this.workflowName
    }

    bus.$on('iframe_reload', () => {
        this.refresh++
    })
    
  },
  methods: {
    toggleFullScreen () {
      this.fullScreen = !this.fullScreen
      if (this.fullScreen) {
        bus.$emit('iframe-set-fullscreen', {})
      } else {
        bus.$emit('iframe-unset-fullscreen', {})
      }
    },
    SaveAsWorkflowTemplate () {
      bus.$emit('save_as_workflow_template', {payload: this.payload})
    },
    showTemplateList () {
      bus.$emit('manage_workflow_templates', {})
    },
    async saveAndPublish () {
      try {
        if (this.payload.contextFrame === 'staticWorkflow') {
          this.payload.type = 'static'
        } else if  (this.payload.contextFrame === 'applicationWorkflow') {
          this.payload.type = 'application'
        }
        const saveAndPublish = await axios(`${process.env.VUE_APP_URL}/api/workflows/saveandpublish`, {
            method: 'post',
            data: { payload: this.payload }
          })
          if (saveAndPublish.data.status === 'success') {
            bus.$emit('app_notif', {
              status: 'success',
              msg: saveAndPublish.data.msg,
              timeout: 3000,
              redirect: false
            })
            bus.$emit('iframe_reload', {})
          } else {
            throw saveAndPublish
        }
      } catch (error) {
        console.error(error)
        bus.$emit('app_notif', {
          status: 'error',
          msg: !!error.data.msg ? error.data.msg : error,
          timeout: false,
          redirect: false
        })
      }
    }
  },
  components: {
    AppIframe
  }
}
</script>
