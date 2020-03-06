# Collection

## constructor

##### Parameters

-  name: «String» collection name

-  settings: «Object?» collection settings.

```js
 const  setting: ConstructorSettings = {
	client: myClient, // which MongoClient to use?
	dbName:  'test',  // which database of connection? default: test
	pagination: {
		defaultPageSize:  5 // default pageSize if pageSize not found in query params
	},
	writeConcern: {
		w:  1,
		j:  true,
		wtimeout:  2000
	},
	transform: {
		createdAt:  false // default: true
	},
	populates: {
		fieldKeyA:  targetCollection, // easy-hand definition
		fieldKeyB:  {
			target: targetCollection, // populate from which collection?
			params :
				populate: [], // option for nested populate
				fields: ['-password'] // which target fields to populate
			}
		},
	},
	indexes: [
		[{ a:  1 }],
		[{ a:  1, b: -1 }, { unique: true }]
	],
	dropAdditionalIndexes:  true // will drop additional indexes after connecting
}



const  users = new Collection('users', setting)
```

## Methods:

### `setClient()`

Sets MongoClient to Collection. You won't need it if you declared `client` key in your settings object.

##### Parameters

-  client: «MongoClient»

### `useNative()`

Returns native mongodb collection methods. For example, Miego doesn't support `aggregate` method it self, but you can use it like:

```js
posts.useNative().aggregate([...])
// or
posts.useNative().initializeOrderedBulkOp()
```

## Operations Methods:

### `insertOne()`

```js
const post = users.insertOne({
	entity: {name: 'Erfan'}  // entity object - required
	writeConcern: {  // write concern options - optional
		w:  1,
		j:  true,
		wtimeout:  2000
	}
})
```

And result be like:

```js
{
	_id: ObejectID('5e62aff21b3e1512bc370b39'),
	_createdAt: Date(`2020-03-06T22:22:01.141Z`),
	name: 'Erfan'
}
```

### `insertMany()`

```js
const post = users.insertMany({
	entity: [{name: 'Erfan'}, {name: 'Moji'}]  // entities objects - required,
	ordered: true // boolean - optional - default: false,
	skipWriteError: false // boolean - optinoal - default: false
	writeConcern: {  // write concern options - optional
		w:  1,
		j:  true,
		wtimeout:  2000
	},
	bypassValidation: false // bypassing mongodb schema validator - boolean - optinoal - default: false
})
```

And result be like:

```js
{
	ok: true,
	insertedCount: 2,
	errors: [],
	docs: [
		{
			_id: ObejectID('5e62aff21b3e1512bc370b39'),
			_createdAt: Date(`2020-03-06T22:22:01.141Z`),
			name: 'Erfan'
		},{
			_id: ObejectID('5e62aff21b3e1512bc370b39'),
			_createdAt: Date(`2020-03-06T22:22:01.141Z`),
			name: 'Moji'
		}
	]

}
```

### `findOne()`

```js
const post = users.findOne({
	query: {age: 19}  // query object - optional - default: {}
	sort: '-name', // mongodb findOne sort option - string - optional
	fields: ['name', 'phone', '-address'], // which fields to be included or excluded - optional
	skip: 0, // mongodb skip option, number - optional
	populate: ['champain']
})
```

And result be like:

```js
{
	_id: ObejectID('5e62aff21b3e1512bc370b39'),
	_createdAt: Date(`2020-03-06T22:22:01.141Z`),
	name: 'Erfan',
	phone: '1234567894',
}
```
