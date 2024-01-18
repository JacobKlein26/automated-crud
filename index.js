const connectDB = require('./db/connect.js')
const getDBURI = require('./db/getURI.js')
const routerBuilder = require('./handlers/router.js')

let globalOptions = {
  dbName: undefined,
  protocol: 'mongodb',
  host: 'localhost',
  port: 27017,
  dbURI: undefined,
  disableAction: [],
  id_type: 'number',
  queryKey: 'id',
  updateMethod: '$set',
  parseQueries: true,
  // sendErrors: false, // add the ability to control if the reason 400/500 is being sent should be in the response body (including the query when calling get)
  // logErrors: true, // add the ability to control if the reason 400/500 is being sent should be logged (including the query when calling get)
}
const dbs = {}

const mainFunc = options => {
  options = {...globalOptions, ...options}
  const dbURI = getDBURI(options)
  if (!dbs[dbURI]) {
    if (!Object.keys(dbs)) {
      console.error(`ERROR: automated-crud -> no dbs found, will use 404 (make sure to call automatedCrud.connectDB({dbName, collectionName})). `)
    } else {
      console.error(`ERROR: automated-crud -> db at '${dbURI}' not found, will use 404 (if multiple DBS are connected, make sure to pass the correct connection params). `)
    }
    return routerBuilder.all404()
  }
  if (!options.dbName || !options.collectionName){
    console.error(`ERROR: automated-crud -> dbName and collectionName are required in either connectDB or when configuring route, will use 404. `)
    return routerBuilder.all404()
  }
  return routerBuilder(options, dbs[dbURI])
}

// mainFunc.setGlobalOptions = options => {
//   globalOptions = {...globalOptions, ...options}
//   return globalOptions
// }
mainFunc.connectDB = async options => {
  options = {...globalOptions, ...options}
  const dbURI = getDBURI(options)
  if (dbs[dbURI]) return
  if (!Object.keys(dbs).length) globalOptions = globalOptions = {...globalOptions, ...options} // first DB being connected - asign it's values to globalOptions
  dbs[dbURI] = connectDB(options, dbs) // await the connection later, because if I await here dbs[dbURI] will be undefined and the router won't be built...
  await dbs[dbURI].catch(e=>(console.error('ERROR: automated-crud -> failed to connect to mongo. ',e), null))
} 

module.exports = mainFunc
