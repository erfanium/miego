import { WriteError } from 'mongodb'
import { Collection } from '../Collection'
import { InsertWriteOpResult, WriteConcernOptions, Document } from '../types&Interfaces'
import { returnWriteConcern } from '../utils'

type InsertResult = {
   insertedCount: number
   ok: boolean
   docs: Document[]
   errors?: Array<WriteError>
}

export interface InsertManyMethodParams {
   entities: Document[]
   ordered?: boolean
   skipWriteError?: boolean
   writeConcern?: WriteConcernOptions
   bypassValidation?: boolean
}
export type InsertManyMethodResult = Promise<InsertResult>

export default async function insertOne(params: InsertManyMethodParams, collection: Collection): InsertManyMethodResult {
   if (params.entities.length === 0) {
      return {
         insertedCount: 0,
         ok: true,
         docs: []
      }
   }

   const writeConcern = returnWriteConcern(collection, params.writeConcern)

   if (params.skipWriteError === undefined) params.skipWriteError = false

   const result: InsertWriteOpResult = await collection
      .useNative()
      .insertMany(params.entities, {
         ordered: params.ordered || false,
         w: writeConcern.w,
         j: writeConcern.j,
         wtimeout: writeConcern.wtimeout,
         bypassDocumentValidation: params.bypassValidation
      })
      .catch(
         (e): InsertWriteOpResult => {
            if (e.name !== 'BulkWriteError') throw e
            if (params.skipWriteError)
               return {
                  insertedCount: e.result.result.nInserted,
                  ops: [], // todo: how can we fetch it?
                  insertedIds: e.result.result.insertedIds,
                  result: { ok: e.result.result.ok, n: e.result.result.nInserted, errors: e.result.result.writeErrors }
               }
            throw e
         }
      )

   return {
      insertedCount: result.insertedCount,
      ok: result.result.ok === 1,
      docs: result.ops.map((doc) => collection.transformDocument(doc)),
      errors: result.result.errors
   }
}
