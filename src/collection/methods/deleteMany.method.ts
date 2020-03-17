import { Collection } from '../Collection'
import { DeleteResult, WriteConcernOptions, AnyObject } from '../types&Interfaces'
import { returnWriteConcern } from '../utils'

export type DeleteManyMethodParams = {
   query?: AnyObject
   writeConcern?: WriteConcernOptions
}

export type DeleteManyMethodResult = Promise<DeleteResult>

export default async function deleteMany(params: DeleteManyMethodParams, collection: Collection): DeleteManyMethodResult {
   const writeConcern = returnWriteConcern(collection, params.writeConcern)
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
