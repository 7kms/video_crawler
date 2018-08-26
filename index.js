const list = require('./main.json')
const fs = require('fs')
const path = require('path')


const newlist = list.map(item=>{
    //https://yaoshe11.com/videos/20701
    //https://yaoshe11.com/embed/
    let {href, ...rest} = item;
    let reg = /videos\/(\d+?)\//;
    let res = href.match(reg);
    let id = res ? res[1] : null;
    if(id){
        return {
            url: `https://yaoshe11.com/embed/${id}`,
            ...rest
        }
    }
    return false
}).filter(item=>!!item)
fs.mkdirSync('./data')

fs.writeFileSync(path.resolve('./data/yaoshe.json'),JSON.stringify(newlist),'utf-8')
