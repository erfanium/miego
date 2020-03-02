import { getIdsFromDoc } from '../../src/collection/Populator'
import { ObjectID } from 'mongodb'

describe('Populator', () => {
   it('getIdsFromDoc with simple doc', () => {
      const doc = {
         _id: new ObjectID(),
         creator: new ObjectID(),
         v: 1
      }
      const requiredIds: ObjectID[] = []
      getIdsFromDoc(doc, ['creator'], requiredIds)
      expect(requiredIds).toEqual([doc.creator])
   })
   it('getIdsFromDoc with nested Object', () => {
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
   it('getIdsFromDoc with Array of ObjectID', () => {
      const doc = {
         _id: new ObjectID(),
         b: [new ObjectID(), new ObjectID()]
      }
      const requiredIds: ObjectID[] = []
      getIdsFromDoc(doc, ['b'], requiredIds)
      expect(requiredIds).toEqual(doc.b)
   })

   it('getIdsFromDoc with Array of Doc', () => {
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
