import { Collection } from '../Collection'
import { FindQuery, DeleteResult, WriteConcernOptions } from '../types&Interfaces'
import { merge } from 'ramda'

export type DeleteManyMethodParams<M> = {
   query?: FindQuery<M>
   writeConcern?: WriteConcernOptions
}

export type DeleteManyMethodResult = Promise<DeleteResult>

export default async function deleteMany<M>(params: DeleteManyMethodParams<M>, collection: Collection<M>): DeleteManyMethodResult {
   const writeConcern = merge(collection.settings.writeConcern, params.writeConcern)
   if (!params.query) params.query = {}

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
