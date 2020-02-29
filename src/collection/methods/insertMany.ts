import { Collection } from '../Collection'
import { ModelWithOptionalId, DocumentResult, InsertWriteOpResult, WriteConcernOptions } from '../types&Interfaces'
import { WriteError } from 'mongodb'
import { merge } from 'ramda'

type InsertResult<DocType> = {
   insertedCount: number
   ok: boolean
   docs: Array<DocumentResult<DocType> | undefined>
   errors?: Array<WriteError>
}

export interface InsertManyMethodParams<M> {
   entities: Array<ModelWithOptionalId<M>>
   ordered?: boolean
   skipWriteError?: boolean
   writeConcern?: WriteConcernOptions
   bypassValidation?: boolean
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

   const writeConcern = merge(collection.settings.writeConcern, params.writeConcern)

   if (params.skipWriteError === undefined) params.skipWriteError = true

   const result: InsertWriteOpResult<M> = await collection
      .useNative()
      .insertMany(params.entities, {
         ordered: params.ordered || false,
         w: writeConcern.w,
         j: writeConcern.j,
         wtimeout: writeConcern.wtimeout,
         bypassDocumentValidation: params.bypassValidation
      })
      .catch(
         (e): InsertWriteOpResult<M> => {
            if (e.name !== 'BulkWriteError') throw e
            if (params.skipWriteError)
               return {
                  insertedCount: e.result.result.nInserted,
                  ops: [], // todo: fix this
                  insertedIds: e.result.result.insertedIds,
                  result: { ok: e.result.result.ok, n: e.result.result.nInserted, errors: e.result.result.writeErrors }
               }
            throw e
         }
      )

   // result.ops?.map((doc: DocumentResult<M>) => {  // todo Fix
   //    doc._createdAt = getDocumentCreatedAt(doc)
   // })

   return {
      insertedCount: result.insertedCount,
      ok: result.result.ok === 1,
      docs: result.ops,
      errors: result.result.errors
   }
}
