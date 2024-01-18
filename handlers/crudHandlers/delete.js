const getOtherAuthKeys = require('../getOtherAuthKeys.js');
const dbModule = require('../../db/db.js');

const handler = options => {
  let err;
  return async (req, res, next) => {
    // TODO: test and make sure auth and authKeys works
    if (options.auth) {
      const args = ['C', { ...req.cookies, ...req.signedCookies }, { ...getOtherAuthKeys(options.authKeys, req) }];
      if (!option.auth(...args)) return res.sendStatus(403);
    }

    if (!req.params.key) return res.status(400).json({ error: `key (the ${options.queryKey}) is required for delete` });

    if (options.id_type.includes('number') && options.queryKey === 'id') req.params.key = parseInt(req.params.key);
    const query = { [options.queryKey]: req.params.key };

    const result = await dbModule
      .getDB(options)
      .deleteOne(query)
      .catch(e => (err = e));
    if (!result.deletedCount) return res.status(400).json({ error: `did not find any document with {${options.queryKey}: ${req.params.key}}` });
    if (err) return res.status(500).json({ error: err?.message || err });
    return res.sendStatus(204);

    // temp
    res.json({ message: `Automatic response from automated-crud (This is NOT a real response)` });
  };
};
module.exports = handler;
