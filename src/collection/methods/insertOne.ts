import { Collection } from '../Collection'
import { DocumentFindResult, ModelWithOptionalId } from '../types&Interfaces'
import { getDocumentCreatedAt } from '../utils'

export type InsertOneMethodParams<M> = ModelWithOptionalId<M>

export type InsertOneMethodResult<M> = Promise<DocumentFindResult<M>>

export default async function insertOne<M>(params: InsertOneMethodParams<M>, collection: Collection<M>): InsertOneMethodResult<M> {
   const doc = await collection
      .getBase()
      .insertOne(params)
      .then(r => r.ops[0])

   if (doc) doc._createdAt = getDocumentCreatedAt(doc)
   return doc
}
