import { DeleteResult, WriteConcernOptions, AnyObject } from '../types&Interfaces'
import { returnWriteConcern } from '../utils'
import { Collection } from 'collection/Collection'

export type DeleteManyMethodParams = {
   query?: AnyObject
   writeConcern?: WriteConcernOptions
}

export type DeleteManyMethodResult = Promise<DeleteResult>

export default async function deleteMany(this: Collection, params: DeleteManyMethodParams = {}): DeleteManyMethodResult {
   const writeConcern = returnWriteConcern(this, params.writeConcern)
   if (!params.query) params.query = {}

   const result = await this.base.deleteMany(params.query, {
      w: writeConcern.w,
      j: writeConcern.j,
      wtimeout: writeConcern.wtimeout
   })
   return {
      deletedCount: result.deletedCount,
      ok: result.result.ok === 1
   }
}
