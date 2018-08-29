
// const {source:{yaoshe}} = require('../../config')
process.env.NODE_ENV ='gray'
const YaoShe = require('../source/yaoshe')
const yaosheModel = require('../model/yaoshe')
const {md5} = require('../utils/hash')
const Queue = require('../service/queue')

const run = async ()=>{
    const queue = new Queue('yaoshe')
    await queue.clear()
    let yaoshe = new YaoShe();
    let list = await yaosheModel.instance.find({}).toArray();
    console.log(list.length)
    while(list.length){
        let item = list.shift();
        item.url = yaoshe.processUrl(item.url)
        item.embed_url = yaoshe.processUrl(item.embed_url)
        item.target_url = yaoshe.processUrl(item.target_url)
        item.hash = md5(item.url)
        await queue.push(item);
        // await yaosheModel.instance.updateOne({_id: item._id}, {$set:item})
        console.log(list.length)
    }
    process.exit(0)
}

// run()