import { Collection } from '../Collection'
import { OptionalPopulate, WriteConcernOptions, Document, AnyObject } from '../types&Interfaces'
import { decodeSortDash, decodeFieldDash, returnWriteConcern } from '../utils'
import { FindOneAndReplaceOption } from 'mongodb'

interface ExtendedFindOneAndReplaceOption extends FindOneAndReplaceOption {
   projection?: {
      [k: string]: unknown
   }
}

export type FindOneAndReplaceParams = {
   query?: AnyObject
   replace: AnyObject
   sort?: string
   writeConcern?: WriteConcernOptions
   new?: boolean
   upsert?: boolean
   maxTimeMS?: number
   fields: string[]
} & OptionalPopulate

export type FindOneAndReplaceResult = Promise<Document | undefined>

export default function findOneAndReplace(params: FindOneAndReplaceParams, collection: Collection): FindOneAndReplaceResult {
   if (!params.replace) {
      collection.logger.error('Replace field is required!')
      throw new Error('Replace field is required!')
   }
   const writeConcern = returnWriteConcern(collection, params.writeConcern)

   const options: ExtendedFindOneAndReplaceOption = {
      w: writeConcern.w,
      j: writeConcern.j,
      wtimeout: writeConcern.wtimeout,
      upsert: params.upsert || false,
      maxTimeMS: params.maxTimeMS,
      returnOriginal: !params.new
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
      .findOneAndReplace(params.query, params.replace, options)
      .then((result) => {
         return collection.transformDocument(result.value)
      })
}
