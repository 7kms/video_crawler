const {$get} = require('../../utils/api')

class Page {
    constructor(list){
      this.initialList = list;
      this.queue = [];
      this.run();
    }
    getTargetUrl(dom){
        const reg = /video_url:.*?'(.*?)'/;
        let res = dom.match(reg);
        let url = '';
        if(res){
            url = res[1]
        }
        return url;
    }
    getNextList(dom){

    }
    async run(){
        let list = this.initialList;
        for(let {url} of list){
            let dom = await $get(url);
            let target_url = this.getTargetUrl(dom);
            console.log(target_url)
            // let newList = this.getNextList(dom);
        }
    }
}
module.exports = Page