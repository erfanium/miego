import { Collection } from '../Collection'
import { FindOrUpdateQuery, UpdateResult, AnyObject } from '../types&Interfaces'

export type UpdateAllMethodParams<M> = {
   query: FindOrUpdateQuery<M>
   update: FindOrUpdateQuery<M>
   upsert?: boolean
   arrayFilters?: Array<AnyObject>
}

export type UpdateAllMethodResult = Promise<UpdateResult>

export default async function updateAll<M>(params: UpdateAllMethodParams<M>, collection: Collection<M>): UpdateAllMethodResult {
   const result = await collection.getBase().updateMany(params.query, params.update, {
      upsert: params.upsert || false,
      arrayFilters: params.arrayFilters
   })
   return {
      updatedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
      matchedCount: result.matchedCount,
      upsertedId: result.upsertedId || undefined,
      ok: result.result.ok === 1
   }
}
