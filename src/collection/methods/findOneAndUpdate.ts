import { Collection } from '../Collection'
import { FindQuery, DocumentResult, OptionalPopulate, WriteConcernOptions, UpdateQuery } from '../types&Interfaces'
import { decodeSortDash } from '../utils'
import { FindOneAndUpdateOption } from 'mongodb'
import { merge } from 'ramda'

export type FindOneAndUpdateParams<M> = {
   query: FindQuery<M>
   update: UpdateQuery<M>
   sort?: string
   writeConcern?: WriteConcernOptions
   new?: boolean
   arrayFilters?: object[]
   upsert?: boolean
   maxTimeMS?: number
   bypassValidation?: boolean
} & OptionalPopulate

export type FindOneAndUpdateResult<M> = Promise<DocumentResult<M> | undefined>

export default function findOneAndUpdate<M>(params: FindOneAndUpdateParams<M>, collection: Collection<M>): FindOneAndUpdateResult<M> {
   const writeConcern = merge(collection.settings.writeConcern, params.writeConcern)

   const options: FindOneAndUpdateOption = {
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
   return collection
      .useNative()
      .findOneAndUpdate(params.query, params.update)
      .then((result) => {
         return collection.transformDocument(result.value)
      })
}
