import { Document, OptionalPopulate, CurserOptions, ExtendedFindOneOptions, AnyObject } from '../types&Interfaces'
import { decodeSortDash, decodeFieldDash, returnPageSize } from '../utils'
import { Collection } from 'collection/Collection'

export type FindManyMethodParams = {
   query?: AnyObject
   fields?: string[]
} & OptionalPopulate &
   CurserOptions

export type FindManyMethodResult = Promise<Document[]>

export default function findMany(this: Collection, params: FindManyMethodParams = {}): FindManyMethodResult {
   const options: ExtendedFindOneOptions = {
      projection: {}
   }

   if (params.fields) {
      params.fields.forEach((f) => {
         const [fieldKey, enabled] = decodeFieldDash(f)
         options.projection[fieldKey] = enabled
      })
   }

   const curser = this.base.find(params.query, options)

   if (params.page) {
      const pageSize = returnPageSize(this, params.pageSize)
      curser.limit(pageSize)
      curser.skip((params.page - 1) * pageSize)
   }

   if (params.sort) {
      const [sortKey, direction] = decodeSortDash(params.sort)
      curser.sort(sortKey, direction)
   }

   curser.map((doc: Document) => {
      return this.transformDocument(doc)
   })

   return curser.toArray().then(async (docs: Document[]) => {
      if (params.populate) await this.populator.populate(docs, params.populate)
      return docs
   })
}
