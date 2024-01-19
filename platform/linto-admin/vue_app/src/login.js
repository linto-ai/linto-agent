import Vue from 'vue'
import Login from './views/Login.vue'
import router from './router/router-login.js'

new Vue({
    router,
    render: h => h(Login)
}).$mount('#app')