const queue = require('../src/service/queue')

// let queue = new Queue()




setTimeout(async ()=>{
    try{
        await queue.push({title: 'dsdsd', url: 'dddsds', seconds: 100})
        await queue.clear()
        let count = await queue.count()
        console.log(count)
    }catch(e){
        console.log(e)
    }
    process.exit(0)
})