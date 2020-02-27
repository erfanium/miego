import { ModelWithId } from './types&Interfaces'
export function getDocumentCreatedAt<M>(doc: ModelWithId<M>): Date {
   if (!doc._id) return undefined
   return doc._id.getTimestamp()
}
