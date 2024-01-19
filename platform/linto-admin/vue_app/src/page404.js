import Vue from 'vue'
import page404 from './views/404.vue'
import router from './router/router-404.js'

new Vue({
    router,
    render: h => h(page404)
}).$mount('#app')