const fuseki = require('../../../helpers/fuseki-connection')

module.exports = (app) => {

    // DESCRIBE RESOURCE
    app.get('/:projNo/query', async (req, res, next) => {

        // Get URL params
        const projNo = req.params.projNo;

        // Get query params
        const query = req.query.query;

        var mimeType = 'application/sparql-results+json';
        if(query.toLowerCase().indexOf('construct') != -1) mimeType = 'application/ld+json';
        
        try{
            var qRes = await fuseki.getQuery(projNo, query, mimeType);
            res.send(qRes);
        }catch(e){
            next({msg: e.message, status: e.status});
        }

    })

}