import { Collection } from '../Collection'
import { FindOrUpdateQuery, UpdateResult, AnyObject } from '../types&Interfaces'

export type UpdateOneMethodParams<M> = {
   query: FindOrUpdateQuery<M>
   update: FindOrUpdateQuery<M>
   upsert?: boolean
   arrayFilters?: Array<AnyObject>
}

export type UpdateOneMethodResult = Promise<UpdateResult>

export default async function updateOne<M>(params: UpdateOneMethodParams<M>, collection: Collection<M>): UpdateOneMethodResult {
   const result = await collection.getBase().updateOne(params.query, params.update, {
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
