const fuseki = require('../../../../helpers/fuseki-connection');
const config = require('../../../../../config.json');
const OPMProp = require('opm-qg').OPMProp;
const urljoin = require('url-join');
const { check, validationResult } = require('express-validator/check');
const jsonld = require('jsonld');

module.exports = (app) => {

    // GET PROPERTIES
    app.get('/:projNo/:discipline/properties', async (req, res, next) => {

        config.DEBUG && console.log("Route: GET /:projNo/:discipline/properties");

        // Get URL params
        const projNo = req.params.projNo;
        const discipline = req.params.discipline;
        const namespace = urljoin(config.dataNamespace, projNo, discipline);    
        
        try{
            // Build query with OPM-QG
            const opmProp = new OPMProp(namespace);
            const q = opmProp.getAllProps();
            
            config.DEBUG && console.log(q);

            // Run query
            var qRes = await fuseki.getQuery(projNo, q, 'application/ld+json');
            res.send(_buildOPMPropTree(qRes));
        }catch(e){
            next({msg: e.message, status: e.status});
        }

    })

    // GET SPECIFIC PROPERTY
    app.get('/:projNo/:discipline/properties/:id', async (req, res, next) => {

        // Get URL params
        const projNo = req.params.projNo;
        const discipline = req.params.discipline;
        const id = req.params.id;
        const namespace = urljoin(config.dataNamespace, projNo, discipline);
        const propURI = urljoin(namespace, 'properties', id);

        const opmProp = new OPMProp(namespace);
        const q = opmProp.getPropertyHistory(propURI);
        
        try{
            var qRes = await fuseki.getQuery(projNo, q, 'application/ld+json');
            // res.send(_buildOPMPropTree(qRes));
            res.send(qRes);
        }catch(e){
            next({msg: e.message, status: e.status});
        }

    })
    
}

// NB! This should be extended to provide a more generic approach for building the trees
_buildOPMPropTreeNew = (jsonld) => {
    // Create tree structure
    var formatted = [];
    const root = jsonld['@graph'];

    root.forEach(item => {
        var keys = Object.keys(item);
        var values = Object.values(item);
        values.forEach((val, i) => {
            if(_isURI(val)){
                var match = root.find(x => x['@id'] == val)
                if(match){
                    console.log(match)
                    item[keys[i]] == match;
                    root.pop(match)
                }
            }
        })
        console.log(item)
        // keys.forEach(key => {

        // })
        // if(item['@id']){
        //     var match = root.find(x => x == item['@id']);
        //     console.log(item['@id'])
        // }
        return item;
    })

    jsonld['@graph'] = formatted;
    return formatted;
    
}

_isURI = (str) => {
    return /^http/.test(str);
}

_buildOPMPropTree = (jsonld) => {
    // Create tree structure
    var formatted = [];
    const root = jsonld['@graph'];

    root.forEach(item => {
        const keys = Object.keys(item);
        keys.forEach(key => {
            if(key == 'hasPropertyState'){
                const match = root.find(r => r['@id'] == item[key]);
                if(match){
                    item.hasPropertyState = match;
                    formatted.push(item);
                }
            }
        });
        return item;
    })

    jsonld['@graph'] = formatted;
    return formatted;
    
}