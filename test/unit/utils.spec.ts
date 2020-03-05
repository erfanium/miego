import * as Utils from '../../src/collection/utils'
import { Collection } from '../../src'

describe('decodeSortDash', () => {
   it('should work', () => {
      expect(Utils.decodeSortDash('_id')).toEqual(['_id', 1])
      expect(Utils.decodeSortDash('x')).toEqual(['x', 1])
      expect(Utils.decodeSortDash('-_id')).toEqual(['_id', -1])
   })
})

describe('decodeFieldDash', () => {
   it('should work', () => {
      expect(Utils.decodeFieldDash('name')).toEqual(['name', 1])
      expect(Utils.decodeFieldDash('x')).toEqual(['x', 1])
      expect(Utils.decodeFieldDash('-name')).toEqual(['name', 0])
   })
   it('should ignore _id', () => {
      expect(Utils.decodeFieldDash('_id')).toEqual(['_id', 1])
      expect(Utils.decodeFieldDash('-_id')).toEqual(['_id', 1])
   })
})

describe('returnPageSize', () => {
   it('should work', () => {
      const c = new Collection('test', {
         pagination: {
            defaultPageSize: 12
         }
      })

      expect(Utils.returnPageSize(c, undefined)).toBe(12)
      expect(Utils.returnPageSize(c, 8)).toBe(8)
   })
})

describe('returnWriteConcern', () => {
   it('should work', () => {
      const c = new Collection('test', {
         writeConcern: {
            w: 'w',
            j: true,
            wtimeout: 10000
         }
      })

      expect(Utils.returnWriteConcern(c, undefined)).toEqual({ w: 'w', j: true, wtimeout: 10000 })
      expect(Utils.returnWriteConcern(c, { wtimeout: 1200 })).toEqual({ w: 'w', j: true, wtimeout: 1200 })
   })
})
