
process.env.NODE_ENV ='gray'
// const Yaoshe = require('../src/source/yaoshe')
const Queue =  require('../src/service/queue')
// setTimeout(()=>{
//     let obj = { title: '092113-666-1pon_hqこれぞ究極の黒髪美少女1',
//     url: '/videos/20907/092113-666-1pon-hq-1/',
//     seconds: 1077,
//     hash: 'b44228050d9269a14984279043f330ad',
//     embed_url: '/embed/20907' };
//     new Yaoshe().getDetailInfo(obj)
// })


setTimeout(async ()=>{
    const queue = new Queue('yaoshe')
    let count = 4360
    while(--count){
        let item = await queue.shift();
        console.log(count, item._id)
    }
})
