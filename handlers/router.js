const express = require('express');
const getDBURI = require('../db/getURI.js');

const addHandlers = async (router, options, db) => {
  const dbConnected = await db.catch(e => null);

  if (!dbConnected) {
    const dbURI = getDBURI(options);
    console.error(`automated-crud failed -> db '${dbURI}' not connected, will use 500`);
    return routerBuilder.all500(router);
  }

  if (!options.disableAction.includes('C')) router.post('/', require('./crudHandlers/post.js')(options));
  if (!options.disableAction.includes('R')) router.get('/:key?', require('./crudHandlers/get.js')(options));
  if (!options.disableAction.includes('U')) router.put('/:key', require('./crudHandlers/put.js')(options));
  if (!options.disableAction.includes('D')) router.delete('/:key', require('./crudHandlers/delete.js')(options));
};
const routerBuilder = (options, db) => {
  // console.log('routerBuilder, options:', options);
  const router = express.Router();
  router.use(express.json());
  addHandlers(router, options, db);
  return router;
};
routerBuilder.all404 = router => {
  router = router || express.Router();
  // router.all('/', (req, res)=>res.sendStatus(404))
  return router;
};
routerBuilder.all500 = router => {
  router = router || express.Router();
  router.all('/', (req, res) => res.sendStatus(500));
  return router;
};

module.exports = routerBuilder;
