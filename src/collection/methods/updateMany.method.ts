import { Collection } from '../Collection'
import { UpdateResult, WriteConcernOptions, AnyObject } from '../types&Interfaces'
import { returnWriteConcern } from '../utils'

export type UpdateManyMethodParams = {
   query?: AnyObject
   update: AnyObject
   upsert?: boolean
   arrayFilters?: object[]
   writeConcern?: WriteConcernOptions
}

export type UpdateManyMethodResult = Promise<UpdateResult>

export default async function updateMany(params: UpdateManyMethodParams = { update: {} }, collection: Collection): UpdateManyMethodResult {
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
