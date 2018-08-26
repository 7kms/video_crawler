const puppeteer = require('puppeteer');


class UrlService{

    constructor(){

    }


    async yaose(url){
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);
        
    }



}


module.exports = UrlService;