import { Collection } from '../Collection'
import { FindOrUpdateQuery, UpdateResult, AnyObject, WriteConcernOptions } from '../types&Interfaces'
import { merge } from 'ramda'

export type UpdateOneMethodParams<M> = {
   query: FindOrUpdateQuery<M>
   update: FindOrUpdateQuery<M>
   upsert?: boolean
   arrayFilters?: Array<AnyObject>
   writeConcern?: WriteConcernOptions
}

export type UpdateOneMethodResult = Promise<UpdateResult>

export default async function updateOne<M>(params: UpdateOneMethodParams<M>, collection: Collection<M>): UpdateOneMethodResult {
   const writeConcern = merge(collection.settings.writeConcern, params.writeConcern)

   const result = await collection.useNative().updateOne(params.query, params.update, {
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
