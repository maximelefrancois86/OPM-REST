var config = require('../../config.json');
var namespaces = config.namespaces;

var ldt = {};

ldt.appendPrefixesToQuery = (query) => {
    
    // Extract namespaces used in the query
    var nsQ = ldt.nameSpacesInQuery(query);
    
    // Get the URIs of the prefixes and append them to the query
    var p = '';
    nsQ.forEach(namespace => {
        var match = config.namespaces.filter(ns => ns.prefix == namespace)[0];
        if(match){
            p+= `PREFIX  ${namespace}: <${match.uri}>\n`;
        }
        else {
            return new Error('Unknown prefix '+namespace);
        }
    })
    return p+query;

}
    
ldt.nameSpacesInQuery = (str) => {
    var array = [];

    const regex = /[a-zA-Z]+\:/g;
    let m;
    
    while ((m = regex.exec(str)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        
        // The result can be accessed through the `m`-variable.
        m.forEach((match) => {
            match = match.slice(0, -1);
            if(array.indexOf(match) == -1){
                array.push(match);
            }
        });
    }
    return array;
}

module.exports = ldt;