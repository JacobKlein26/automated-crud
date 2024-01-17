const getOtherAuthKeys = require('../getOtherAuthKeys.js');
const dbModule = require('../../db/db.js');

const handler = options => {
  let err;
  return async (req, res, next) => {
    // console.log('POST, options: ', options);
    // if (!req.params.key) return res.status(400).json({ error: `key (the ${options.queryKey}) is required for update` });

    // TODO: test and make sure auth and authKeys works
    if (options.auth) {
      const args = ['C', { ...req.cookies, ...req.signedCookies }, { ...getOtherAuthKeys(options.authKeys, req) }];
      if (!option.auth(...args)) return res.sendStatus(403);
    }

    let query = {},
      limit = 0,
      skip = 0,
      sort = {};

    if (req.params.key) {
      if (options.id_type.includes('number')) req.params.key = parseInt(req.params.key);
      query = { [options.queryKey]: req.params.key };
      limit = 1;
    } else {
      limit = parseInt(req.query.limit) || 0;
      skip = parseInt(req.query.skip) || 0;
      if (req.query.sortKey) {
        if (req.query.sortType && !['1', '-1'].includes(req.query.sortType)) return res.status(400).json({ error: 'sortType needs to be either 1 or -1' });
        sort = { [req.query.sortKey]: parseInt(req.query.sortType) || 1 };
      }
    }
    let result = await dbModule
      .getDB(options)
      .find(query, { projection: { _id: 0 }, skip, limit, sort })
      .skip(skip)
      .toArray()
      .catch(e => (err = e));
    if (err) return res.status(500).json({ error: err?.message || err });
    if (!result[0] && req.params.key) return res.status(400).json({ error: `did not find any document with {${options.queryKey}: ${req.params.key}}` });
    if (req.params.key) result = result[0];
    return res.json(result);
  };
};
module.exports = handler;
