<template>
   <div v-if="dataLoaded">
    <h1>Skills manager</h1>
    <div class="flex col">
      <!-- Setup lists -->
      <div class="flex row">
        <!-- Installed skills -->
        <div class="flex col flex1" style="margin-right: 40px;">
          <h2>Installed skills</h2>
          <div class="skills-list-container flex col flex1">
            <table class="skills-list" v-if="installedNodes.length > 0">
              <thead>
                <tr>
                  <th>Skill id</th>
                  <th colspan>version</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="node in installedNodes" :key="node.module">
                  <td 
                    class="skill--id"
                  ><span>{{ node.module }}</span></td>
                  <td>{{ node.version }} </td>
                  <td class="center">
                    <button class="button button-icon-txt button--red install" @click="uninstallNode($event, node.module)" v-if="node.local === true">
                      <span class="button__icon button__icon--close"></span>
                      <span class="button__label">Uninstall</span>
                    </button>
                    <button class="button button-icon-txt button--grey install button--with-desc bottom" data-desc="can't be uninstalled" v-else>
                      <span class="button__icon button__icon--close"></span>
                      <span class="button__label">Uninstall</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="no-content" v-else>No linto skill installed...</div>
          </div>
        </div>
        <!-- Available skills -->
        <div class="flex col flex1">
          <h2>Available skills</h2>
          <div class="skills-list-container flex col flex1">
            <table class="skills-list" v-if="lintoSkillsToInstall.length > 0">
              <thead>
                <tr>
                  <th>Skill id</th>
                  <th colspan="2">version</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="node in lintoSkillsToInstall" :key="node.package.name">
                  <td 
                    class="skill--id desc"
                  ><span :data-desc="!!node.package.description ? node.package.description : 'no description'">{{ node.package.name }}</span></td>
                  <td>{{ node.package.version }} </td>
                  <td class="center">
                    <button class="button button-icon-txt button--green install" @click="installNode($event, node.package.name)">
                      <span class="button__icon button__icon--install"></span>
                      <span class="button__label">Install</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="no-content" v-else>No more linto skill available...</div>
          </div>
        </div>
      </div>
      
      <!-- Import skill form -->
      <div class="flex row">
        <!-- Local skills -->
        <div class="flex col flex1" style="margin-right: 40px;">
          <h2>Local skills</h2>
          <div class="skills-list-container flex col flex1">
            <table class="skills-list" v-if="localSkills.length > 0">
              <thead>
                <tr>
                  <th>Skill id</th>
                  <th colspan>version</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="localSkill in localSkills" :key="localSkill._id">
                  <td 
                    class="skill--id"
                  ><span>{{ localSkill.name }}</span></td>
                  <td>{{ localSkill.version }} </td>
                  <td class="center">
                    <button class="button button-icon-txt button--red install" @click="uninstallLocalNode($event, localSkill)">
                      <span class="button__icon button__icon--close"></span>
                      <span class="button__label">Uninstall</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="no-content" v-else>No local skill installed...</div>
          </div>
        </div>
        <div class="flex col flex1">
          <h2>Import a skill</h2>
          <p><strong>Import your own skills locally by uploading ".zip" or ".tar.gz" file:</strong></p>
          <div class="flex row" style="margin-bottom:10px;">
            <div class="input-file-container flex col">
              <input 
                type="file" 
                id="file" 
                ref="file"
                class="input__file" 
                v-on:change="handleFileUpload()"
                accept=".zip,.tar.gz"
              />
              <label for="file" class="input__file-label-btn" :class="skillFile.error !== null ? 'error' : ''">
                <span class="input__file-icon"></span>
                <span class="input__file-label">{{ fileUploadLabel }}</span>
              </label>
            </div>
            <div class="flex col" style="justify-content:flex-end;">
              <button class="button button-icon-txt button--green install" @click="instalLocalSkill($event)">
                <span class="button__icon button__icon--install"></span>
                <span class="button__label">Install</span>
              </button>
            </div>
          </div>
          <span class="form__error-field" v-if="skillFile.error !== null">{{skillFile.error }}</span>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    Loading...
  </div>
