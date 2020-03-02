import { getSortDetail } from '../../src/collection/utils'
describe('getSortDetail', () => {
   it('should work', () => {
      expect(getSortDetail('_id')).toEqual({ sortKey: '_id', direction: 1 })
      expect(getSortDetail('x')).toEqual({ sortKey: 'x', direction: 1 })
      expect(getSortDetail('-_id')).toEqual({ sortKey: '_id', direction: -1 })
   })
})
