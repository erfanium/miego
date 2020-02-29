import { Collection } from '../Collection'
import { FindOrUpdateQuery, DocumentResult, OptionalPopulate } from '../types&Interfaces'
import { getSortDetail } from '../utils'
import { FindOneAndDeleteOption } from 'mongodb'

export type FindOneAndDeleteParams<M> = {
   query: FindOrUpdateQuery<M>
   sort?: string
   maxTimeMS?: number
} & OptionalPopulate

export type FindOneAndDeleteResult<M> = Promise<DocumentResult<M> | undefined>

export default function findOneAndDelete<M>(params: FindOneAndDeleteParams<M>, collection: Collection<M>): FindOneAndDeleteResult<M> {
   const options: FindOneAndDeleteOption = {
      maxTimeMS: params.maxTimeMS
   }
   if (params.sort) {
      const detail = getSortDetail(params.sort)
      options.sort = {
         [detail.sortKey]: detail.direction
      }
   }
   return collection
      .useNative()
      .findOneAndDelete(params.query, options)
      .then((result) => {
         return collection.transformDocument(result.value)
      })
}
