import { Collection } from '../Collection'
import { FindQuery, DocumentResult, OptionalPopulate, WriteConcernOptions, ModelWithOptionalId } from '../types&Interfaces'
import { getSortDetail } from '../utils'
import { FindOneAndReplaceOption } from 'mongodb'
import { merge } from 'ramda'

export type FindOneAndReplaceParams<M> = {
   query: FindQuery<M>
   replace: ModelWithOptionalId<M>
   sort?: string
   writeConcern?: WriteConcernOptions
   new?: boolean
   upsert?: boolean
   maxTimeMS?: number
} & OptionalPopulate

export type FindOneAndReplaceResult<M> = Promise<DocumentResult<M> | undefined>

export default function findOneAndReplace<M>(params: FindOneAndReplaceParams<M>, collection: Collection<M>): FindOneAndReplaceResult<M> {
   const writeConcern = merge(this.settings.writeConcern, params.writeConcern)

   const options: FindOneAndReplaceOption = {
      w: writeConcern.w,
      j: writeConcern.j,
      wtimeout: writeConcern.wtimeout,
      upsert: params.upsert || false,
      maxTimeMS: params.maxTimeMS,
      returnOriginal: !params.new
   }
   if (params.sort) {
      const detail = getSortDetail(params.sort)
      options.sort = {
         [detail.sortKey]: detail.direction
      }
   }
   return collection
      .useNative()
      .findOneAndReplace(params.query, params.replace, options)
      .then((result) => {
         return collection.transformDocument(result.value)
      })
}
