import { Document, OptionalPopulate, ExtendedFindOneOptions, AnyObject } from '../types&Interfaces'
import { decodeSortDash, decodeFieldDash } from '../utils'
import { Collection } from 'collection/Collection'

export type FindOneMethodParams = {
   query?: AnyObject
   sort?: string
   fields?: string[]
   skip?: number
} & OptionalPopulate

export type FindOneMethodResult = Promise<Document | undefined>

export default function findOne(this: Collection, params: FindOneMethodParams = {}): FindOneMethodResult {
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

   return this.useNative()
      .findOne(params.query, options)
      .then(async (doc: Document) => {
         this.transformDocument(doc)
         if (params.populate) await this.populator.populate([doc], params.populate)
         return doc
      })
}
