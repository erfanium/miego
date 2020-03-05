import { Collection } from '../Collection'
import { FindQuery, DocumentResult, OptionalPopulate, CurserOptions, ExtendedFindOneOptions } from '../types&Interfaces'
import { decodeSortDash, decodeFieldDash, returnPageSize } from '../utils'

export type FindManyMethodParams<M> = {
   query?: FindQuery<M>
   fields?: string[]
} & OptionalPopulate &
   CurserOptions<M>

export type FindManyMethodResult<M> = Promise<Array<DocumentResult<M> | undefined>>

export default function findMany<M>(params: FindManyMethodParams<M> = {}, collection: Collection<M>): FindManyMethodResult<M> {
   const options: ExtendedFindOneOptions = {
      projection: {}
   }

   if (params.fields) {
      params.fields.forEach((f) => {
         const [fieldKey, enabled] = decodeFieldDash(f)
         options.projection[fieldKey] = enabled
      })
   }

   const curser = collection.useNative().find(params.query, options)

   if (params.page) {
      const pageSize = returnPageSize(collection, params.pageSize)
      curser.limit(pageSize)
      curser.skip((params.page - 1) * pageSize)
   }

   if (params.sort) {
      const [sortKey, direction] = decodeSortDash(params.sort)
      curser.sort(sortKey, direction)
   }

   curser.map((doc) => {
      return collection.transformDocument(doc)
   })

   return curser.toArray().then(async (docs) => {
      if (params.populate) await collection.populator.populate(docs, params.populate)
      return docs
   })
}
