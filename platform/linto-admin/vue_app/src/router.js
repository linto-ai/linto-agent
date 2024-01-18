import Vue from 'vue'
import Router from 'vue-router'
import axios from 'axios'

// Views
import DeviceApps from './views/DeviceApps.vue'
import DeviceAppDeploy from './views/DeviceAppDeploy.vue'
import DeviceAppWorkflowEditor from './views/DeviceAppWorkflowEditor.vue'
import MultiUserApps from './views/MultiUserApps.vue'
import MultiUserAppDeploy from './views/MultiUserAppDeploy.vue'
import MultiUserAppWorkflowEditor from './views/MultiUserAppWorkflowEditor.vue'
import Terminals from './views/Terminals.vue'
import TerminalsMonitoring from './views/TerminalsMonitoring.vue'
import Users from './views/Users.vue'
import Domains from './views/Domains.vue'
import TockView from './views/TockView.vue'
import SkillsManager from './views/SkillsManager.vue'

Vue.use(Router)
const router = new Router({
    mode: 'history',
    routes: [{
            path: '/admin/applications/device',
            name: 'Static devices overview',
            component: DeviceApps,
            meta: [{
                    name: 'title',
                    content: 'LinTO Admin - Static clients'
                },
                {
                    name: 'robots',
                    content: 'noindex, nofollow'
                }
            ]
        },
        {
            path: '/admin/applications/device/workflow/:workflowId',
            name: 'Static device flow editor',
            component: DeviceAppWorkflowEditor,
            meta: [{
                    name: 'title',
                    content: 'LinTO Admin - Static clients workflow editor'
                },
                {
                    name: 'robots',
                    content: 'noindex, nofollow'
                }
            ],
            beforeEnter: async(to, from, next) => {
                try {
                    // Check if the targeted device application exists
                    const workflowId = to.params.workflowId
                    const getWorkflow = await axios(`${process.env.VUE_APP_URL}/api/workflows/static/${workflowId}`)
                    if (!!getWorkflow.data.error) {
                        next('/admin/applications/device')
                    } else {
                        next()
                    }
                } catch (error) {
                    console.error(error)
                    next('/admin/applications/device')

                }
            }
        },
        {
            path: '/admin/applications/device/deploy',
            name: 'Static devices - deployment',
            component: DeviceAppDeploy,
            meta: [{
                    name: 'title',
                    content: 'LinTO Admin - Static clients deployment'
                },
                {
                    name: 'robots',
                    content: 'noindex, nofollow'
                }
            ]
        },
        {
            path: '/admin/applications/device/deploy/:sn',
            name: 'Static devices - deployment by id',
            component: DeviceAppDeploy,
            meta: [{
                    name: 'title',
                    content: 'LinTO Admin - Static clients deployment'
                },
                {
                    name: 'robots',
                    content: 'noindex, nofollow'
                }
            ],
            beforeEnter: async(to, from, next) => {
                try {
                    // Check if the targeted device exists
                    const sn = to.params.sn
                    const getStaticDevice = await axios(`${process.env.VUE_APP_URL}/api/clients/static/${sn}`)
                    if (getStaticDevice.data.associated_workflow !== null) {
                        next('/admin/applications/device')
                    } else {
                        next()
                    }
                } catch (error) {
                    console.error(error)
                    next('/admin/applications/device')
                }
            }
        },
        {
            path: '/admin/devices',
            name: 'Devices - statice devices',
            component: Terminals,
            meta: [{
                    name: 'title',
                    content: 'Devices and static devices'
                },
                {
                    name: 'robots',
                    content: 'noindex, nofollow'
                }
            ]
        },
        {
            path: '/admin/device/:sn/monitoring',
            name: 'Static devices - monitoring',
            component: TerminalsMonitoring,
            meta: [{
                    name: 'title',
                    content: 'LinTO Admin - Static clients monitoring'
                },
                {
                    name: 'robots',
                    content: 'noindex, nofollow'
                }
            ],
            beforeEnter: async(to, from, next) => {
                try {
                    // Check if the targeted device exists
                    const sn = to.params.sn
                    const getStaticDevice = await axios(`${process.env.VUE_APP_URL}/api/clients/static/${sn}`)
                    if (getStaticDevice.data.associated_workflow === null) {
                        next('/admin/applications/device')
                    } else {
                        next()
                    }
                } catch (error) {
                    console.error(error)
                    next('/admin/applications/device')
                }
            }
        },
        {
            path: '/admin/applications/multi',
            name: 'Applications overview',
            component: MultiUserApps,
            meta: [{
                    name: 'title',
                    content: 'LinTO Admin - applications'
                },
                {
                    name: 'robots',
                    content: 'noindex, nofollow'
                }
            ]
        }, {
            path: '/admin/applications/multi/deploy',
            name: 'Create new application',
            component: MultiUserAppDeploy,
            meta: [{
                    name: 'title',
                    content: 'LinTO Admin - Create an application workflow'
                },
                {
                    name: 'robots',
                    content: 'noindex, nofollow'
                }
            ],
        },
        {
            path: '/admin/applications/multi/workflow/:workflowId',
            name: 'Nodered application flow editor',
            component: MultiUserAppWorkflowEditor,
            meta: [{
                    name: 'title',
                    content: 'LinTO Admin - Application flow editor'
                },
                {
                    name: 'robots',
                    content: 'noindex, nofollow'
                }
            ],
            beforeEnter: async(to, from, next) => {
                try {
                    // Check if the targeted mutli-user application exists
                    const workflowId = to.params.workflowId
                    const getWorkflow = await axios(`${process.env.VUE_APP_URL}/api/workflows/application/${workflowId}`)
                    if (!!getWorkflow.data.error) {
                        next('/admin/applications/multi')
                    } else {
                        next()
                    }
                } catch (error) {
                    console.error(error)
                    next('/admin/applications/multi')
                }
            }
        },
        {
            path: '/admin/skills',
            name: 'Nodered skills manager',
            component: SkillsManager,
            meta: [{
                    name: 'title',
                    content: 'Nodered skills manager'
                },
                {
                    name: 'robots',
                    content: 'noindex, nofollow'
                }
            ],
        },
        {
            path: '/admin/nlu',
            name: 'tock interface',
            component: TockView,
            meta: [{
                    name: 'title',
                    content: 'Tock interface'
                },
                {
                    name: 'robots',
                    content: 'noindex, nofollow'
                }
            ]
        },
        {
            path: '/admin/users',
            name: 'Android users interface',
            component: Users,
            meta: [{
                    name: 'title',
                    content: 'LinTO admin - android users'
                },
                {
                    name: 'robots',
                    content: 'noindex, nofollow'
                }
            ]
        },
        {
            path: '/admin/domains',
            name: 'Web app hosts interface',
            component: Domains,
            meta: [{
                    name: 'title',
                    content: 'LinTO admin - Web app hosts'
                },
                {
                    name: 'robots',
                    content: 'noindex, nofollow'
                }
            ]
        }
    ]
})

/* The following function parse the route.meta attribtue to set page "title" and "meta" before entering a route" */
router.beforeEach(async(to, from, next) => {
    if (to.meta.length > 0) {
        to.meta.map(m => {
            if (m.name === 'title') {
                document.title = m.content
            } else {
                let meta = document.createElement('meta')
                meta.setAttribute('name', m.name)
                meta.setAttribute('content', m.content)
                document.getElementsByTagName('head')[0].appendChild(meta)
            }
        })
    }
    next()
})

export default router