import Vue from 'vue'
import Router from 'vue-router'
// Views
import Healthcheck from '../views/Healthcheck.vue'

Vue.use(Router)
const router = new Router({
    mode: 'history',
    routes: [{
        path: '/healthcheck/overview',
        name: 'Healthcheck',
        component: Healthcheck
    }]
})

export default router