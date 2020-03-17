import { Collection } from '../Collection'
import { Document, OptionalPopulate, CurserOptions, ExtendedFindOneOptions, AnyObject } from '../types&Interfaces'
import { decodeSortDash, decodeFieldDash, returnPageSize } from '../utils'

export type FindManyMethodParams = {
   query?: AnyObject
   fields?: string[]
} & OptionalPopulate &
   CurserOptions

export type FindManyMethodResult = Promise<Document[]>

export default function findMany(params: FindManyMethodParams = {}, collection: Collection): FindManyMethodResult {
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
