import { Populator, getIdsFromDoc, replaceIdsFromDoc, pushIfNotExist } from '../../src/collection/Populator'
import { ObjectID } from 'mongodb'
import { Collection } from '../../src'

describe('constructor', () => {
   it('should set populator keySettings correctly', () => {
      const keysSetting = {
         creditor: new Collection('creator'),
         debtor: {
            target: new Collection('debtor'),
            params: {
               populate: ['a'],
               fields: ['-phone']
            }
         }
      }
      const populator = new Populator(keysSetting)

      expect(populator.keysSetting.creditor).toEqual({
         target: keysSetting.creditor,
         params: {}
      })

      expect(populator.keysSetting.debtor).toEqual({
         target: keysSetting.debtor.target,
         params: keysSetting.debtor.params
      })
   })
})

describe('getIdsFromDoc', () => {
   it('with simple doc', () => {
      const doc = {
         _id: new ObjectID(),
         creator: new ObjectID(),
         v: 1
      }
      const requiredIds: ObjectID[] = []
      getIdsFromDoc(doc, ['creator'], requiredIds)
      expect(requiredIds).toEqual([doc.creator])
   })
   it('with nested Object', () => {
      const doc = {
         _id: new ObjectID(),
         b: {
            t: 'a',
            g: new ObjectID()
         }
      }
      const requiredIds: ObjectID[] = []
      getIdsFromDoc(doc, ['b', 'g'], requiredIds)
      expect(requiredIds).toEqual([doc.b.g])
   })
   it('with Array of ObjectID', () => {
      const doc = {
         _id: new ObjectID(),
         b: [new ObjectID(), new ObjectID()]
      }
      const requiredIds: ObjectID[] = []
      getIdsFromDoc(doc, ['b'], requiredIds)
      expect(requiredIds).toEqual(doc.b)
   })

   it('with Array of Doc', () => {
      const doc = {
         _id: new ObjectID(),
         b: [
            {
               _id: new ObjectID(),
               a: new ObjectID(),
               foo: 'bar'
            },
            {
               _id: new ObjectID(),
               a: new ObjectID(),
               foo: 'bar2'
            }
         ]
      }
      const requiredIds: ObjectID[] = []
      getIdsFromDoc(doc, ['b', 'a'], requiredIds)
      expect(requiredIds).toEqual([doc.b[0].a, doc.b[1].a])
   })
})

describe('replaceIdsFromDoc', () => {
   it('with simple doc', () => {
      const doc = {
         _id: new ObjectID(),
         creator: new ObjectID(),
         a: new ObjectID()
      }
      const ids: ObjectID[] = [doc.creator]
      replaceIdsFromDoc(doc, ['creator'], ids, {
         [doc.creator.toString()]: {
            name: 'Erfan'
         }
      })
      expect(doc).toEqual({
         _id: doc._id,
         creator: {
            name: 'Erfan'
         },
         a: doc.a
      })
   })

   it('with nested object', () => {
      const doc = {
         _id: new ObjectID(),
         b: {
            t: 'a',
            g: new ObjectID()
         }
      }
      const ids: ObjectID[] = [doc.b.g]
      replaceIdsFromDoc(doc, ['b', 'g'], ids, {
         [doc.b.g.toString()]: {
            foo: 'bar'
         }
      })
      expect(doc).toEqual({
         _id: doc._id,
         b: {
            t: 'a',
            g: {
               foo: 'bar'
            }
         }
      })
   })

   it('with Array of ObjectID', () => {
      const doc = {
         _id: new ObjectID(),
         b: [new ObjectID(), new ObjectID()]
      }
      const ids: ObjectID[] = [...doc.b]
      replaceIdsFromDoc(doc, ['b'], ids, {
         [doc.b[0].toString()]: { fooA: 'barA' },
         [doc.b[1].toString()]: { fooB: 'barB' }
      })
      expect(doc).toEqual({
         _id: doc._id,
         b: [{ fooA: 'barA' }, { fooB: 'barB' }]
      })
   })

   it('with Array of Doc', () => {
      const doc = {
         _id: new ObjectID(),
         b: [
            {
               a: new ObjectID(),
               b: 'f'
            },
            {
               a: new ObjectID(),
               b: 'f'
            }
         ]
      }
      const ids: ObjectID[] = [doc.b[0].a, doc.b[1].a]

      replaceIdsFromDoc(doc, ['b', 'a'], ids, {
         [doc.b[0].a.toString()]: { fooA: 'barA' },
         [doc.b[1].a.toString()]: { fooB: 'barB' }
      })

      expect(doc).toEqual({
         _id: doc._id,
         b: [
            {
               a: { fooA: 'barA' },
               b: 'f'
            },
            {
               a: { fooB: 'barB' },
               b: 'f'
            }
         ]
      })
   })

   it('should not throw error if id does not exist in result object', () => {
      const doc = {
         _id: new ObjectID(),
         creator: new ObjectID(),
         a: new ObjectID()
      }
      const ids: ObjectID[] = [doc.creator]
      replaceIdsFromDoc(doc, ['creator'], ids, {})
      expect(doc).toEqual({
         _id: doc._id,
         creator: undefined,
         a: doc.a
      })
   })
})

describe('tool functions', () => {
   it('pushIfNotExist', () => {
      const a = ['a']
      pushIfNotExist('b', a)
      pushIfNotExist('b', a)
      pushIfNotExist(undefined, a)
      pushIfNotExist(['a', 'b', 'c', 'd', undefined], a)
      expect(a).toEqual(['a', 'b', 'c', 'd'])
   })
})
