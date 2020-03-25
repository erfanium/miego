import { OptionalPopulate, AnyObject, Document } from '../types&Interfaces'
import { decodeSortDash, decodeFieldDash } from '../utils'
import { FindOneAndDeleteOption } from 'mongodb'
import { Collection } from 'collection/Collection'

export type FindOneAndDeleteParams = {
   query?: AnyObject
   sort?: string
   maxTimeMS?: number
   fields?: string[]
} & OptionalPopulate

export type FindOneAndDeleteResult = Promise<Document | undefined>

interface ExtendedFindOneAndDeleteOption extends FindOneAndDeleteOption {
   projection?: {
      [k: string]: unknown
   }
}

export default function findOneAndDelete(this: Collection, params: FindOneAndDeleteParams = {}): FindOneAndDeleteResult {
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
   return this.useNative()
      .findOneAndDelete(params.query, options)
      .then((result) => {
         return this.transformDocument(result.value)
      })
}
