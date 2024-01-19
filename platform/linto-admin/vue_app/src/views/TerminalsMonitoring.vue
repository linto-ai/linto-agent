<template>
  <div v-if="dataLoaded">
    <h1>Device - {{ sn }} - Monitoring</h1>
    <div class="flex col">
      <div class="flex row">
        <div class="flex col flex1">
          <h2>Device informations</h2>
          <div class="flex row">
            <table class="table" v-if="staticClientLoaded">
              <tbody>
                <tr>
                  <td>Serial number</td>
                  <td><strong>{{ staticClient.sn }}</strong></td>
                </tr>
                <tr>
                  <td>Connection status</td>
                  <td>
                    <span 
                      class="icon icon--status"
                      :class="staticClient.connexion"
                    ></span>
                    <span class="icon--status__label" :class="staticClient.connexion === 'online' ? 'label--green' : 'label--red' ">{{ staticClient.connexion }}
                    </span>  
                  </td>
                </tr>
                <tr>
                  <td>Deployed workflow</td>
                  <td>
                    <a :href="`/admin/applications/device/workflow/${staticClient.associated_workflow._id}`" class="button button-icon-txt button--bluemid button--with-desc bottom" data-desc="Edit on Node-red interface">
                      <span class="button__icon button__icon--workflow"></span>
                      <span class="button__label">{{ staticClient.associated_workflow.name }}</span>
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>Last up</td>
                  <td>{{ staticClient.last_up }}</td>
                </tr>
                <tr>
                  <td>Last down</td>
                  <td>{{ staticClient.last_down }}</td>
                </tr>
                <tr>
                  <td>Firmware version</td>
                  <td>{{ !!staticClient.config.firmware ? staticClient.config.firmware : "-" }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="flex col flex1" v-if="staticClient.connexion === 'online'">
          <h2>Interactions</h2>
          <div class="flex col">
            <!-- ping -->
            <div class="flex row device-interaction">
              <button 
                @click="ping()"
                class="button button-icon-txt button--orange">
                <span class="button__icon button__icon--ping" :class="pingClass" ></span>
                <span class="button__label">{{ pingLabel }}</span>
              </button> 
              <span class="ping-status" :class="pingMsgClass">{{ pingMsg}}</span>
            </div>
            <!-- linto say -->
            <div class="flex row device-interaction">
              <AppInput :label="'Make me talk'" :obj="lintoSay" :test="'testContentSay'" @change="testContentSay()"></AppInput>
              <button 
                @click="say()"
                class="button button-icon-txt button--blue"
                style="margin: 23px 0 0 5px;"
              >
                <span class="button__icon button__icon--say"></span>
                <span class="button__label">Say</span>
              </button>
            </div>
            <!-- volume -->
            <div class="flex col device-interaction">
              <span class="form__label">Volume : </span>
              <div class=" flex row" style="margin-top: 5px;">
                <button 
                  class="button button-icon button--with-desc bottom button--bluedark" 
                  @click="isMuted ? unmute() : mute() "
                  :data-desc="isMuted ? 'Unmute' : 'Mute'"
                  style="margin-right: 10px"
                >
                  <span class="button__icon" :class="isMuted ? 'button__icon--unmute' : 'button__icon--mute'"></span>
                </button>
                <input
                    type="range"
                    min="0"
                    max="100"
                    :value="volume"
                    id="range-volume"
                    @input="setVolume($event)"
                    @change="setVolumeEnd($event)"
                  > 
                <span class="volume-status">{{ volume }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 v-if="!!staticClient.config.network">Network Informations</h2>
      <div class="flex row" v-if="!!staticClient.config.network">
        <table class="table" v-if="staticClient.config.network.length > 0">
          <thead>
            <tr>
              <th>Name</th>
              <th>IP address</th>
              <th>MAC address</th>
              <th>Gateway IP</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="net in staticClient.config.network" :key="net.name">
              <td>{{ net.name }}</td>
              <td>{{ net.ip_address }}</td>
              <td>{{ net.mac_address }}</td>
              <td>{{ net.gateway_ip }}</td>
              <td>{{ net.type }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 v-if="!!staticClient.config.mqtt">MQTT settings</h2>
      <div class="flex row" v-if="!!staticClient.config.mqtt">
        <table class="table">
          <tbody>
            <tr>
              <td>Host</td>
              <td>{{ staticClient.config.mqtt.host }}</td>
            </tr>
            <tr>
              <td>Port</td>
              <td>{{ staticClient.config.mqtt.port }}</td>
            </tr>
            <tr>
              <td>Scope</td>
              <td>{{ staticClient.config.mqtt.scope }}</td>
            </tr>
            <tr>
              <td>Login</td>
              <td>{{ staticClient.config.mqtt.username }}</td>
            </tr>
            <tr>
              <td>Password</td>
              <td>{{ staticClient.config.mqtt.password }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <div v-else>Loading...</div>
</template>
<script>
import AppInput from '@/components/AppInput.vue'
export default {
  data () {
    return {
      sn: null,
      staticClientLoaded: false,
      pingClass: '',
      pingLabel: 'Ping',
      pingMsg: '',
      pingMsgClass: '',
      pingDate: '',
      pongDate: '',
      pingProcessing: false,
      pingInt: null,
      lintoSay: {
        value: '',
        error: null,
        validl: false
      },
      volume: 50,
      tmpVolume: 0
    }
  },
  async mounted () {
    this.sn = this.$route.params.sn
    await this.refreshStore()
    setTimeout(() => {
      this.initSocket()
      this.socket.on('linto_pong', async (data) => {
        const topicArray = data.topicArray
        const targetSn = topicArray[2]
        if(this.pingProcessing && targetSn === this.staticClient.sn) {
          this.pongDate = new Date().getTime()
          const timeDiff = this.pongDate - this.pingDate
          this.pingClass = ''
          this.pingLabel = 'Ping'
          this.pingMsgClass = 'success'
          this.pingMsg = `response received in ${timeDiff / 1000} sec.`
          this.pingProcessing = false
          clearTimeout(this.pingInt)
        }
      })
    }, 200)
  },
  computed: {
    dataLoaded () {
      return this.staticClientLoaded
    },
    staticClient () {
      return this.$store.getters.STATIC_CLIENT_BY_SN(this.sn)
    },
    isMuted () {
      return this.volume === 0
    }
  },
  methods: {
    ping () {
      if (!this.pingProcessing) {
        this.socket.emit('tolinto_ping', {sn: this.sn})
        this.pingProcessing = true
        this.pingClass = 'button__icon--loading'
        this.pingLabel = 'Waiting for pong...'
        this.pingMsg = ''
        this.pingMsgClass = ''
        this.pingDate = new Date().getTime()
        this.pingInt = setTimeout(() => {
          this.pingClass = ''
          this.pingLabel = 'Ping'
          this.pingMsgClass = 'error'
          this.pingMsg = 'No response after 5sec.'
          this.pingProcessing = false
        }, 5000)
      }
    },
    say () {
      this.testContentSay()

      if(this.lintoSay.valid) {
        this.socket.emit('tolinto_say', {
          sn: this.sn, 
          value: this.lintoSay.value
        })
      }
    },
    testContentSay () {
      this.$options.filters.testContentSay(this.lintoSay)
    },
    setVolume (e) {
      const volumeValue = e.target.value
      this.volume = volumeValue
      this.socket.emit('tolinto_volume', {
        value: this.volume,
        sn: this.sn
      })
    },
    setVolumeEnd (e) {
      const volumeValue = e.target.value
      this.volume = volumeValue
      this.socket.emit('tolinto_volume_end', {
        value: this.volume,
        sn: this.sn
      })
    },
    mute () {
      const currentVolume = this.volume
      this.tmpVolume = currentVolume
      this.volume = 0
      this.socket.emit('tolinto_mute', {
        sn: this.sn
      })
    },
    unmute () {
      this.volume = this.tmpVolume
      this.socket.emit('tolinto_unmute', {
        sn: this.sn
      })
    },
    initSocket() {
      // Init socket
      this.socket = this.$parent.socket
      // Subscribe to mqtt scope
      this.socket.emit('linto_subscribe', {sn: this.sn})
      // On receiving 'status'
      this.socket.on('linto_status', (data) => {
        const topicArray = data.topicArray
        const targetSn = topicArray[2]
        if(targetSn === this.staticClient.sn) {
          if(!!data.connexion) {
            this.staticClient.connexion = data.connexion
          }
          if(!!data.last_up && data.last_up.length > 0) { 
            this.staticClient.last_up = data.last_up
          }
          if(!!data.last_down) { 
            this.staticClient.last_down = data.last_down
          }
          if(!!data.config) { 
            this.staticClient.config = data.config

            if(!!data.config.sound.volume) {
              this.volume = data.config.sound.volume
            }
          }
        }
      })
    },
    async refreshStore () {
      try {
        await this.dispatchStore('getStaticClients')
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
          case 'getStaticClients':
            this.staticClientLoaded = dispatchSuccess
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
    AppInput
  }
}
</script>
<style scoped>
  .device-interaction {
    padding: 10px;
    border-bottom: 1px solid #ccc;
  }
  .ping-status {
    display: inline-block;
    height: 30px;
    line-height: 30px;
    font-size: 14px;
    font-weight: 600;
    padding-left: 10px;
  }
  .ping-status.success {
    color: #00C0B6;
  }
  .ping-status.error {
    color: #ff7070;
  }
  .volume-status {
    display: inline-block;
    font-size: 16px;
    font-weight: 600;
    padding-left: 10px;
  }
</style>