const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require(`${process.cwd()}/doc/swagger.json`);

module.exports = (webServer) => {
    return [{
        // Get all android users
        path: '/',
        method: 'get',
        requireAuth: false,
        controller: async(req, res, next) => {
            swaggerUi.serve
            swaggerUi.setup(swaggerDocument)
        }
    }]
}