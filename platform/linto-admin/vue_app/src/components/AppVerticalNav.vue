<template>
  <div id="vertical-nav" class="flex col" :class="extraClass">

    <!-- Device applications -->
    <div class="vertical-nav-item flex col" :class="routePath.indexOf(staticClientsUrl) >= 0 ? 'active' : ''">
      <a  class="vertical-nav-item__link vertical-nav-item__link" :href="staticClientsUrl" >
        <span class="nav-link__icon nav-link__icon--single-user "></span>
        <span class="nav-link__label">Device applications</span>
      </a>
    </div>
    
    <!-- Multi-user applications -->
    <div class="vertical-nav-item flex col" :class="routePath.indexOf(applicationsUrl) >= 0 ? 'active' : ''">
      <a class="vertical-nav-item__link vertical-nav-item__link" :href="applicationsUrl">
        <span class="nav-link__icon nav-link__icon--multi-user "></span>
        <span class="nav-link__label">Multi-user applications</span>
      </a>
    </div>
    
    <div class="nav-divider"></div>
      
    <!-- Devices -->
    <div class="vertical-nav-item flex col" :class="routePath.indexOf(terminalsUrl) >= 0 ? 'active' : ''">
      <a class="vertical-nav-item__link vertical-nav-item__link" :href="terminalsUrl">
        <span class="nav-link__icon nav-link__icon--terminal"></span>
        <span class="nav-link__label">Devices</span>
      </a>
    </div>

    <!-- Android users -->
    <div class="vertical-nav-item flex col" :class="routePath.indexOf(androidUsersUrl) >= 0 ? 'active' : ''">
      <a class="vertical-nav-item__link vertical-nav-item__link" :href="androidUsersUrl">
        <span class="nav-link__icon nav-link__icon--users"></span>
        <span class="nav-link__label">Users</span>
      </a>
    </div>
    
    <!-- Domains -->
    <div class="vertical-nav-item flex col" :class="routePath.indexOf(webAppHostsUrl) >= 0 ? 'active' : ''">
      <a class="vertical-nav-item__link vertical-nav-item__link" :href="webAppHostsUrl">
        <span class="nav-link__icon nav-link__icon--webapp"></span>
        <span class="nav-link__label">Domains</span>
      </a>
    </div>
    
    <div class="nav-divider"></div>
    
    <!-- Skills manager -->
    <div class="vertical-nav-item flex col" :class="routePath.indexOf(skillsManagerUrl) >= 0 ? 'active' : ''">
      <a class="vertical-nav-item__link vertical-nav-item__link" :href="skillsManagerUrl">
        <span class="nav-link__icon nav-link__icon--skills-manager "></span>
        <span class="nav-link__label">Skills manager</span>
      </a>
    </div>
    
    <div class="nav-divider"></div>
    
    <!-- NLU interface -->
    <div class="vertical-nav-item flex col" :class="routePath.indexOf(nluUrl) >= 0 ? 'active' : ''">
      <a class="vertical-nav-item__link vertical-nav-item__link" :href="nluUrl">
        <span class="nav-link__icon nav-link__icon--nlu "></span>
        <span class="nav-link__label">Tock interface</span>
      </a>
    </div>

  </div>
</template>
<script>
export default {
  props: ['extraClass'],
  data () {
    return {
      clientsUrl: '/admin/clients',
      staticClientsUrl: '/admin/applications/device',
      applicationsUrl:  '/admin/applications/multi',
      nluUrl: '/admin/nlu',
      androidUsersUrl: '/admin/users',
      webAppHostsUrl:  '/admin/domains',
      terminalsUrl: '/admin/devices',
      skillsManagerUrl: '/admin/skills',
      routePath: ''
    }
  },
  created () {
    setTimeout(()=> {
      this.routePath = this.$route.fullPath
    }, 300)
    
  }
}
</script>
