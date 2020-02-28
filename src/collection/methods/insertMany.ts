import { Collection } from '../Collection'
import { ModelWithOptionalId, DocumentFindResult, InsertWriteOpResult } from '../types&Interfaces'
import { getDocumentCreatedAt } from '../utils'
import { WriteError } from 'mongodb'

type InsertResult<DocType> = {
   insertedCount: number
   ok: boolean
   docs: Array<DocumentFindResult<DocType> | undefined>
   errors?: Array<WriteError>
}

export interface InsertManyMethodParams<M> {
   entities: Array<ModelWithOptionalId<M>>
   ordered?: boolean
   skipWriteError?: boolean
}
export type InsertManyMethodResult<M> = Promise<InsertResult<M>>

export default async function insertOne<M>(params: InsertManyMethodParams<M>, collection: Collection<M>): InsertManyMethodResult<M> {
   if (params.entities.length === 0) {
      return {
         insertedCount: 0,
         ok: true,
         docs: []
      }
   }

   if (params.skipWriteError === undefined) params.skipWriteError = true

   const result: InsertWriteOpResult<M> = await collection
      .getBase()
      .insertMany(params.entities, {
         ordered: params.ordered || false
      })
      .catch(
         (e): InsertWriteOpResult<M> => {
            if (e.name !== 'BulkWriteError') throw e
            const error: InsertWriteOpResult<M> = {
               insertedCount: e.result.result.nInserted,
               ops: [], // todo: fix this
               insertedIds: e.result.result.insertedIds,
               result: { ok: e.result.result.ok, n: e.result.result.nInserted, errors: e.result.result.writeErrors }
            }
            if (params.skipWriteError) return error
            throw error
         }
      )

   result.ops?.map((doc: DocumentFindResult<M>) => {
      doc._createdAt = getDocumentCreatedAt(doc)
   })

   return {
      insertedCount: result.insertedCount,
      ok: result.result.ok === 1,
      docs: result.ops,
      errors: result.result.errors
   }
}
