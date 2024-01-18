<template>
  <div id="app" class="flex col">
    <AppHeader :extraClass="fullScreenFrame ? 'fullscreen-child' : ''"></AppHeader>
    <div id="page-view" class="flex1 flex row">
      <AppVerticalNav :extraClass="fullScreenFrame ? 'fullscreen-child' : ''"></AppVerticalNav>
      <div id="view" class="flex1" :class="fullScreenFrame ? 'fullscreen-child' : ''">
        <AppNotifTop v-if="path.indexOf('/admin/applications') >= 0"></AppNotifTop>
        <router-view id="view-render" class="flex col"></router-view>
      </div>
    </div>
    <AppNotif></AppNotif>
    <!-- Mono user applications -->
    <ModalReplaceTerminal v-if="path.indexOf('/admin/applications/device') >= 0"></ModalReplaceTerminal>
    <ModalDissociateTerminal v-if="path.indexOf('/admin/applications/device') >= 0 || path.indexOf('/admin/devices') >= 0"></ModalDissociateTerminal>
    <!-- Multi user applications --> 
    <ModalDeleteMultiUserApp v-if="path.indexOf('/admin/applications/multi') >= 0"></ModalDeleteMultiUserApp>
    <ModalUpdateApplicationServices v-if="path.indexOf('/admin/applications/multi') >= 0 || path.indexOf('/admin/applications/device') >= 0"></ModalUpdateApplicationServices>
    <!-- Devices -->
    <ModalAddTerminal v-if="path.indexOf('/admin/devices') >= 0"></ModalAddTerminal>
    <ModalDeleteTerminal v-if="path.indexOf('/admin/devices') >= 0"></ModalDeleteTerminal>
    <!-- Users -->
    <ModalManageUsers v-if="path.indexOf('/admin/applications/multi') >= 0"></ModalManageUsers>
    <ModalAddUsers v-if="path.indexOf('/admin/users') >= 0"></ModalAddUsers>
    <ModalEditUser v-if="path.indexOf('/admin/users') >= 0"></ModalEditUser>
    <ModalDeleteUser v-if="path.indexOf('/admin/users') >= 0"></ModalDeleteUser>
    <ModalEditUserApps v-if="path.indexOf('/admin/users') >= 0"></ModalEditUserApps>
    <!-- Domains -->
    <ModalAddDomain v-if="path.indexOf('/admin/domains') >= 0"></ModalAddDomain>
    <ModalDeleteDomain v-if="path.indexOf('/admin/domains') >= 0"></ModalDeleteDomain>
    <ModalEditDomain v-if="path.indexOf('/admin/domains') >= 0"></ModalEditDomain>
    <ModalManageDomains v-if="path.indexOf('/admin/applications/multi') >= 0"></ModalManageDomains>
    <ModalEditDomainApplications v-if="path.indexOf('/admin/domains') >= 0"></ModalEditDomainApplications>
  </div>
</template>
<script>
  // Navigation
  import AppHeader from '@/components/AppHeader.vue'
  import AppVerticalNav from '@/components/AppVerticalNav.vue'
  // App notify
  import AppNotif from '@/components/AppNotif.vue'
  import AppNotifTop from '@/components/AppNotifTop.vue'
  // Modals
  import ModalDeleteTerminal from '@/components/ModalDeleteTerminal.vue'
  import ModalReplaceTerminal from '@/components/ModalReplaceTerminal.vue'

  import ModalUpdateApplicationServices from '@/components/ModalUpdateApplicationServices.vue'
  import ModalDissociateTerminal from '@/components/ModalDissociateTerminal.vue'
  import ModalAddTerminal from '@/components/ModalAddTerminal.vue'
  import ModalManageUsers from '@/components/ModalManageUsers.vue'
  import ModalAddUsers from '@/components/ModalAddUsers.vue'
  import ModalEditUser from '@/components/ModalEditUser.vue'
  import ModalEditUserApps from '@/components/ModalEditUserApps.vue'
  import ModalDeleteUser from '@/components/ModalDeleteUser.vue'
  import ModalDeleteMultiUserApp from '@/components/ModalDeleteMultiUserApp.vue'
  import ModalAddDomain from '@/components/ModalAddDomain.vue'
  import ModalDeleteDomain from '@/components/ModalDeleteDomain.vue'
  import ModalEditDomain from '@/components/ModalEditDomain.vue'
  import ModalEditDomainApplications from '@/components/ModalEditDomainApplications.vue'
  import ModalManageDomains from '@/components/ModalManageDomains.vue'

  import { bus } from './main.js'
  import io from 'socket.io-client'
  export default {
    data () {
      return {
        fullScreenFrame: false
      }
    },
    mounted () {
      bus.$on('iframe-set-fullscreen', () => {
        this.fullScreenFrame = true
      })
      bus.$on('iframe-unset-fullscreen', () => {
        this.fullScreenFrame = false
      })
      this.socket = new io(`${process.env.VUE_APP_URL}`)
    },
    methods: {
      async initSocket() {
        this.socket = new io(`${process.env.VUE_APP_URL}`)
      }
    },
    watch: {
      path (data) {
      if (data.indexOf('/admin/device') < 0) {
          this.socket.emit('linto_unsubscribe_all', {})
        }
      }
    },
    computed: {
      path () {
        return this.$route.fullPath
      }
    },
    components: {
      AppHeader,
      AppNotif,
      AppNotifTop,
      AppVerticalNav,
      // Terminals
      ModalAddTerminal,
      ModalDeleteTerminal,
      ModalReplaceTerminal,
      ModalDissociateTerminal,
      // Applications
      ModalDeleteMultiUserApp,
      ModalUpdateApplicationServices,
      // Users
      ModalAddUsers,
      ModalManageUsers,
      ModalEditUser,
      ModalEditUserApps,
      ModalDeleteUser,
      // Domains
      ModalAddDomain,
      ModalDeleteDomain,
      ModalEditDomain,
      ModalEditDomainApplications,
      ModalManageDomains
    }
  }
</script>
