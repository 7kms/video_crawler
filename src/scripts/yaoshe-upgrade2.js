
// const {source:{yaoshe}} = require('../../config')
process.env.NODE_ENV ='gray'
const yaosheModel = require('../model/yaoshe')

const run = async ()=>{
    let list = await yaosheModel.instance.find({}).toArray();
    console.log(list.length)
    while(list.length){
        let item = list.shift();
        item.seq_id = await yaosheModel.getNextSequenceValue();
        await yaosheModel.update(item)
        // await yaosheModel.instance.updateOne({_id: item._id}, {$set:item})
        console.log(list.length)
    }
    process.exit(0)
}
setTimeout(()=>{
    run()
},100)