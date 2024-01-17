const {dbs} = require('./connect.js');
const getDBURI = require('./getURI.js');

const getClient = options => dbs[getDBURI(options)]
const getDB = options => {
  const client = getClient(options)
  // console.log('dbs: ', dbs, 'dbURI', getDBURI(options),'client: ', client);
  return client.db(options.dbName).collection(options.collectionName)
}

const getLatestNumberId = options =>
  new Promise(async (res, rej) => {
    let err;
    const db = getDB(options);
    latestDoc = await db.findOne({}, {sort:['id',-1], projection:{id:1}}).catch(e=>err=e)
    if (err) return rej(err)
    res(latestDoc?.id || 0)
  });

module.exports = {
  getClient,
  getDB,
  getLatestNumberId
  // removeOne/deleteOne
}