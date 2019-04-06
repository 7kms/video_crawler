module.exports = {
    redis_key_prefix: 'km7_crawler_',
    redis:{
       port: 6379,
    //    host: '127.0.0.1',
       host: '192.168.45.33'
    },
    mongo:{
        port: 27017,
        // host: '127.0.0.1',
        host: '192.168.45.33',
        dbName: 'km7_crawler_video'
    }
}