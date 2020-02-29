import { Collection } from '../Collection'
import { FindOrUpdateQuery } from '../types&Interfaces'

export type CountMethodParams<M> = {
   query?: FindOrUpdateQuery<M>
   estimation?: boolean
   limit?: number
   skip?: number
   maxTimeMS?: number
}

export type CountMethodResult = Promise<number>

export default async function count<M>(params: CountMethodParams<M>, collection: Collection<M>): CountMethodResult {
   if (params.estimation === undefined) params.estimation = false
   const options = {
      limit: params.limit,
      skip: params.skip,
      maxTimeMS: params.maxTimeMS
   }

   if (!params.estimation) {
      return collection.useNative().countDocuments(params.query, options)
   }
   return collection.useNative().estimatedDocumentCount(params.query, options)
}
