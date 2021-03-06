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
   /**
    * 防止原网站更换域名,将其替换掉
    * @param {String} url 
    */
    processUrl(url=''){
        const reg = /https:\/\/[^/]+/;
        return url.replace(reg,'')
    }
    getEmbedUrl(href){
        let reg = /videos\/(\d+?)\//;
        let res = href.match(reg);
        let id = res ? res[1] : null;
        return id ? `/embed/${id}` : false;
    }
    async getTargetUrl(item){
        let dom = await $get(`${this.mainpage}${item.embed_url}`);
        const regVideo = /video_url:.*?'(.*?)'/;
        const regCover = /preview_url:.*?'(.*?)'/;
        let res1 = dom.match(regVideo);
        let res2 = dom.match(regCover);
        let video_url = '';
        let cover_url = ''
        if(res1){
            video_url = res1[1]
        }
        if(res2){
            cover_url = res2[1]
        }
        return {
            video_url: this.processUrl(video_url),
            cover_url: this.processUrl(cover_url)
        };
    }
    async getDetailInfo(item){
        // console.log(item)
        let dom = await $get(`${this.mainpage}${item.url}`);
        // console.log(`${this.mainpage}${item.url}`)
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
        // let poster = $('.fp-poster img')[0];
        // let poster = $('.fp-poster img')[0];
        // if(!poster){
        //     poster = $('.player-holder img')[0];
        // }

        // console.log(poster)
        // poster = this.processUrl(poster)
        // console.log(arr)
        return {categories: arr};
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
            url = this.processUrl(url)
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
        console.log('crawler start...')
        try{
            await this.crawlerMain();
        }catch(e){
            console.log(e)
        }
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
        this.timer = setInterval(async ()=>{
            try{
                await this.crawlerEmbed()
            }catch(e){
                console.error(e)
            }
            
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
        let {target_url,cover_url} = await this.getTargetUrl(item);
        
        if(target_url){
            const {categories} = await this.getDetailInfo(item);
            item.categories = categories;
            // item.poster = poster;
            item.target_url = target_url;
            item.cover_url = cover_url;
            await yaosheModel.insert(item);
            // console.log(item)
            console.log('1 item is insert to db');
        }
        await this.crawlerDetail(item);
        // this.crawlerEmbed();
    }
     /**
     * 爬取详情页, 得到更多的详情页, 加入队列
     */
    async crawlerDetail(item){
       let queueLength = await this.queue.count();
       if(queueLength > 10000) return false;
       let dom = await $get(`${this.mainpage}${item.url}`);
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
