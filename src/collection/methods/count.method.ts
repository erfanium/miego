import { Collection } from '../Collection'
import { AnyObject } from '../types&Interfaces'

export type CountMethodParams = {
   query?: AnyObject
   estimated?: boolean
   limit?: number
   skip?: number
   maxTimeMS?: number
}

export type CountMethodResult = Promise<number>

export default async function count(params: CountMethodParams, collection: Collection): CountMethodResult {
   if (params.estimated === undefined) params.estimated = false
   const options = {
      limit: params.limit,
      skip: params.skip,
      maxTimeMS: params.maxTimeMS
   }

   if (!params.estimated) {
      return collection.useNative().countDocuments(params.query, options)
   }
   return collection.useNative().estimatedDocumentCount(params.query, options)
}
