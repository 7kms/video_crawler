const {yaoshe:{target_url}} = require('../config')
const mainPage = require('./pages/main')
const detailPage = require('./pages/detail')




class Entity {
  async start(){
   let list1 = await mainPage.run(target_url);
   return list1
  }
  async run(list){
    new detailPage(list)
  }
}


module.exports = new Entity()