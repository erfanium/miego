import { Collection } from '../Collection'
import { ModelWithOptionalId, DocumentFindResult } from '../types&Interfaces'
import { getDocumentCreatedAt } from '../utils'

export interface InsertManyMethodParams<M> {
   entities: Array<ModelWithOptionalId<M>>
}

export type InsertManyMethodResult<M> = Promise<Array<DocumentFindResult<M>>>

export default async function insertOne<M>(
   params: InsertManyMethodParams<M>,
   collection: Collection<M>,
): InsertManyMethodResult<M> {
   if (params.entities.length === 0) return []
   const docs = await collection
      .getBase()
      .insertMany(params.entities)
      .then((r) => r.ops)

   docs.map((doc) => {
      doc._createdAt = getDocumentCreatedAt(doc)
   })

   return docs
}
