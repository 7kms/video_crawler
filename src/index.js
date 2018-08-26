require('./utils/logger')
const Yaoshe = require('./source/yaoshe')
const fs = require('fs')
const path = require('path')

class Crawler{

    start(){
        new Yaoshe().start()
    }
}


let instance = new Crawler()

instance.start();