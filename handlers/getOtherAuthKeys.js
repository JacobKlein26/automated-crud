module.exports = (authKeys, req) => {
  const result = {}
  authKeys.forEach(key => result[key] = req[key]);
  return result
}