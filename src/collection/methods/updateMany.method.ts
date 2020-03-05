import { Collection } from '../Collection'
import { FindQuery, UpdateResult, WriteConcernOptions, UpdateQuery } from '../types&Interfaces'
import { returnWriteConcern } from '../utils'

export type UpdateManyMethodParams<M> = {
   query?: FindQuery<M>
   update?: UpdateQuery<M>
   upsert?: boolean
   arrayFilters?: object[]
   writeConcern?: WriteConcernOptions
}

export type UpdateManyMethodResult = Promise<UpdateResult>

export default async function updateMany<M>(params: UpdateManyMethodParams<M> = {}, collection: Collection<M>): UpdateManyMethodResult {
   const writeConcern = returnWriteConcern(collection, params.writeConcern)

   const result = await collection.useNative().updateMany(params.query, params.update, {
      upsert: params.upsert || false,
      arrayFilters: params.arrayFilters,
      j: writeConcern.j,
      w: writeConcern.w,
      wtimeout: writeConcern.wtimeout
   })
   return {
      updatedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
      matchedCount: result.matchedCount,
      upsertedId: result.upsertedId || undefined,
      ok: result.result.ok === 1
   }
}
