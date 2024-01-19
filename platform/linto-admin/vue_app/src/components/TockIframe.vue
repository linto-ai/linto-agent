<template>
  <div 
    id="iframe-container"
    :class="fullScreen ? 'iframe--fullscreen' : 'iframe--default'"
    class="flex1 flex col"
  >
    <div class="iframe__controls flex row">
      <div class="flex1 flex row iframe__controls-left">
        <button
          class="button button-icon button--with-desc button--blue"
          :class="fullScreen ? 'enabled' : 'disabled'"
          @click="toggleFullScreen()"
          :data-desc="fullScreen ? 'Leave full screen' : 'Full screen'"
        ><span class="button__icon" :class="fullScreen ? 'button__icon--leave-fullscreen' : 'button__icon--fullscreen'"></span></button>
      </div>
    </div>
    <iframe
      :src="tockUrl"
      id="nodered-iframe"
      class="iframe flex1"
    ></iframe>
  </div>
</template>
<script>
import { bus } from '../main.js'
import axios from 'axios'
export default {
  props: ['tockUrl'],
  data () {
    return {
      fullScreen: false,
    }
  },
  methods: {
    toggleFullScreen () {
      this.fullScreen = !this.fullScreen
      if (this.fullScreen) {
        bus.$emit('iframe-set-fullscreen', {})
      } else {
        bus.$emit('iframe-unset-fullscreen', {})
      }
    }
  }
}
</script>
