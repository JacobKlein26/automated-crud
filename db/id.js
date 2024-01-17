
const getClient = require('./db.js').getClient

const getLatestNumberId = options =>
  new Promise(async (res, rej) => {
    let err;
    const client = getClient(options);
    const db = client.db(options.dbName).collection(options.collectionName);

    latestDoc = await db.findOne({}, {sort:['id',1], projection:{id:1}}).catch(e=>err=e)
    console.log('latestDoc:', latestDoc);
    if (err) return rej(err)
    res(latestDoc?.id || 0)
  });

// const confirmRandomId = (id, options) => {
//   const db = getClient(options);
// };
module.exports = {
  getLatestNumberId,
  // confirmRandomId
};