</template>
<script>
import { bus } from '../main.js'
import axios from 'axios'
export default {
  data () {
    return {
      installedNodesLoaded: false,
      nodeRedCatalogueLoaded: false,
      localSkillsLoaded: false,
      processing: false,
      skillFile: {
        value: null,
        valid: false,
        error: null
      },
      fileUploadLabel: 'Choose a file...'
    }
  },
  async mounted () {
    await this.dispatchStore('getNodeRedCatalogue')
    await this.dispatchStore('getInstalledNodes')
    await this.dispatchStore('getLocalSkills')
  },
  computed: {
    dataLoaded () {
      return this.nodeRedCatalogueLoaded && this.installedNodesLoaded && this.localSkillsLoaded
    },
    lintoSkillsAvailable () {
      return this.$store.state.nodeRedCatalogue
    },
    installedNodes () {
      let installed = this.$store.getters.LINTO_SKILLS_INSTALLED
      if (this.localSkillsLoaded && this.localSkills.length > 0) {
        let filterLocal = []
        for(let node of installed){
          let isLocal = this.localSkills.filter( ls => ls.name === node.module)
          if(isLocal.length === 0) {
            filterLocal.push(node)
          }
        }
        return filterLocal
      } else {
        return installed
      }
    },
    lintoSkillsToInstall () {
      let skills = []
      if (this.dataLoaded) {
        if (this.lintoSkillsAvailable.length > 0 && this.installedNodes.length > 0) {
          this.lintoSkillsAvailable.map(lintoSkill => {
            let isInstalled = this.installedNodes.filter(node => node.module.indexOf(lintoSkill.package.name) >= 0 && node.version >= lintoSkill.package.version)
            if (isInstalled.length === 0) {
              skills.push(lintoSkill)
            }
          })
        }
        return skills
      } else {
        return []
      }
    },
    localSkills () {
      return this.$store.state.localSkills
    }
  },
  methods: {
    
    async dispatchStore (topic) {
      try {
        const dispatch = await this.$options.filters.dispatchStore(topic)
        const dispatchSuccess = dispatch.status == 'success' ? true : false
        if (dispatch.status === 'error') {
          throw dispatch.msg
        }
        switch(topic) {
          case 'getNodeRedCatalogue':
            this.nodeRedCatalogueLoaded = dispatchSuccess
            break
          case 'getInstalledNodes':
            this.installedNodesLoaded = dispatchSuccess
            break
            case 'getLocalSkills':
            this.localSkillsLoaded = dispatchSuccess
            break
          default:
            return
        }
      } catch (error) {
        console.error(error)
        bus.$emit('app_notif', {
          status: 'error',
          msg: error.error,
          timeout: false,
          redirect: false
        })
      }
    },
    setBtnLoading (event) {
      const btn = event.target
      let parent = null
      let target = null
      if (btn.classList.contains('button__icon') || btn.classList.contains('button__label')) {
        parent = event.target.offsetParent
      } else {
        parent = event.target
      }
      if (!!parent.childNodes && parent.childNodes.length > 0) {
        for(let child of parent.childNodes) {
          if(child.classList.contains('button__icon')) {
            target = child
          }
        }
      }
      if (target !== null) {
        target.classList.add('button__icon--loading')
      }
    },
    unsetBtnLoading () {
      const installBtns = document.getElementsByClassName('button__icon--loading')
      if(installBtns.length > 0) {
        for (let i = 0; i < installBtns.length; i++) {
          installBtns[i].classList.remove('button__icon--loading')
        }
      }
    },
    /* Install local skill */
    handleFileUpload() {
      this.skillFile.value = this.$refs.file.files[0]
      const acceptedTypes = ['application/zip', 'application/x-tar', 'application/x-gtar']
      if (typeof(this.skillFile.value) !== 'undefined' && this.skillFile.value !==  null && !!this.skillFile.value.type) {
        
        const type = this.skillFile.value.type
        if (acceptedTypes.indexOf(type) >= 0) {
          this.skillFile.valid = true
          this.skillFile.error = null
          this.fileUploadLabel = '1 file selected'
        } else {
          this.skillFile.valid = false
          this.skillFile.error = 'Invalid file type (accept .zip, .tar, .tar.gz)'
          this.fileUploadLabel = 'Choose a file...'
        }
      } else {
          this.skillFile.valid = false
          this.skillFile.error = 'This field is required'
          this.fileUploadLabel = 'Choose a file...'
      }
    },
    async instalLocalSkill (event) {
     this.handleFileUpload()
     try {
      if (this.skillFile.valid && !this.processing) {
        this.processing = true
        this.setBtnLoading(event)
        
        let formData = new FormData()
        formData.append('files', this.skillFile.value)
        const installSkill = await axios.post(`${process.env.VUE_APP_NODERED_RED}/node/file`,
          formData, 
          {
            headers: {
              'charset': 'utf-8',
              'Content-Type': 'multipart/form-data'
            }
          }
        )
        if (installSkill.status === 202) { // module already installed
          bus.$emit('app_notif', {
            status: 'error',
            msg: 'this module is already installed',
            timeout: 3000,
            redirect: false
          })
          this.processing = false
          this.unsetBtnLoading()

        } else if (installSkill.status === 200) { // success
          let payload = {
            name: installSkill.data.name,
            version: installSkill.data.version
          }
          const updateLocalSkills = await axios(`${process.env.VUE_APP_URL}/api/localskills`, {
            method:'post',
            data: payload
          })
          if(updateLocalSkills.data.status === 'success') {
             bus.$emit('app_notif', {
              status: 'success',
              msg: updateLocalSkills.data.msg,
              timeout: 3000,
              redirect: false
            })
            await this.dispatchStore('getLocalSkills')
            this.unsetBtnLoading()
            this.processing = false

          } else {
            throw installNode
          }
        } else {
          throw installSkill
        }
      }
    } catch (error) {
        console.error(error)
        if (!!error.data) {
          bus.$emit('app_notif', {
            status: 'error',
            msg: error.data.msg,
            timeout: 3000,
            redirect: false
          })
        } else {
          bus.$emit('app_notif', {
            status: 'error',
            msg: `error on installing local skill`,
            timeout: 3000,
            redirect: false
          })
        }
        await this.dispatchStore('getLocalSkills')
        this.unsetBtnLoading()
        this.processing = false
      }
    },
    async uninstallLocalNode (event, localSkill) {
      if (!this.processing) {
        try {
          await this.uninstallNode(event, localSkill.name)

          const removeFromDb = await axios(`${process.env.VUE_APP_URL}/api/localskills/${localSkill._id}`, {
            method: 'delete',
            data: {
              name: localSkill.name
            }
          })

          if (removeFromDb.data.status === 'success') {
            bus.$emit('app_notif', {
              status: 'success',
              msg: removeFromDb.data.msg,
              timeout: 3000,
              redirect: false
            })
            await this.dispatchStore('getLocalSkills')
            this.unsetBtnLoading()
            this.processing = false
          } else {
            throw removeFromDb
          }
        } catch (error) {
          console.error(error)
          if (!!error.data) {
            bus.$emit('app_notif', {
              status: 'error',
              msg: error.data.msg,
              timeout: 3000,
              redirect: false
            })
          } else {
            bus.$emit('app_notif', {
              status: 'error',
              msg: `error on uninstalling local skill`,
              timeout: 3000,
              redirect: false
            })
          }
          await this.dispatchStore('getLocalSkills')
          this.unsetBtnLoading()
          this.processing = false
        }
      }
    },
    /* Install skill via catalogue */
    async installNode (event, nodeId) {
      try {
        if (!this.processing) {
          this.processing = true
          this.setBtnLoading(event)
          const installNode = await axios(`${process.env.VUE_APP_URL}/api/flow/node`, {
            method: 'post',
            data: { module: nodeId }
          })
          if (installNode.data.status === 'success') {
            bus.$emit('app_notif', {
              status: 'success',
              msg: installNode.data.msg,
              timeout: 3000,
              redirect: false
            })
            await this.dispatchStore('getNodeRedCatalogue')
            await this.dispatchStore('getInstalledNodes')
            this.unsetBtnLoading()
            this.processing = false
          } else {
            throw installNode
          }
        }
      } catch (error) {
        console.error(error)
        if (!!error.data) {
          bus.$emit('app_notif', {
            status: 'error',
            msg: error.data.msg,
            timeout: 3000,
            redirect: false
          })
        } else {
          bus.$emit('app_notif', {
            status: 'error',
            msg: `error on installing skill "${nodeId}"`,
            timeout: 3000,
            redirect: false
          })
        }
        await this.dispatchStore('getNodeRedCatalogue')
        await this.dispatchStore('getInstalledNodes')
        this.unsetBtnLoading()
        this.processing = false
      }
    },
    async uninstallNode (event, nodeId) {
      try {
        if (!this.processing) {
          this.processing = true
          this.setBtnLoading(event)
          const uninstallNode = await axios(`${process.env.VUE_APP_URL}/api/flow/node/remove`, {
            method: 'delete',
            data: { nodeId }
          })
          if (uninstallNode.data.status === 'success') {
            bus.$emit('app_notif', {
              status: 'success',
              msg: uninstallNode.data.msg,
              timeout: 3000,
              redirect: false
            })
            await this.dispatchStore('getNodeRedCatalogue')
            await this.dispatchStore('getInstalledNodes')
            this.unsetBtnLoading()
            this.processing = false
          } else {
            throw uninstallNode
          }
        }
      } catch (error) {
        if (!!error.data) {
          bus.$emit('app_notif', {
            status: 'error',
            msg: error.data.msg,
            timeout: 3000,
            redirect: false
          })
        } else {
          bus.$emit('app_notif', {
            status: 'error',
            msg: `error on installing skill "${nodeId}"`,
            timeout: 3000,
            redirect: false
          })
        }
        await this.dispatchStore('getNodeRedCatalogue')
        await this.dispatchStore('getInstalledNodes')
        this.unsetBtnLoading()
        this.processing = false
      }
    }
  }
}
</script>