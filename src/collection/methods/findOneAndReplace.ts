import { Collection } from '../Collection'
import { FindQuery, DocumentResult, OptionalPopulate, WriteConcernOptions, ModelWithOptionalId } from '../types&Interfaces'
import { decodeSortDash } from '../utils'
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
   const writeConcern = merge(collection.settings.writeConcern, params.writeConcern)

   const options: FindOneAndReplaceOption = {
      w: writeConcern.w,
      j: writeConcern.j,
      wtimeout: writeConcern.wtimeout,
      upsert: params.upsert || false,
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
      .findOneAndReplace(params.query, params.replace, options)
      .then((result) => {
         return collection.transformDocument(result.value)
      })
}
