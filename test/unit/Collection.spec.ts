import { Collection, ConstructorSettings } from '../../src/collection/Collection'
import { MongoClient } from 'mongodb'
import config from '../config'

describe('Collection', () => {
   const target = new Collection('t')

   const setting: ConstructorSettings = {
      dbName: 'test',
      pagination: {
         defaultPageSize: 5
      },
      writeConcern: {
         w: 1,
         j: true,
         wtimeout: 2000
      },
      transform: {
         createdAt: false
      },
      populates: {
         target: target
      },
      indexes: [[{ target: 1 }]],
      dropAdditionalIndexes: true
   }

   const users = new Collection('users', setting)
   it('Constructor should work', () => {
      expect(users.name).toBe('users')
      expect(users.dbName).toBe('test')
      expect(users.settings.pagination).toEqual(setting.pagination)
      expect(users.settings.writeConcern).toEqual(setting.writeConcern)
      expect(users.settings.transform).toEqual(setting.transform)
      expect(users.settings.indexes).toEqual(setting.indexes)
      expect(users.settings.dropAdditionalIndexes).toBe(setting.dropAdditionalIndexes)
   })
})

describe('setClient', () => {
   it('should set connected MongoClient', async () => {
      const users = new Collection('users')
      const c = new MongoClient(config.MongoUrl)
      await c.connect()
      users.setClient(c)

      expect(users.client).toBe(c)
      expect(users.base).toBeTruthy()
      expect(users.connected).toBe(true)
   })

   it('should set unconnected MongoClient', async () => {
      const users = new Collection('users')
      const c = new MongoClient(config.MongoUrl)
      users.setClient(c)
      expect(users.client).toBe(c)
      expect(users.base).toBeFalsy()
      expect(users.connected).toBe(false)
   })
})

// describe('Indexes', () => {
//    it('should work', async () => {
//       const client = new MongoClient(config.MongoUrl)

//       const users = new Collection('users', {
//          client,
//          indexes: [[{ a: 1 }]]
//       })

//       users.on('initialized', () => {})

//       expect(users.client).toBe(c)
//       expect(users.base).toBeTruthy()
//       expect(users.connected).toBe(true)
//    })

//    it('should set unconnected MongoClient', async () => {
//       const users = new Collection('users')
//       const c = new MongoClient(config.MongoUrl)
//       users.setClient(c)
//       expect(users.client).toBe(c)
//       expect(users.base).toBeFalsy()
//       expect(users.connected).toBe(false)
//    })
// })
