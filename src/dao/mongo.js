
const {mongo:defaultConfig} = require('../../config')
const {MongoClient} = require('mongodb');

const clientPool = {};
const refresh = ()=>{
    let arr = Object.keys(clientPool)
    if(arr.length > 10){
        for(let client of arr){
            clientPool[client].close();
            delete clientPool[client]
        }
    }
}

module.exports = async ({host,port,dbName}=defaultConfig)=>{
    const dbcash_key = `${host}${port}`;
    return new Promise((resolve,reject)=>{
        if(clientPool[dbcash_key]){
            resolve(clientPool[dbcash_key].db(dbName))
        }
        // Connection URL
        const url = `mongodb://${host}:${port}`;
        MongoClient.connect(url,{poolSize: 5},function(err, client) {
            if(!err){
                console.log("Connected successfully to server");
                refresh();
                const db = client.db(dbName);
                clientPool[dbcash_key] = db;
                resolve(db);
            }else{
                console.error(err)
                reject(err)
            }
        });
    })
}