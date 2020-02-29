import { Collection } from '../Collection'
import { FindOrUpdateQuery, UpdateResult, WriteConcernOptions } from '../types&Interfaces'
import { merge } from 'ramda'

export type UpdateAllMethodParams<M> = {
   query: FindOrUpdateQuery<M>
   update: FindOrUpdateQuery<M>
   upsert?: boolean
   arrayFilters?: object[]
   writeConcern?: WriteConcernOptions
}

export type UpdateAllMethodResult = Promise<UpdateResult>

export default async function updateAll<M>(params: UpdateAllMethodParams<M>, collection: Collection<M>): UpdateAllMethodResult {
   const writeConcern = merge(collection.settings.writeConcern, params.writeConcern)

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
