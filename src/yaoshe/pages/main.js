const {$get} = require('../../utils/api')
const cheerio = require('cheerio')

class Page {
    constructor(){
      this.list = []
    }
    processHref(href){
      let reg = /videos\/(\d+?)\//;
      let res = href.match(reg);
      let id = res ? res[1] : null;
      return id ? `https://yaoshe11.com/embed/${id}` : false;
    }
    async run(target_url){
        try{
            let dom = await $get(target_url);
            const $ = cheerio.load(dom);
            $('.list-videos .item a').each((index,item)=>{
              let {title,href} = item.attribs;
              let duration = $(item).find('.duration').text();
              let minute = Number(duration.split('分')[0]);
              href = this.processHref(href);
              if(href){
                this.list.push({title,href,minute})
              }
            })
            return this.list;
          }catch(e){
            console.log(e)
          }
    }
}
module.exports = new Page()