module.exports = (webserver) => {
    return [{
        path: '/',
        method: 'get',
        requireAuth: false,
        controller:
            (req, res, next) => {
                webserver.emit("getServices", (ans) => { 
                    //test if the connection with mongo is always maintained
                    if(ans.bool) res.status(200).end()
                    else { 
                        console.error(`ERROR: ${ans.msg}`)
                        res.status(500).end()
                    }
                 })
            }
    }]
}