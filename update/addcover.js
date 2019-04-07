// process.env.NODE_ENV = 'production'

const Model = require('../src/model/yaoshe');
const config = require('../config')
const {$get} = require('../src/utils/api')

const getList = async(limit,skip)=>{
    let sort = {_id: -1};
    return await Model.getList({},limit,skip,sort);
}

const getCoverUrl = async (pageurl)=>{
    let reg = /(\d+)$/;
    let arr = reg.exec(pageurl);
    if(arr[1]){
        return `/contents/videos_screenshots/${parseInt(arr[1]/1000)*1000}/${arr[1]}/preview.mp4.jpg`
    }else{
        return ''
    }
    
}

const run = async ()=>{
    await Model.init();
    let limit = 50;
    let skip = 0;
    let list = await getList(limit,skip);
    // console.log(list)
    while(list.length > 0){
        let item = list.shift();
        console.log(list.length,'==========')
        if(list.length == 0){
            console.log('get more list')
            skip += limit;
            list = await getList(limit,skip);
            console.log(list.length)
        }
         // console.log(`${list.length}, going to crawler ${embedPage}`)
         item.cover_url = await getCoverUrl(item.embed_url);
         // console.log(`crawler successful ${embedPage} `)
         await Model.update(item);
         console.log(`${list.length}, update successful,  cover=${item.cover_url}`)
    }

    process.exit(0)
}

run()