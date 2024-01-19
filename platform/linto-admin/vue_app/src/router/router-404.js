import Vue from 'vue'
import Router from 'vue-router'
// Views
import page404 from '../views/404.vue'

Vue.use(Router)
const router = new Router({
    mode: 'history',
    routes: [{
        path: '/',
        name: 'page404',
        component: page404
    }]
})

export default router