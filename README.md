
# AUTOMATED CRUD
A module to get started in seconds with basic CRUD operations
Built with express (uses `Router`) and mongodb.

For most basic setup, install it, require it (or import), connect to DB, and use it. Example:
```
...
const automatedCrud = require('automated-crud')
automatedCrud.connectDB({
	// ...options
	dbName: 'store',
	collectionName: 'items'
})
app.use('/items', automatedCrud())
app.use('/users', automatedCrud({
	// ... options
	collectionName: 'users'
}))
...
```

---
### Route Methods:
1. POST -> Create a new DB object
	- `id` will be added automatically (except if  `id_type` is set to `skip`)
	- Will return the object that was added, unless adding failed (auth: 403, validation: 400, other reason: 500)
2. GET -> Get 1 or all objects
	- To get 1 object call and include the `queryKey` value (e.g. `/items/1`)
	- To get all objects call directly (e.g. `/items`) - and you can add the following queries:
		- skip: skip X amount of docs.
		- limit: limit to X amount of docs.
		- sortKey: sort by this DB key.
		- sortType: sort in asc/desc order (1/-1) 1 is default.
	- Will return:
		- Getting 1 doc: the object, 400 if not found, 500 if failed.
		- Getting all docs: Array of docs, empty if non found, 500 if failed.
3. PUT -> Update 1 object
	- Requires the `queryKey` value (e.g. `/items/2`)
	- Will use `$set` by default, can be changed in options
	- Returns the (full) updated object, 400 if not found, 500 if failed
4. DELETE -> Delete 1 object
	- Requires the `queryKey` value (e.g. `/users/jacobKlein26`)
	- Returns 204, 400 if not found, 500 if failed

## Options:
- Options can be sent either when calling connectDB or when configuring route, routes has higher priority
- options sent to first `connectDB` call will be re-used for all routes (unless overwritten)
- If more then 1 DB is connected the db connection information (`dbURI` or `protocol/host/port`) has to be passed EVERY time a new route is configured (or the first connection will be used)


| Option name | explanation | type | default | Memo |
|--|--|--|--|--|
| `dbName` | The name of the DB | string | none | Required
| `collectionName` | The name of the collection| string | none | Required
| `dbURI` | Full DB connection URI  | string| none | Will overwrite `protocol/host/port` |
| `protocol` | Protocol for DB connection | string | `mongodb` |  |
| `host` | Host for DB connection | string | `localhost` |  |
| `port` | Port for DB connection | int/string | `27017` |  |
| `queryKey` | The key that will be used when querying DB| string | `id` |  |
| `id_type` | The type of the (auto created) id | string | `number` | See `id_type` section below |
| `updateMethod` | The operator to use when updating | string | `$set` | See `update_method` section below |
| `disableAction` | Disable a specific METHOD from CRUD | array  strings | `[]` | Possible values are: `C/R/U/D` |
| `validation` | Concept: function to validate before C/U, didn't build it yet | Not sure yet | none | See validation below |
| `auth` | concept: function to authorize the user before C/R/U/D, didn't build it yet | not sure yet | none | See authorization below |
| `authKeys` | Other keys (from req.\<key>) that will be sent to auth function | array - strings | none | |

---
Other options in thought:
1. When querying data - have a way to add filters (actual queries)
	- This requires 2 levels of filters 1. items that can be filtered using query params in URL (e.g. bookAuthor, itemCategory), and 2. items that require middleware and security (e.g. userAccess includes userId)

---
### Advanced Variables explenation
#### id_type:
The type of ID that will be used when *C* (POST) is called,  can be:  
    - `number` (default): a number starting at 1 and increasing for every doc  
    - `random_number`: a 16 digit random number  
    - `random_string`: a 16 digit random string  
    - `skip`: don't add an id automatically  
    If using `skip` - then something unique has to be sent in in the request body, and if the unique value key is not `id` then `queryKey` has to be updated to the correct key  
  > updating queryKey will NOT change id to `skip` - `id_type` will continue to be set under `id` key, but will effectively be ignored (as R/U/D will use the `queryKey` to query the document)  

---
#### update_method:
see [MongoDB docs](https://www.mongodb.com/docs/manual/reference/operator/update/) for more information about operators.  
Can be set to false if no operator is to be used - *AN OPERATOR IS REQUIRED* - so this is useful if you want to include more then 1 operator (e.g. `$inc` 1 key and `$set` another key) - but these will have to be sent in request body.  
If `update_method` is defined, the entire request body will be under the operator, for example - when `$set` is used (default): `const updateData = { $set: req.body }`

---
#### validation:
Still need to work this out.  
More or less a function that will be called (C/U) with the Object - and the action will only continue if true is returned  
But might be better to be a schema that is passed, and we call the validation ourselves (doing it this way might be a bit more complicated - but will allow us to respond with the reason validation failed,  it'll also make it simpler for setup)

---
#### authorization:
Still need to work this out.  
More or less it'll be a function that is called with certain param passed to it (action being performed, cookies, and other information from the request (see `authKeys`)  
The function will decide according to the params given if the user is allowed to perform the action (C/R/U/D), if not return false and we'll send 403  
> If you want to use a middleware that adds req.user, or any other keys into the request, then `authKeys` can be used, 
> For example: if `authKeys: ['user']` when the auth function is called req.user (from the request) will be passed to it.

---
  
## for thought:
  - What about the next() function - should we ever give an option to call that (e.g. if auth fails - maybe call next instead of returning 403)
    - In different words, are we the FULL handler, or can we be used a middleware (in which case we have to call next())
    - as of now we'll build it without it, but the thought exist if I ever want to look at it...

---
All function names are based that automated-crud is imported on the variable automatedCrud, 
```const automatedCrud = require('automated-crud')```
### functions 
1. Main function (```automatedCrud()```)
    - Builds the actual routes
2. ```connectDB```
    - Connect a mongodb instance
    - > Note: If you only connect 1 it'll be reused automatically for all routes, if you connect more then 1 you will have to say the dbURI (or protocol/host/port) and dbName every time you configure routes (or the 1st one will be used)
