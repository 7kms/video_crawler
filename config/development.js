module.exports = {
    source: {
        yaoshe:'https://yaoshe11.com/'
    },
    redis_key_prefix: 'km7_test_crawler_',
    redis:{
       port: 6379,
       host: '192.168.45.33'
    },
    mongo:{
        port: 27017,
        host: '192.168.45.33',
        dbName: 'km7_crawler_video'
    }
}