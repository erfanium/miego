import { Collection } from '../Collection'
import { DeleteResult, WriteConcernOptions, AnyObject } from '../types&Interfaces'
import { returnWriteConcern } from '../utils'

export type DeleteOneMethodParams = {
   query?: AnyObject
   writeConcern?: WriteConcernOptions
   bypassValidation?: boolean
}

export type DeleteOneMethodResult = Promise<DeleteResult>

export default async function deleteOne(params: DeleteOneMethodParams = {}, collection: Collection): DeleteOneMethodResult {
   const writeConcern = returnWriteConcern(collection, params.writeConcern)
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
