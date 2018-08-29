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
        this.restartTimes = 0;
        this.mainpage = yaoshe;
        this.queue = new Queue('yaoshe');
        this.queryIntervalTime = 10000;
    }
    getEmbedUrl(href){
        let reg = /videos\/(\d+?)\//;
        let res = href.match(reg);
        let id = res ? res[1] : null;
        return id ? `${yaoshe}embed/${id}` : false;
    }
    async getTargetUrl(item){
        let dom = await $get(item.embed_url);
        const reg = /video_url:.*?'(.*?)'/;
        let res = dom.match(reg);
        let url = '';
        if(res){
            url = res[1]
        }
        return url;
    }
    async getCategory(item){
        let dom = await $get(item.url);
        const $ = cheerio.load(dom);
        let arr = [];
        $('#tab_video_info .info .item').each((i, item)=>{
            if(i == 1){
                $(item).find('a').each((i,a)=>{
                    arr.push($(a).text());
                });
                return false;
            }
        })
        console.log(arr)
        return arr;
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
    restart(){
        if(this.timer){
            clearInterval(this.timer)
            this.timer = null;
        }
        this.start();
    }
    run(){
        this.timer = setInterval(()=>{
            this.crawlerEmbed()
        }, this.queryIntervalTime)
    }
    async saveList(list){
        let count = 0;
        for(let item of list){
           let res =  await this.queue.push(item);
           if(res){
               count ++;
           }
        }
        console.log(`${count}/${list.length} saved in queue`)
    }
    /**
     * 爬取首页
     * 得到详情页链接, 加入队列
     */
    async crawlerMain(){
        let dom = await $get(this.mainpage);
        let list = this.getPageListByDom(dom);
        await this.saveList(list);
        // try{
           
        //     // this.crawlerEmbed()
        // }catch(e){
        //     console.error(e)
        //     console.error('crawlerMain error')
        // }
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
        let length = await this.queue.count();
        console.log('start crawlerEmbed, current queue length %d', length)
        if(length == 0){
            this.restart();
            return false;
        }
        let item = await this.queue.shift();
        let target_url = await this.getTargetUrl(item);
        this.crawlerDetail(item)
        if(target_url){
            item.categories = await this.getCategory(item);
            item.target_url = target_url;
            await yaosheModel.insert(item);
            // console.log(item)
            console.log('1 item is insert to db');
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

    async fresh(){
        let list = await yaosheModel.instance.find({categories: {$exists:false}}).toArray();
        console.log(list.length)
        while(list.length){
            let item = list.shift();
            const categories = await this.getCategory(item);
            await yaosheModel.instance.updateOne({_id: item._id}, {$set:{categories}})
            console.log(list.length)
        }
    }

}

module.exports = Yaoshe
