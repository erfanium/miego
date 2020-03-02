import { Collection } from '../Collection'
import { FindQuery, DeleteResult, WriteConcernOptions } from '../types&Interfaces'
import { merge } from 'ramda'

export type DeleteOneMethodParams<M> = {
   query?: FindQuery<M>
   writeConcern?: WriteConcernOptions
   bypassValidation?: boolean
}

export type DeleteOneMethodResult = Promise<DeleteResult>

export default async function deleteOne<M>(params: DeleteOneMethodParams<M> = {}, collection: Collection<M>): DeleteOneMethodResult {
   const writeConcern = merge(collection.settings.writeConcern, params.writeConcern)
   const result = await collection.useNative().deleteOne(params.query, {
      w: writeConcern.w,
      j: writeConcern.j,
      wtimeout: writeConcern.wtimeout,
      bypassDocumentValidation: params.bypassValidation
   })
   return {
      deletedCount: result.deletedCount,
      ok: result.result.ok === 1
   }
}
