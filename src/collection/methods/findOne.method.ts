import { Document, OptionalPopulate, ExtendedFindOneOptions, AnyObject } from '../types&Interfaces'
import { Collection } from '../Collection'
import { decodeSortDash, decodeFieldDash } from '../utils'

export type FindOneMethodParams = {
   query?: AnyObject
   sort?: string
   fields?: string[]
   skip?: number
} & OptionalPopulate

export type FindOneMethodResult = Promise<Document | undefined>

export default function findOne(params: FindOneMethodParams = {}, collection: Collection): FindOneMethodResult {
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
      .then(async (doc: Document) => {
         collection.transformDocument(doc)
         if (params.populate) await collection.populator.populate([doc], params.populate)
         return doc
      })
}
