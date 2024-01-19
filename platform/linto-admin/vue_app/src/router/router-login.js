import Vue from 'vue'
import Router from 'vue-router'
// Views
import Login from '../views/Login.vue'

Vue.use(Router)
const router = new Router({
    mode: 'history',
    routes: [{
        path: '/login',
        name: 'login',
        component: Login
    }]
})

export default router