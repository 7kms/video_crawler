
// https://www.npmjs.com/package/request

const request = require('request')

const getConfig = (method, url , params) => {
    const obj = {
        method,
        url,
        headers:{
            'cookie':'__cfduid=d06c9e9f130bda3e4aa90cb3c1c2197181535039321; UM_distinctid=1656779eac081-0eb04f4f6893b4-34627908-fa000-1656779eac2127; kt_tcookie=1; kt_is_visited=1; CNZZDATA1264603175=814540470-1535034207-%7C1535039279; video_log=17157%3A1535038659%3B20705%3A1535041275%3B; kt_qparams=id%3D16627%26dir%3Dfhd; PHPSESSID=65jg2qh4ppaiqmp1f220ahr275',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
        }
    }
    if(method === 'GET'){
        obj.qs = params
    }else{
        obj.body = JSON.stringify(params) 
    }
    return obj;
}

const $api = (options,isJson)=>{
    return new Promise((resolve,reject)=>{
        request(options,(error,response,body)=>{
            if(error){
                console.log(error)
                reject({status:response.statusCode,error})
            }else if(response.statusCode != 200){
                console.error('remote api failed', options, body)
                reject({status:response.statusCode,body})
            }else{
                resolve(body)
            }
        })
    })
}

const $get =  (url,params={})=>{
    const options = getConfig('GET',url,params)
    // console.log(options)
    // console.log(url)
    return $api(options,true)
}
const $getPlainText = (url,params={}) => {
    const options = getConfig('GET',url,params)
    return $api(options,false)
}

const $post =  (url,params={})=>{
    // console.log('post-->',url,params)
    const options = getConfig('POST',url,params)
    return $api(options,true)
}

const $delete =  (url,params={})=>{
    // console.log(url,params)
    const options = getConfig('DELETE',url,params)
    return $api(options,true)
}

const $put = (url,params={})=>{
    const options = getConfig('PUT',url,params)
    return $api(options,true)
}

const $uploadFile =  (url,formData={})=>{
    const options = {
        url,
        method: 'POST',
        formData
    }
    return $api(options,true)
}

module.exports = {
    $get,
    $getPlainText,
    $post,
    $delete,
    $put,
    $uploadFile
}