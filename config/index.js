const dev = require('./development')
const prod = require('./production')
const gray = require('./gray')
const env = process.env.NODE_ENV
console.log('env = %s', env)

const base = {}

const envConfig = env == 'production' ? prod : env == 'gray' ? gray : dev;
const finallyConfig = Object.assign({},base,envConfig);
console.log('finallyConfig',finallyConfig)
module.exports = finallyConfig;

