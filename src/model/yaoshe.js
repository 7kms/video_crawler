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
         return sequenceDocument.value.sequence_value;
    }
    async setSequenceValue(){
        await this.instance.insertOne,({_id: 'yaoshe', sequence_value: 10000})
    }
    async init(){
        const db = await mongo();
        this.instance = db.collection(this.collection);
        const sequence_value = await this.getNextSequenceValue();
        if(!sequence_value){
            this.setSequenceValue()
        }
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
}

module.exports = new Model()