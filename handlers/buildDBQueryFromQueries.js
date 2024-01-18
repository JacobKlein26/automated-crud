module.exports = queries => {
  ['skip', 'limit', 'sortKey', 'sortType'].forEach(specialKey => {
    delete queries[specialKey];
  });
  const result = {};
  Object.entries(queries).forEach(queryPair => {
    const key = queryPair[0],
      value = queryPair[1];
    if (!key.includes('.')) return (result[key] = value);
    let addToNextOne = [];
    let keys = key.split('.').reduce((result, key) => {
      if(!key) return result
      if (key.endsWith('\\')) return (addToNextOne.push(key.slice(0, -1)), result);
      
      if (addToNextOne.length) key = `${addToNextOne.join('.')}.${key}`
      result.push(key);
      addToNextOne = [];
      return result;
    }, []);
    const lastKey = keys.pop();
    const lastObj = keys.reduce((result, key) => (result[key] = result[key] || {}), result);
    lastObj[lastKey] = value;
  });
  return result;
};
