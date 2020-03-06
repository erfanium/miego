import { FindQuery, DocumentAfterTransform, OptionalPopulate, ExtendedFindOneOptions } from '../types&Interfaces'
import { Collection } from '../Collection'
import { decodeSortDash, decodeFieldDash } from '../utils'

export type FindOneMethodParams<M> = {
   query?: FindQuery<M>
   sort?: string
   fields?: string[]
   skip?: number
} & OptionalPopulate

export type FindOneMethodResult<M> = Promise<DocumentAfterTransform<M> | undefined>

export default function findOne<M>(params: FindOneMethodParams<M> = {}, collection: Collection<M>): FindOneMethodResult<M> {
   const options: ExtendedFindOneOptions = {
      skip: params.skip,
      projection: {}
   }

   if (params.sort) {
      const [sortKey, direction] = decodeSortDash(params.sort)
      options.sort = {
         [sortKey]: direction
      }
   }

   if (params.fields) {
      params.fields.forEach((f) => {
         const [fieldKey, enabled] = decodeFieldDash(f)
         options.projection[fieldKey] = enabled
      })
   }

   return collection
      .useNative()
      .findOne(params.query, options)
      .then(async (doc: DocumentAfterTransform<M>) => {
         collection.transformDocument(doc)
         if (params.populate) await collection.populator.populate([doc], params.populate)
         return doc
      })
}
