const request = require('request')

//La route de healthcheck peut faire des logs pour le service
request(`http://localhost/healthcheck`, error => {
    if (error) {
        throw error
    }
})