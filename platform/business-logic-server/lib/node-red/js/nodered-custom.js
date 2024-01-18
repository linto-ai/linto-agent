window.onload = async() => {
    let uriConfigAdmin = document.location.origin + '/red/config/admin'
    let apiUri = await initApi(uriConfigAdmin)

    async function initApi(uriConfigAdmin) {
        return new Promise((resolve, reject) => {
            fetch(uriConfigAdmin, {
                method: 'GET',
                headers: {},
            }).then(response => {
                return response.json()
            }).then(data => {
                console.log(data)
                if (!!data.admin)
                    resolve(data.admin)
            }).catch(err => {
                reject(err)
            })
        })
    }

    async function getFullFlow(workspaceId) {
        const fullFlow = RED.nodes.createCompleteNodeSet()
        let configNodeIds = []
        let formattedFlow = fullFlow
            .filter(flow => flow.id === workspaceId || flow.z === workspaceId)
            .map(flow => {
                if (flow.type === 'linto-config') {
                    configNodeIds.push(flow.configMqtt)
                    configNodeIds.push(flow.configEvaluate)
                    configNodeIds.push(flow.configTranscribe)
                }
                return flow
            })
        let configNodes = fullFlow.filter(flow => configNodeIds.indexOf(flow.id) >= 0)
        formattedFlow.push(...configNodes)
        return formattedFlow
    }

    async function saveTmpFlow(flow) {
        const payload = {
            payload: flow,
            workspaceId: window['workspace_active'],
        }

        let updateTmp = await fetch(`${apiUri}/flow/tmp`, {
            method: 'put',
            headers: new Headers({
                Accept: 'application/json',
                'Content-Type': 'application/json',
            }),
            body: JSON.stringify(payload),
        }).then(function(response) {
            return response.json()
        }).then(function(data) {
            return data
        })

        if (updateTmp.status === 'error') {
            alert('an error has occured')
        }
    }

    // Save TMP Flow on change workspace
    RED.events.on('workspace:change', async function(status) {
        window['workspace_active'] = status.workspace
        const fullFlow = await getFullFlow(window['workspace_active'])
        await saveTmpFlow(fullFlow)
    })

    // Save TMP Flow on change nodes
    RED.events.on('nodes:change', async function() {
        try {
            window['workspace_active'] = RED.workspaces.active()
            const fullFlow = await getFullFlow(window['workspace_active'])
            await saveTmpFlow(fullFlow)
        } catch (err) {
            console.log(err)
        }
    })

    // Save TMP Flow on change nodes
    RED.events.on('view:selection-changed', async function() {
        try {
            window['workspace_active'] = RED.workspaces.active()
            const fullFlow = await getFullFlow(window['workspace_active'])
            await saveTmpFlow(fullFlow)
        } catch (err) {
            console.log(err)
        }
    })

    RED.events.on('editor:close', async function() {
        try {
            window['workspace_active'] = RED.workspaces.active()
            const fullFlow = await getFullFlow(window['workspace_active'])
            await saveTmpFlow(fullFlow)
        } catch (err) {
            console.log(err)
        }
    })

    /*
    RED.events.on > 
    const events = [
        'view:selection-changed',
        'sidebar:resize',
        'workspace:change',
        'registry:node-type-added',
        'registry:node-type-removed',
        'registry:node-set-enabled',
        'registry:node-set-disabled',
        'registry:node-set-removed',
        'subflows:change',
        'registry:module-updated',
        'registry:node-set-added',
        'nodes:add',
        'nodes:remove',
        'projects:load',
        'flows:add',
        'flows:remove',
        'flows:change',
        'flows:reorder',
        'subflows:add',
        'subflows:remove',
        'nodes:change',
        'groups:add',
        'groups:remove',
        'groups:change',
        'workspace:clear',
        'editor:open',
        'editor:close',
        'search:open',
        'search:close',
        'actionList:open',
        'actionList:close',
        'type-search:open',
        'type-search:close',
        'workspace:dirty',
        'project:change',
        'editor:save',
        'layout:update'
    ]*/
}