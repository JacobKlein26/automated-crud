module.exports = options => options.dbURI || `${options.protocol}://${options.host}:${options.port}`