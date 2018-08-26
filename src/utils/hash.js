const crypto = require('crypto')

exports.md5 = (content)=>{
    const md5 = crypto.createHash('md5');
    md5.update(content);
    return md5.digest('hex');
}