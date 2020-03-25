import { AnyObject } from '../types&Interfaces'
import { Collection } from 'collection/Collection'

export type CountMethodParams = {
   query?: AnyObject
   estimated?: boolean
   limit?: number
   skip?: number
   maxTimeMS?: number
}

export type CountMethodResult = Promise<number>

export default async function count(this: Collection, params: CountMethodParams): CountMethodResult {
   if (params.estimated === undefined) params.estimated = false
   const options = {
      limit: params.limit,
      skip: params.skip,
      maxTimeMS: params.maxTimeMS
   }

   if (!params.estimated) {
      return this.base.countDocuments(params.query, options)
   }
   return this.base.estimatedDocumentCount(params.query, options)
}
