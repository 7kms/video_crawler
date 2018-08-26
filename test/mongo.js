const mongo = require('../src/dao/mongo')


let test = async ()=>{
   let db =  await mongo();
   await db.collection('test').insertOne({test:1})
}
test()