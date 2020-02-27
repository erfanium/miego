import { Collection } from '../Collection'
import { FindQuery, DocumentFindResult, OptionalPopulate } from '../types&Interfaces'
import { getDocumentCreatedAt } from '../utils'

export type FindOneMethodParams<M> = {
   query: FindQuery<M>
} & OptionalPopulate

export type FindOneMethodResult<M> = Promise<DocumentFindResult<M> | undefined>

export default async function findOne<M>(
   params: FindOneMethodParams<M>,
   collection: Collection<M>,
): FindOneMethodResult<M> {
   const doc = await collection.getBase().findOne(params.query)
   if (doc) doc._createdAt = getDocumentCreatedAt(doc)
   return doc
}
