import { Collection, MongoClient } from '../../src/index'
import { ObjectID } from 'mongodb'
import config from '../config'

let client: MongoClient
beforeAll(async () => {
   if (!client) {
      client = new MongoClient(config.MongoUrl)
      await client.connect()
   }
})

describe('populates', () => {
   interface User {
      name: string
   }
   interface Post {
      creator: ObjectID
      text: string
   }
   let users: Collection<User>
   let posts: Collection<Post>

   beforeAll(async () => {
      if (!users) users = new Collection<User>('users', { client })
      if (!posts) {
         posts = new Collection('posts', {
            client,
            populates: {
               creator: users
            }
         })
      }

      const p1 = users.deleteMany()
      const p2 = posts.deleteMany()
      await Promise.all([p1, p2])
   })

   it('should populate simple doc/key', async () => {
      const user = await users.insertOne({
         entity: { name: 'Erfan' }
      })
      const post = await posts.insertOne({
         entity: {
            creator: user._id,
            text: 'hello populate'
         }
      })

      const result = await posts.findOne({
         query: { text: 'hello populate' },
         populate: ['creator']
      })

      expect(result).toEqual({
         _id: post._id,
         _createdAt: post._id.getTimestamp(),
         text: 'hello populate',
         creator: {
            _id: user._id,
            _createdAt: user._id.getTimestamp(),
            name: 'Erfan'
         }
      })
   })
})
