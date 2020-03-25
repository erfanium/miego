import { Collection } from '../Collection'
import { UpdateResult, AnyObject, WriteConcernOptions } from '../types&Interfaces'
import { returnWriteConcern } from '../utils'

export type UpdateOneMethodParams = {
   query?: AnyObject
   update: AnyObject
   upsert?: boolean
   arrayFilters?: Array<AnyObject>
   writeConcern?: WriteConcernOptions
}

export type UpdateOneMethodResult = Promise<UpdateResult>

export default async function updateOne(this: Collection, params: UpdateOneMethodParams = { update: {} }): UpdateOneMethodResult {
   const writeConcern = returnWriteConcern(this, params.writeConcern)

   const result = await this.base.updateOne(params.query, params.update, {
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
