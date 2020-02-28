import { ModelWithId } from './types&Interfaces'
export function getDocumentCreatedAt<M>(doc: ModelWithId<M>): Date {
   if (!doc._id) return undefined
   return doc._id.getTimestamp()
}

export function getSortDetail(s: string): { sortKey: string; direction: -1 | 1 } {
   if (s.startsWith('-')) {
      return {
         sortKey: s.slice(1),
         direction: -1
      }
   }
   return {
      sortKey: s,
      direction: 1
   }
}
