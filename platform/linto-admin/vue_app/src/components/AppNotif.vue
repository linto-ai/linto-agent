<template>
  <div class="notif-wrapper" :class="status.length > 0 ? status : 'closed'">
    <div
      class="notif-container flex row"
      :class="status"
    >
      <span id="notif-icon" class="icon"></span>
      <span id="notif-msg" class="notif-msg" :class="status">{{ msg }}</span>
    </div>
  </div>
</template>
<script>
import { bus } from '../main.js'
export default {
  data () {
    return {
      showNotif: false,
      status: '',
      msg: '',
      animIcon: '',
      animation: null
    }
  },
  mounted () {
    this.animIcon = document.getElementById('notif-icon')
    bus.$on('app_notif', (data) => {
      this.showNotif = true
      this.msg = data.msg
      this.status = data.status
      if (this.animation !== null) {
        this.animIcon.innerHTML = ''
        this.animation.destroy
      }
      setTimeout(() => {
        if (data.status === 'success') {
          this.animateValidIcon()
        } else if (data.status === 'error') {
          this.animateErrorIcon()
        }
      }, 100)
      // Timeout show/hide
      if (!!data.timeout && data.timeout !== null) {
        setTimeout(() => {
          this.showNotif = false
          // Redirect
          if (!!data.redirect && data.timeout !== null) {
            window.location.href = data.redirect
          }
        }, parseInt(data.timeout))
      }
    })
  },
  watch: {
    showNotif (data) {
      if (!data) {
        this.status = ''
        this.msg = ''
      }
    }
  },
  methods: {
    animateValidIcon () {
      this.animation = lottie.loadAnimation({
        container: this.animIcon,
        renderer: 'svg',
        loop: false,
        autoplay: true,
        path: '/assets/animations/validation.json'
      })
    },
    animateErrorIcon () {
      const icon = document.getElementById('notif-icon')
      this.animation = lottie.loadAnimation({
        container: this.animIcon,
        renderer: 'svg',
        loop: false,
        autoplay: true,
        path: '/assets/animations/error.json'
      })
    }
  }
}
</script>