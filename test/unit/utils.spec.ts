import { decodeSortDash, decodeFieldDash } from '../../src/collection/utils'

describe('decodeSortDash', () => {
   it('should work', () => {
      expect(decodeSortDash('_id')).toEqual(['_id', 1])
      expect(decodeSortDash('x')).toEqual(['x', 1])
      expect(decodeSortDash('-_id')).toEqual(['_id', -1])
   })
})

describe('decodeFieldDash', () => {
   it('should work', () => {
      expect(decodeFieldDash('name')).toEqual(['name', 1])
      expect(decodeFieldDash('x')).toEqual(['x', 1])
      expect(decodeFieldDash('-name')).toEqual(['name', 0])
   })
   it('should ignore _id', () => {
      expect(decodeFieldDash('_id')).toEqual(['_id', 1])
      expect(decodeFieldDash('-_id')).toEqual(['_id', 1])
   })
})
