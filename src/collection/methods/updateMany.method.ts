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

export default async function updateMany(this: Collection, params: UpdateManyMethodParams = { update: {} }): UpdateManyMethodResult {
   const writeConcern = returnWriteConcern(this, params.writeConcern)

   const result = await this.base.updateMany(params.query, params.update, {
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
