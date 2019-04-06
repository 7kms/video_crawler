const mongo = require('../dao/mongo')

class Model{
    constructor(){
        this.collection = 'yaoshe';
        this.init();
       
    }
    async getNextSequenceValue(){
        var sequenceDocument = await this.instance.findOneAndUpdate(
            {_id: 'yaoshe' },
            {$inc:{sequence_value:1}},
            {returnNewDocument: true}
        );
         return sequenceDocument.value && sequenceDocument.value.sequence_value;
    }
    async setSequenceValue(){
        await this.instance.insertOne,({_id: 'yaoshe', sequence_value: 10000})
    }
    async init(){
        if(!this.initialPromise){
            this.initialPromise = new Promise(async(resolve)=>{
                const db = await mongo();
                this.instance = db.collection(this.collection);
                const sequence_value = await this.getNextSequenceValue();
                if(!sequence_value){
                    await this.setSequenceValue()
                }
                resolve()
            })
        }
        return this.initialPromise;
    }
    async insert(obj){
        obj.created_at = new Date()
        obj.seq_id = await this.getNextSequenceValue();
        return await this.instance.insertOne(obj)
    }
    async update(obj){
        obj.updated_at = new Date();
        return await this.instance.updateOne({_id: obj._id},{$set:obj})
    }
    async getList(query={},limit=20,skip=0,sort={}){
        return await this.instance.find(query).limit(limit).skip(skip).sort(sort).toArray()
    }
}

module.exports = new Model()