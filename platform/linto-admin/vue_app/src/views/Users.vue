<template>
  <div v-if="dataLoaded">
    <h1>Users</h1>
    <div class="flex col">
      <h2>Registered users</h2>
      <div class="flex row">
        <table class="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Applications</th>
              <th>User settings</th>
              <th>Manage applications</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in androidRegisteredUsers" :key="user._id">
              <td><strong>{{ user.email }}</strong></td>
              <td>
                <ul class="array-list" v-if="user.applications.length > 0">
                  <li v-for="app in user.applications" :key="app">
                    {{ workflowByName[app].name }}
                  </li>
                </ul>
                <span class="none" v-else>none</span>
              </td>
              <td class="center">
                <button class="button button-icon-txt button--blue" @click="editAndroidUser(user)">
                  <span class="button__icon button__icon--edit"></span>
                  <span class="button__label">Edit</span>
                </button>
              </td>

              <td class="center">
                <button class="button button-icon-txt button--bluemid" @click="editAndroidUserApplications(user)">
                  <span class="button__icon button__icon--settings"></span>
                  <span class="button__label">Manage</span>
                </button>
              </td>
              <td class="center">
                <button class="button button-icon button--red" @click="deleteAndroidUser(user)">
                  <span class="button__icon button__icon--trash"></span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="divider"></div>
      <div class="flex row">
        <button class="button button-icon-txt button--green" @click="addAndroidUser()">
          <span class="button__icon button__icon--add"></span>
          <span class="button__label">Add an user</span>
        </button>
      </div>
    </div>
  </div>
  <div v-else>Loading...</div>
</template>
<script>
import { bus } from '../main.js'
import axios from 'axios'
export default {
  data () {
    return {
      androidUsersLoaded: false,
      applicationWorkflowsLoaded: false
    }
  },
  async created () {
    // Request store
    await this.refreshStore()
  },
  async mounted () {
    // Events
    bus.$on('add_android_user_success', async () => {
      await this.refreshStore()
    })
    bus.$on('delete_android_user_success', async () => {
      await this.refreshStore()
    })
  },
  computed: {
    dataLoaded () {
      return this.androidUsersLoaded && this.applicationWorkflowsLoaded
    },
    androidRegisteredUsers () {
      return this.$store.state.androidUsers
    },
    workflowByName () {
      return this.$store.getters.APP_WORKFLOWS_NAME_BY_ID
    }
  },
  methods: {
    addAndroidUser () {
      bus.$emit('add_android_user', {})
    },
    editAndroidUser (data) {
      bus.$emit('edit_android_user', {user: data})
    }, 
    deleteAndroidUser (data) {
      bus.$emit('delete_android_user', {
        userId: data._id,
        email: data.email
      })
    },
    editAndroidUserApplications (data) {
      bus.$emit('edit_android_user_applications', {
        user: data
      })
    },
    async refreshStore () {
      try {
        await this.dispatchStore('getAndroidUsers')
        await this.dispatchStore('getMultiUserApplications')
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
  }
}
</script>