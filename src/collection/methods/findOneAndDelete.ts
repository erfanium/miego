import { Collection } from '../Collection'
import { FindQuery, DocumentResult, OptionalPopulate } from '../types&Interfaces'
import { decodeSortDash } from '../utils'
import { FindOneAndDeleteOption } from 'mongodb'

export type FindOneAndDeleteParams<M> = {
   query: FindQuery<M>
   sort?: string
   maxTimeMS?: number
} & OptionalPopulate

export type FindOneAndDeleteResult<M> = Promise<DocumentResult<M> | undefined>

export default function findOneAndDelete<M>(params: FindOneAndDeleteParams<M>, collection: Collection<M>): FindOneAndDeleteResult<M> {
   const options: FindOneAndDeleteOption = {
      maxTimeMS: params.maxTimeMS
   }
   if (params.sort) {
      const [sortKey, direction] = decodeSortDash(params.sort)
      options.sort = {
         [sortKey]: direction
      }
   }
   return collection
      .useNative()
      .findOneAndDelete(params.query, options)
      .then((result) => {
         return collection.transformDocument(result.value)
      })
}
