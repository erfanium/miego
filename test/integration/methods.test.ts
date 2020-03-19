import { Collection, MongoClient } from '../../src/index'
import { ObjectID } from 'mongodb'
import config from '../config'

let client: MongoClient
let users: Collection

beforeAll(async () => {
   if (!client) {
      client = new MongoClient(config.MongoUrl)
      await client.connect()
      if (!users) users = new Collection('users', { client })

      users
         .useNative()
         .drop()
         .catch()
   }
})

describe('insertOne', () => {
   it('should work', async () => {
      const result = await users.insertOne({
         entity: { name: 'Erfan', age: 19 }
      })

      expect(result).toBeTruthy()
      expect(result._id).toBeInstanceOf(ObjectID)
      expect(result._createdAt).toEqual(result._id.getTimestamp())
      delete result._id, delete result._createdAt

      expect(result).toEqual({
         name: 'Erfan',
         age: 19
      })
   })
})

describe('insertMany', () => {
   it('should work', async () => {
      const result = await users.insertMany({
         entities: [
            { name: 'Post Malone', age: 25 },
            { name: 'Slim Shady', age: 50 },
            { name: 'Hassan', age: 19 }
         ]
      })

      expect(result).toBeTruthy()
      expect(result.insertedCount).toBe(3)
      expect(result.ok).toBe(true)
      expect(result.docs[0].name).toBe('Post Malone')
      expect(result.docs[1].name).toBe('Slim Shady')
      expect(result.docs[2].name).toBe('Hassan')

      result.docs.forEach((doc) => {
         expect(doc._createdAt).toBeTruthy()
      })
   })
})

describe('findOne', () => {
   it('should work', async () => {
      const result = await users.findOne({
         query: { name: 'Post Malone' }
      })

      expect(result).toBeTruthy()
      expect(result._id).toBeInstanceOf(ObjectID)
      expect(result._createdAt).toEqual(result._id.getTimestamp())
      delete result._id, delete result._createdAt

      expect(result).toEqual({
         name: 'Post Malone',
         age: 25
      })
   })
})

describe('findMany', () => {
   it('should work', async () => {
      const result = await users.findMany({
         query: { age: 19 }
      })

      expect(result).toBeTruthy()
      expect(result.length).toBe(2)
      expect(result[0].name).toBe('Erfan')
      expect(result[1].name).toBe('Hassan')

      result.forEach((doc) => {
         expect(doc._createdAt).toBeTruthy()
      })
   })

   it('with pagination', async () => {
      const result = await users.findMany({
         page: 1,
         pageSize: 2
      })

      expect(result).toBeTruthy()
      expect(result.length).toBe(2)
      expect(result[0].name).toBe('Erfan')
      expect(result[1].name).toBe('Post Malone')
   })
})

describe('list', () => {
   it('should work', async () => {
      const result = await users.list({
         query: {},
         pageSize: 2,
         page: 1
      })

      expect(result).toBeTruthy()
      expect(result.nResults).toBe(4)
      expect(result.page).toBe(1)
      expect(result.pageSize).toBe(2)
      expect(result.totalPages).toBe(2)

      expect(result.docs.length).toBe(2)
      expect(result.docs[0].name).toBe('Erfan')
      expect(result.docs[1].name).toBe('Post Malone')

      result.docs.forEach((doc) => {
         expect(doc._createdAt).toBeTruthy()
      })
   })
})

describe('findManyAndReturnObject', () => {
   it('should work', async () => {
      const result = await users.findManyAndReturnObject({
         query: {},
         key: 'name'
      })

      expect(result).toBeTruthy()
      expect(result.Erfan.name).toBe('Erfan')
      expect(result.Erfan.age).toBe(19)
      expect(result.Hassan._id).toBeInstanceOf(ObjectID)
   })
})

describe('updateOne', () => {
   it('should work', async () => {
      const result = await users.updateOne({
         query: { name: 'Slim Shady' },
         update: {
            $set: { age: 30 }
         }
      })

      expect(result).toBeTruthy()
      delete result.upsertedId
      expect(result).toEqual({
         updatedCount: 1,
         upsertedCount: 0,
         matchedCount: 1,
         ok: true
      })
   })
})

describe('updateMany', () => {
   it('should work', async () => {
      const result = await users.updateMany({
         query: { age: 19 },
         update: {
            $set: { age: 18 }
         }
      })

      expect(result).toBeTruthy()
      delete result.upsertedId
      expect(result).toEqual({
         updatedCount: 2,
         upsertedCount: 0,
         matchedCount: 2,
         ok: true
      })
   })
})

describe('findOneAndUpdate', () => {
   it('should work', async () => {
      const result = await users.findOneAndUpdate({
         query: { name: 'Slim Shady' },
         update: {
            $set: { name: 'Em' }
         }
      })

      expect(result).toBeTruthy()
      expect(result.name).toBe('Em')
      expect(result._createdAt).toBeTruthy()
   })
})

describe('findOneAndReplace', () => {
   it('should work', async () => {
      const result = await users.findOneAndUpdate({
         query: { name: 'Post Malone' },
         update: {
            $set: { name: 'The Weeknd', age: 30 }
         }
      })

      expect(result).toBeTruthy()
      expect(result.name).toBe('The Weeknd')
      expect(result.age).toBe(30)
      expect(result._createdAt).toBeTruthy()
   })
})

describe('findOneAndDelete', () => {
   it('should work', async () => {
      const result = await users.findOneAndDelete({
         query: { name: 'Hassan' }
      })

      expect(result).toBeTruthy()
      expect(result.name).toBe('Hassan')
      expect(result.age).toBe(18)
      expect(result._createdAt).toBeTruthy()
   })
})

describe('deleteOne', () => {
   it('should work', async () => {
      const result = await users.deleteOne({
         query: { name: 'Erfan' }
      })

      expect(result).toBeTruthy()
      expect(result.ok).toBe(true)
      expect(result.deletedCount).toBe(1)
   })
})

describe('deleteMany', () => {
   it('should work', async () => {
      const result = await users.deleteMany({
         query: { age: 30 }
      })

      expect(result).toBeTruthy()
      expect(result.ok).toBe(true)
      expect(result.deletedCount).toBe(2)
   })
})

describe('count', () => {
   it('should work', async () => {
      const result = await users.count({
         query: {}
      })

      expect(result).toBe(0)
   })
})
