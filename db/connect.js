const MongoClient = require('mongodb').MongoClient;
const getDBURI = require('./getURI.js');

// every db shoudl only have 1 promise - which will be stored in dbPromises (key is the dbURI)
const dbPromises = {};
const clients = {}
const connectDB = (options) => {
  const dbURI = getDBURI(options);
  if (dbPromises[dbURI]) return dbPromises[dbURI];
  dbPromises[dbURI] = new Promise(async (res, rej) => {
    const client = new MongoClient(dbURI)
    client.connect()
      .then(conn => {
        clients[dbURI] = conn
        res(conn)
      })
      .catch(e=>rej(e))

      // return res(client)
  });
  return dbPromises[dbURI];
};
connectDB.dbs = clients

module.exports = connectDB;
