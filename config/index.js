const dev = require('./development')
const prod = require('./production')
const isProd = process.env.NODE_ENV == 'production'
console.log('isProd = %s', isProd)

const base = {}

const envConfig = isProd ? prod : dev;
module.exports = Object.assign({},base,envConfig);

