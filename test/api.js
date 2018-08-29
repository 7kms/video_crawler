const {source:{yaoshe}} = require('../config')
const {$get} = require('../src/utils/api')

const test = async ()=>{
    let res = await $get(yaoshe)
    console.log(res)
}


test()