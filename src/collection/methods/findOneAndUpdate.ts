import { Collection } from '../Collection'
import { FindQuery, DocumentResult, OptionalPopulate, WriteConcernOptions, UpdateQuery } from '../types&Interfaces'
import { decodeSortDash, decodeFieldDash } from '../utils'
import { FindOneAndUpdateOption } from 'mongodb'
import { merge } from 'ramda'

interface IFindOneAndUpdateOption extends FindOneAndUpdateOption {
   projection?: {
      [k: string]: any
   }
}

export type FindOneAndUpdateParams<M> = {
   query?: FindQuery<M>
   update?: UpdateQuery<M>
   sort?: string
   writeConcern?: WriteConcernOptions
   new?: boolean
   arrayFilters?: object[]
   upsert?: boolean
   maxTimeMS?: number
   bypassValidation?: boolean
   fields?: string[]
} & OptionalPopulate

export type FindOneAndUpdateResult<M> = Promise<DocumentResult<M> | undefined>

export default function findOneAndUpdate<M>(params: FindOneAndUpdateParams<M> = {}, collection: Collection<M>): FindOneAndUpdateResult<M> {
   const writeConcern = merge(collection.settings.writeConcern, params.writeConcern) || {}

   const options: IFindOneAndUpdateOption = {
      w: writeConcern.w,
      j: writeConcern.j,
      wtimeout: writeConcern.wtimeout,
      upsert: params.upsert || false,
      arrayFilters: params.arrayFilters,
      maxTimeMS: params.maxTimeMS,
      returnOriginal: !params.new
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
      .findOneAndUpdate(params.query, params.update)
      .then((result) => {
         return collection.transformDocument(result.value)
      })
}
