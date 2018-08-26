const {redis:redisconfig,redis_key_prefix} = require('../../config')
const {md5} = require('../utils/hash')
const redis = require('redis')
class Queue{
    constructor(){
        this.client = null;
        this.key_prefix_list = `${redis_key_prefix}download_list`;
        this.init();
    }
    init(){
        this.client = redis.createClient(redisconfig);
        this.client.on('error', function (err) {
            logger.error(err);
            throw new Error(err)
        });
    }
    async push(obj){
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
            this.client.blpop([this.key_prefix_list,1], (err,reply) =>{
                if(!err && reply){
                    let obj = JSON.parse(reply[1]);
                    this.client.srem(this.key_prefix_set,md5(obj.url))
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

module.exports = new Queue()
