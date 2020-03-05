import { Collection } from '../Collection'
import { FindQuery, DocumentResult, OptionalPopulate } from '../types&Interfaces'
import { decodeSortDash, decodeFieldDash } from '../utils'
import { FindOneAndDeleteOption } from 'mongodb'

export type FindOneAndDeleteParams<M> = {
   query?: FindQuery<M>
   sort?: string
   maxTimeMS?: number
   fields?: string[]
} & OptionalPopulate

export type FindOneAndDeleteResult<M> = Promise<DocumentResult<M> | undefined>

interface ExtendedFindOneAndDeleteOption extends FindOneAndDeleteOption {
   projection?: {
      [k: string]: unknown
   }
}

export default function findOneAndDelete<M>(params: FindOneAndDeleteParams<M> = {}, collection: Collection<M>): FindOneAndDeleteResult<M> {
   const options: ExtendedFindOneAndDeleteOption = {
      maxTimeMS: params.maxTimeMS,
      projection: {}
   }
   if (params.fields) {
      params.fields.forEach((f) => {
         const [fieldKey, enabled] = decodeFieldDash(f)
         options.projection[fieldKey] = enabled
      })
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
