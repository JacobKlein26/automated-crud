
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
		- custom: see more info below
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

#### GET queries
When calling get without a queryKey (e.g. calling `/items/` and not `/items/101`), you can add queries to the request to control what you get,  
You can use the actual DB key as the query, but you can't use the reserved ones (skip, limit, sortKey, and sortType).  
For example - if you want to query `itemCategory` is `"book"` then call `/items?itemCategory=book` and `{ itemCategory: "book"}` will be queried to the DB.  
> You can use dot notation (`.`) for nested or advanced queries examples.    
> \. escapes the nest (see example 2)  
> All queries are parsed (`parseQueries` option), see Example 3  

***Example 1:*** (simple nested object) 
You want to query the DB item: `{ itemInfo: { category: "book" } }`  
Call: `/items?itemInfo.category=book`  

***Example 2:*** (Query if a nested array includes one of a few values)
You want to query the DB item: `{ itemInfo: { categories: ["book", "reading", "romance"]}}`, and you want to query all that *include* "romance" OR "fun".  
  
Call: `/items?itemInfo\.categories.$in=romance&itemInfo\.categories.$in=fun` ($in is from [Mongo Docs](https://www.mongodb.com/docs/manual/reference/operator/query/in/) for Array includes one of...)
> express queries convert multiple of the same query name into an array, so this query will actually be: `$in.itemInfo.categories = ["romance", "fun"]`  

> *"\."* (escaped dot) will avoid splitting the . (dot) into another nested object, and keep the actual "." - this is usefull when making queries which will only work if you do: `{'itemInfo.categories': {'$in': ['romance','fun']}}` and NOT if you do `{itemInfo: {categories: {'$in': ['romance','fun']}}}`

***Example 3:*** (Query if a value is greather then)
You want to query the DB item: `{ totalSales: 25} `, and you want to query all that are greater then 20.  
Call: `/items?totalSales.$gt=20`  

> Queries will be converted using [express-query-parser](https://www.npmjs.com/package/express-query-parser) so all numbers/booleans/null/undefined are taken care of.  
> if you want to skip this (e.g. you want to be able to query a number as a string like: `{age: "26"}`) then set option parseQueries to `false`


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
| `parseQueries` | parse queries in GET | boolean | true | See [GET queries](#get-queries) section |


#### Future options:
1. validation: already in the README, but not yet implemented
2. auth: already in the README, but not yet implemented
3. sendErrors: include in the response the reason why 400/500 response code is being sent (this will include the query for get)
4. logErrors: log the reasson why 400/500 response codee is being sent (this will include the query for get)

---
Other options in thought:
1. Advanced (hidden) security queries
	- Right now you can query for things using URL queries, (e.g. `{a: "b"}` by sending `?a=b`), (see the [GET queries](#get-queries) section), but for quries that require middleware or need to be hidden (e.g. userAccess includes userId) URL queries won't work...

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
