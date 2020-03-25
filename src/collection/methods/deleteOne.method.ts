import { DeleteResult, WriteConcernOptions, AnyObject } from '../types&Interfaces'
import { returnWriteConcern } from '../utils'
import { Collection } from 'collection/Collection'

export type DeleteOneMethodParams = {
   query?: AnyObject
   writeConcern?: WriteConcernOptions
   bypassValidation?: boolean
}

export type DeleteOneMethodResult = Promise<DeleteResult>

export default async function deleteOne(this: Collection, params: DeleteOneMethodParams = {}): DeleteOneMethodResult {
   const writeConcern = returnWriteConcern(this, params.writeConcern)
   const result = await this.base.deleteOne(params.query, {
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
