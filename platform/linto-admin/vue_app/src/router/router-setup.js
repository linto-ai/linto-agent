import Vue from 'vue'
import Router from 'vue-router'
// Views
import Setup from '../views/Setup.vue'

import '../filters/index.js'

Vue.use(Router)
const router = new Router({
    mode: 'history',
    routes: [{
        path: '/setup',
        name: 'setup',
        component: Setup
    }]
})

export default router