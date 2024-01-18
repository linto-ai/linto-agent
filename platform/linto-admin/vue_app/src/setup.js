import Vue from 'vue'
import Setup from './views/Setup.vue'
import router from './router/router-setup'

new Vue({
    router,
    render: h => h(Setup)
}).$mount('#app')