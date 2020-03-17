import { Collection } from '../Collection'
import { OptionalPopulate, WriteConcernOptions, AnyObject, Document } from '../types&Interfaces'
import { decodeSortDash, decodeFieldDash, returnWriteConcern } from '../utils'
import { FindOneAndUpdateOption } from 'mongodb'

interface ExtendedFindOneAndUpdateOption extends FindOneAndUpdateOption {
   projection?: {
      [k: string]: unknown
   }
}

export type FindOneAndUpdateParams = {
   query?: AnyObject
   update?: AnyObject
   sort?: string
   writeConcern?: WriteConcernOptions
   new?: boolean
   arrayFilters?: object[]
   upsert?: boolean
   maxTimeMS?: number
   bypassValidation?: boolean
   fields?: string[]
} & OptionalPopulate

export type FindOneAndUpdateResult = Promise<Document | undefined>

export default function findOneAndUpdate(params: FindOneAndUpdateParams = {}, collection: Collection): FindOneAndUpdateResult {
   const writeConcern = returnWriteConcern(collection, params.writeConcern)

   const options: ExtendedFindOneAndUpdateOption = {
      w: writeConcern.w,
      j: writeConcern.j,
      wtimeout: writeConcern.wtimeout,
      upsert: params.upsert || false,
      arrayFilters: params.arrayFilters,
      maxTimeMS: params.maxTimeMS,
      returnOriginal: params.new === undefined ? false : params.new
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
      .findOneAndUpdate(params.query, params.update, options)
      .then((result) => {
         return collection.transformDocument(result.value)
      })
}
