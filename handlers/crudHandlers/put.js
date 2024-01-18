const getOtherAuthKeys = require('../getOtherAuthKeys.js');
const dbModule = require('../../db/db.js');

const handler = options => {
  let err;
  return async (req, res, next) => {
    // console.log('POST, options: ', options);
    const data = req.body;
    if (!data) return res.status(400).json({ error: 'empty request body' });
    if (!req.params.key) return res.status(400).json({ error: `key (the ${options.queryKey}) is required for update` });

    // I moved validator to after id - as the validator will probably need the id...

    // TODO: test and make sure auth and authKeys works
    if (options.auth) {
      const args = ['C', { ...req.cookies, ...req.signedCookies }, { ...getOtherAuthKeys(options.authKeys, req) }];
      if (!option.auth(...args)) return res.sendStatus(403);
    }

    // TODO: test and make sure validator works
    // maybe have the ability to call Mongoose or AJV directly - and only the schema will have to be passed
    if (options.validator && !options.validator(data)) {
      return res.sendStatus(400);
    }

    if (options.id_type.includes('number') && options.queryKey === 'id') req.params.key = parseInt(req.params.key);
    const query = { [options.queryKey]: req.params.key };

    let updateQuery = { ...data };
    if (options.updateMethod) updateQuery = { [options.updateMethod]: { ...data } };

    const result = await dbModule
      .getDB(options)
      .updateOne(query, updateQuery)
      .catch(e => (err = e));
    if (err) return res.status(500).json({ error: err?.message || err });
    if (!result.matchedCount) return res.status(400).json({ error: `did not find any document with {${options.queryKey}: ${req.params.key}}` });
    // update doesn't return the "final" object, so I'll just get it...
    const updatedObj = await dbModule
      .getDB(options)
      .findOne(query, { projection: { _id: 0 } })
      .catch(e => (err = e));
    if (err) return res.status(500).json({ error: err?.message || err });
    return res.json(updatedObj);
  };
};
module.exports = handler;
