import { Collection, Connection } from './src/index'
// import faker from 'faker'
import { ObjectID } from 'mongodb'
import http from 'http'

const connection = new Connection()

interface Post {
   creator: ObjectID
   text: string
}
interface User {
   name: string
}

const users = new Collection<User>('users', {
   connection
})

const posts = new Collection<Post>('posts', {
   connection,
   populates: {
      creator: users
   }
})

async function doo() {
   await connection.connect()

   http
      .createServer(async (req, res) => {
         const result = await posts.findMany({
            query: {},
            page: 1,
            populate: ['creator']
         })
         res.setHeader('Content-Type', 'application/json')
         res.end(JSON.stringify(result))
      })
      .listen(3000)

   console.log('start')
}

doo()
