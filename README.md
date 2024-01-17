# AUTOMATED CRUD
A module to quickly add full CRUD operations to any path with express/mongodb

It'll add 4 routes to: Create, Read, Update, and Delete DB Objects.
It'll work as a simple router - just like any different `express.router()` (all paths' will be at / - because the actual pathname will be in the call to it...)
The paths' will be differentiated using the METHOD (POST/GET/PUT/DELETE)
By default it'll take ANYTHING you give it, and allow it without any validation - but options allow you to control the schema / auth control / etc


## Routes:
1. POST: Create a new DB object
  - Will allways add an ID
  - Returns the result of the object, 400 if failed validation (if included), 500 if failed to add

2. GET: Get the Object
  - For a single object pass the queryKey (GET -> /:<key>)
  - For ALL objects skip the queryKey (GET -> /)
  - When getting ALL objects, the following queries are supported:
    - skip: skip X amount of documents
    - limit: limit to X amount of documents
    - sortKey: sort the DB when making the query using this key
    - sortType: sort in asc/desc order (1/-1) 1 is default
  - Returns:
    - Getting 1 document - the document, 400 if not found, 500 if failed
    - Getting all docs - an Array of documents (emtpy if non found), 500 if failed

3. PUT: Update a DB object
  - Requiers the query key (PUT -> /:<key>) 
  - Will use $set by default (option)
  - Returns the updated object, 400 if not found, 500 if failed to update

4. DELETE: Delete a DB Object 
  - Requiers the query key (DELETE -> /:<key>)
  - Returns 204 if deleted, 400 if not found, 500 if failed to delete

## Options:
#### Required:
  - dbName: The name of the DB
  - collectionName: The name of the collection
#### Optional
  - dbHost: The host for the DB (localhost)
  - dbPort: The port for the DB (27017)
  - validation: a function that will be called (C/U) with the Object - and the action will only continue if true is returned
  - id_type: the type of "id" that will be used 
    - number (default - will start at 1, and increase)
    - random_string
    - random_number
    - skip (if ID is already in the body - or if we're using different key(s))
  - queryKey: the "key" to use when querying the DB (R/U/D) - id by default
  - updateMethod: the method to use when updating - default $set, if false the update method won't be set by us (would need to be sent in request body)
  - disableAction: The ability to disable any action (e.g. if delete's are handled by updating a value that the Object is "inactive")
  - auth: a function that will be called with the cookies, the action type (C/R/U/D), and authKeys (next...) - and action will only continue if true is returned
  - authKeys: an array of keys from req.<key> which will be sent to the auth function (e.g. if you want to utilize a use middleware and pass the req.user to the auth) 
  
  
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
<!-- 2. ```setGlobalOptions``` 
  - Sets options that will be used across the board -->
2. ```connectDB```
  - Connect a mongodb instance
    - if you only connect 1 it'll be reused automatically for all routes, if you connect more then 1 you will have to say the dbURI (or protocol/host/port) and dbName every time you configure routes (or the 1st one will be used)
