# MIEGO

Miego is [MongoDB](https://www.mongodb.org/) native driver + more facilities!

[![NPM version](https://badge.fury.io/js/miego.svg)](http://badge.fury.io/js/mongoose)

## Features

**Populates:** Miego supports all kind of document populations. (Nested populate, Array populate, Cross database/service populate)

**Pagination:** Pagination will be very convenient, no more plugins

**No risk:** By using Miego `useNative()` method, You can use ALL mongodb native operations without any changes

**Reliable:** Miego will never use any deprecated Mongodb methods!

**Performance:** Blazing fast! 4x faster than Mongoose!

**Better structure:** No more Mongoose document, pseudo Promise , `lean()`, `toObject()`, and other mongoose sucks

**Best choose for Typescript:** You can use interfaces as a generic for Collection class

## Hello World

It's easy to use.
First you need setup connection via `MongoClient`:

```js
import { Collection, MongoClient } from 'miego'

const client = new MongoClient('mongodb://localhost:27017')
await client.connect()
```

Next, Creating collections:
**JS:**

```js
const users = new Collection('users', {
   client
})
```

**TS:**

```ts
interface User {
   name: string
}

users = new Collection<User>('users', { client })
```

Use it😅:

```js
const user = await users.insertOne({
   entity: { name: 'Erfan' }
})
```

## Contributors

Pull requests are always welcome!
