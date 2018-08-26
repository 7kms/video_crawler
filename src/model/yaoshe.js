const mongo = require('../dao/mongo')

class Model{
    constructor(){
        this.collection = 'yaoshe';
        this.init();
    }
    async init(){
        const db = await mongo();
        this.instance = db.collection(this.collection);
    }
    async insert(obj){
        return await this.instance.insertOne(obj)
    }
}

module.exports = new Model()