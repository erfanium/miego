import { Collection } from '../Collection'
import { FindOrUpdateQuery, DeleteResult, WriteConcernOptions } from '../types&Interfaces'
import { merge } from 'ramda'

export type DeleteAllMethodParams<M> = {
   query: FindOrUpdateQuery<M>
   writeConcern?: WriteConcernOptions
}

export type DeleteAllMethodResult = Promise<DeleteResult>

export default async function deleteAll<M>(params: DeleteAllMethodParams<M>, collection: Collection<M>): DeleteAllMethodResult {
   const writeConcern = merge(collection.settings.writeConcern, params.writeConcern)

   const result = await collection.useNative().deleteMany(params.query, {
      w: writeConcern.w,
      j: writeConcern.j,
      wtimeout: writeConcern.wtimeout
   })
   return {
      deletedCount: result.deletedCount,
      ok: result.result.ok === 1
   }
}
