const getOtherAuthKeys = require('../getOtherAuthKeys.js');
const dbModule = require('../../db/db.js');

const getId = options =>
  new Promise(async (res, rej) => {
    let result, err;
    const id_type = options.id_type;
    if (id_type === 'number') {
      result = await dbModule
        .getLatestNumberId(options)
        .then(x => x + 1)
        .catch(e => (err = e));
      if (err || !result) return rej(err);
      return res(result);
    }
    if (id_type === 'random_number') {
      result = parseInt(`${Math.random() + 0.000000001}`.slice(2, 10) + `${Math.random() + 0.25}`.slice(2, 10));
    }
    if (id_type === 'random_string') {
      result = (Math.random().toString(36) + '00000000000000000').slice(2, 10) + Math.random().toString(36).slice(2, 10);
    }
    if (!result) return rej('getId error -> failed to create id. Make sure id_type is one of number, random_number, random_string');
    return res(result); // I don't validate, but the "id" field in the DB should have an index with unique, so the tiny chance it already exists - it should simply fail to insert... (which should reply with error - and user can try again)
  });
const handler = options => {
  return async (req, res, next) => {
    let err;
    const data = req.body;
    if (!data) return res.status(400).json({ error: 'empty request body' });

    // I moved validator to after id - as the validator will probably need the id...

    // TODO: test and make sure auth and authKeys works
    if (options.auth) {
      const args = ['C', { ...req.cookies, ...req.signedCookies }, { ...getOtherAuthKeys(options.authKeys, req) }];
      if (!option.auth(...args)) return res.sendStatus(403);
    }

    if (options.id_type !== 'skip') {
      const id = await getId(options).catch(e => (err = e));
      if (err || !id) return res.status(500).json({ error: err?.message || err });
      data.id = id;
    }
    // TODO: test and make sure validator works
    // maybe have the ability to call Mongoose or AJV directly - and only the schema will have to be passed
    if (options.validator && !options.validator(data)) {
      return res.sendStatus(400);
    }
    const result = await dbModule
      .getDB(options)
      .insertOne({ ...data })
      .catch(e => (err = e));
    if (err) return res.status(500).json({ error: err?.message || err });
    return res.json(data);

    // temp
    res.json({ message: `Automatic response from automated-crud (This is NOT a real response)` });
  };
};
module.exports = handler;
