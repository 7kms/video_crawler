const colors = require('colors');
const logger = require('tracer').colorConsole({
    format : " {{timestamp}} <{{title}}> {{message}} (in {{path}}:{{line}})",
    dateformat : "HH:MM:ss.L",
    filters: {
        log: colors.gray,
        trace : colors.magenta,
        debug : colors.blue,
        info : colors.green,
        warn : colors.yellow,
        error : [ colors.red, colors.bold ]
    }
})
global.logger = logger
module.exports = logger