import { Collection } from '../Collection'
import { FindQuery } from '../types&Interfaces'

export type CountMethodParams<M> = {
   query?: FindQuery<M>
   estimated?: boolean
   limit?: number
   skip?: number
   maxTimeMS?: number
}

export type CountMethodResult = Promise<number>

export default async function count<M>(params: CountMethodParams<M>, collection: Collection<M>): CountMethodResult {
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
