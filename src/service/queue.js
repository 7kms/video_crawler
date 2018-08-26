const {redis:redisconfig,redis_key_prefix} = require('../../config')
const redis = require('redis')
class Queue{
    constructor(source){
        this.client = null;
        this.key_prefix_list = `${redis_key_prefix}${source}_stage1_list`;
        this.key_prefix_set = `${redis_key_prefix}${source}_stage1_set`;
        this.init();
    }
    init(){
        this.client = redis.createClient(redisconfig);
        this.client.on('error', function (err) {
            logger.error(err);
            throw new Error(err)
        });
    }
    isDuplicated(obj){
        return new Promise((resolve)=>{
            this.client.sadd(this.key_prefix_set,obj.hash,function (err,reply) {
                if(!err && reply){
                    resolve(false)
                }else{
                    resolve(true)
                }
            })
        })
    }
    // async pushList(list=[]){
    //     list.forEach(item=>{
    //         this.push()
    //     })
    // }
    async push(obj){
        let isDuplicate = await this.isDuplicated(obj);
        if(isDuplicate){
            return false;
        }
        return new Promise((resolve,reject)=>{
            let str = JSON.stringify(obj);
            this.client.rpush(this.key_prefix_list,str,function (err,reply) {
                if(!err && reply){
                    resolve(JSON.parse(reply))
                }else{
                    reject(err)
                }
            })
        })
    }
    shift(){
        return new Promise((resolve,reject)=>{
            this.client.blpop([this.key_prefix_list,0], (err,reply) =>{
                if(!err && reply){
                    let obj = JSON.parse(reply[1]);
                    // this.client.srem(this.key_prefix_set,obj.hash)
                    resolve(obj);
                }else{
                    reject(err)
                }
            })
        })
    }
    count(){
        return new Promise((resolve,reject)=>{
            this.client.llen(this.key_prefix_list,function (err,reply) {
                if(!err){
                    resolve(reply)
                }else{
                    reject(err)
                }
            })
        })
    }
    clear(){
        return new Promise((resolve,reject)=>{
            this.client.del(this.key_prefix_list,function (err,reply) {
                if(!err){
                    resolve(reply)
                }else{
                    reject(err)
                }
            })
        })
    }
}

module.exports = Queue
