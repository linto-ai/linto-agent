<template>
  <div v-if="dataLoaded">
    <h1>Tock interface</h1>
    <details open class="description">
      <summary>Infos</summary>
      <span>The Natural Language Understanding is managed by an embedded application called “Tock”. You will have to log in to the Tock application to be able to manage or edit NLU rules. <br/>You can access the Tock application directly on <a :href="tockUrl" target="_blank">{{ tockUrl }}</a>.<br/>
      <strong>Please log in with the following credentials :</strong>
      <ul>
        <li>Login : <strong>{{ tockUser }}</strong> </li>
        <li>Password : <strong>{{ tockPassword }}</strong></li>
      </ul>
      For more informations about node-red workflows, please read the <a href="https://doc.linto.ai/" target="_blank">documentation</a>.
      </span>
    </details>
    <div class="block block--transparent block--no-margin block--no-padding flex1 flex">
      <TockIframe v-if="tockUp" :tockUrl="tockUrl"></TockIframe>
    </div>
  </div>
  <div v-else>Loading...</div>
</template>
<script>
import { bus } from '../main.js'
import axios from 'axios'
import TockIframe from '@/components/TockIframe.vue'
export default {
  data () {
    return {
      tockUp: false,
      tockUrl: process.env.VUE_APP_TOCK_URL,
      tockUser: process.env.VUE_APP_TOCK_USER,
      tockPassword: process.env.VUE_APP_TOCK_PASSWORD
    }
  },
  async mounted () {
    await this.isTockUp()
  },
  computed: {
    dataLoaded () {
      return this.tockUp
    }
  },
  methods: {
    async isTockUp () {
      try {
        const connectTock = await axios(`${process.env.VUE_APP_URL}/api/tock/healthcheck`)
        if (connectTock.data.status === 'success') {
          this.tockUp = true
          this.tockUrl = process.env.VUE_APP_TOCK_URL
        } else {
          throw 'Cannont connect Tock interface'
        }
      } catch (error) {
        bus.$emit('app_notif', {
          status: 'error',
          msg: 'Cannot connect Tock interace',
          timeout: false
        })
      }
    }
  },
  components: {
    TockIframe
  }
}
</script>
