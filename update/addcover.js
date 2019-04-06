process.env.NODE_ENV = 'production'

const Model = require('../src/model/yaoshe');
const config = require('../config')
const {$get} = require('../src/utils/api')

const getList = async(limit,skip)=>{
    let sort = {_id: -1};
    return await Model.getList({},limit,skip,sort);
}

const getCoverUrl = async (pageurl)=>{
        var reg = /https:\/\/[^/]+/;
        let dom = await $get(pageurl);
        const regCover = /preview_url:.*?'(.*?)'/;
        let res2 = dom.match(regCover);

        let cover_url = ''
        if(res2){
            cover_url = res2[1]
        }
       return cover_url.replace(reg,'')
}

const run = async ()=>{
    await Model.init();
    const baseurl = config.source.yaoshe.slice(0,-1);
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
        if(item.cover_url){
            continue
        }else{
            let embedPage = `${baseurl}${item.embed_url}`;
            // console.log(`${list.length}, going to crawler ${embedPage}`)
            item.cover_url = await getCoverUrl(embedPage);
            // console.log(`crawler successful ${embedPage} `)
            await Model.update(item);
            console.log(`${list.length}, update successful,  cover=${item.cover_url}`)
        }
    }

    process.exit(0)
}

run()