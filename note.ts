import { Collection } from './src/index'
// import faker from 'faker'
import mongodb, { ObjectID } from 'mongodb'
import http from 'http'

const client = new mongodb.MongoClient('mongodb://localhost:27017', {
   // useUnifiedTopology: true,
   reconnectTries: 60,
   reconnectInterval: 1000
})

interface Post {
   creator: ObjectID
   text: string
}
interface User {
   name: string
}

const users = new Collection<User>('users', {
   client,
   indexes: [[{ name: 1 }]],
   dropAdditionalIndexes: true
})

const posts = new Collection<Post>('posts', {
   client,
   populates: {
      creator: users
   }
})

async function doo(): Promise<void> {
   await client.connect()

   http
      .createServer(async (req, res) => {
         const result = await posts.list({
            query: {},
            populate: ['creator']
         })
         // const result = await posts.useNative().find()
         res.setHeader('Content-Type', 'application/json')
         res.end(JSON.stringify(result))
      })
      .listen(3000)
}

doo()
