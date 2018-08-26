const {source:{yaoshe}} = require('../../config')
const {$get} = require('../utils/api')
const {sleep} = require('../utils')
const cheerio = require('cheerio')
const Queue = require('../service/queue')
const {md5} = require('../utils/hash')

const request = require('request')
const fs = require('fs')
const path = require('path')
const yaosheModel = require('../model/yaoshe')

class Yaoshe{
    constructor(){
        this.mainpage = yaoshe;
        this.queue = new Queue('yaoshe');
    }
    getEmbedUrl(href){
        let reg = /videos\/(\d+?)\//;
        let res = href.match(reg);
        let id = res ? res[1] : null;
        return id ? `${yaoshe}embed/${id}` : false;
    }
    getTargetUrl(dom){
        const reg = /video_url:.*?'(.*?)'/;
        let res = dom.match(reg);
        let url = '';
        if(res){
            url = res[1]
        }
        return url;
    }
    getPageListByDom(dom){
        const $ = cheerio.load(dom);
        const reg = /\D+/;
        const list = [];
        // $('.list-videos .item').not('.private').find('a').
       $('.list-videos .item').find('a').each((i, item)=>{
            let {title,href:url} = item.attribs;
            let duration = $(item).find('.duration').text();
            let timeArr = duration.split(reg);
            let seconds = 60*timeArr[0] + parseInt(timeArr[1]); 
            list.push({
                title,
                url,
                seconds,
                hash: md5(url),
                embed_url: this.getEmbedUrl(url)
            });
        });
        return list;
    }
    async start(){
       await this.crawlerMain();
       this.run();
    }
    run(){
        setInterval(()=>{
            this.crawlerEmbed()
        }, 5000)
    }
    async saveList(list){
        let count = 0;
        for(let item of list){
           let res =  await this.queue.push(item);
           if(res){
               count ++;
           }
        }
        console.log(`${count}/${list.length} staved in queue`)
    }
    /**
     * 爬取首页
     * 得到详情页链接, 加入队列
     */
    async crawlerMain(){
        try{
            let dom = await $get(this.mainpage);
            let list = this.getPageListByDom(dom);
            await this.saveList(list);
            // this.crawlerEmbed()
        }catch(e){
            console.log(e)
        }
    }
     /**
     * 解析视频下载地址
     * 
     * 1. 从队列中取出对象,通过详情页爬取更多的详情页
     * 2. 爬取embed页面,得到真正的视频地址target_url
     * 3. 存入mongodb等待下载
     */
    async crawlerEmbed(){
        // await sleep(3000)
        let item = await this.queue.shift();
        let dom = await $get(item.embed_url);
        let target_url = this.getTargetUrl(dom);
        this.crawlerDetail(item)
        if(target_url){
            item.target_url = target_url;
            await yaosheModel.insert(item);
            // console.log(item)
            console.log('1 item is insert to db')
        }
        // this.crawlerEmbed();
    }
     /**
     * 爬取详情页, 得到更多的详情页, 加入队列
     */
    async crawlerDetail(item){
       let queueLength = await this.queue.count();
       if(queueLength > 10000) return false;
       let dom = await $get(item.url);
       let list = this.getPageListByDom(dom);
       await this.saveList(list);
    }
   

    download(obj){
        request.get(obj.target_url).pipe(fs.createWriteStream(path.resolve()))
    }
}

module.exports = Yaoshe
