const fs = require('fs')
const path = require('path')

class Store{
    static save(filename,json){
        fs.writeFileSync(path.resolve(`./data/${filename}.json`),JSON.stringify(json),'utf8')
    }
}


module.exports = Store;