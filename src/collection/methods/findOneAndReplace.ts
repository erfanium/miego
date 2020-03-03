import { Collection } from '../Collection'
import { FindQuery, DocumentResult, OptionalPopulate, WriteConcernOptions, ModelWithOptionalId } from '../types&Interfaces'
import { decodeSortDash, decodeFieldDash } from '../utils'
import { FindOneAndReplaceOption } from 'mongodb'
import { merge } from 'ramda'

interface IFindOneAndReplaceOption extends FindOneAndReplaceOption {
   projection?: {
      [k: string]: any
   }
}

export type FindOneAndReplaceParams<M> = {
   query?: FindQuery<M>
   replace: ModelWithOptionalId<M>
   sort?: string
   writeConcern?: WriteConcernOptions
   new?: boolean
   upsert?: boolean
   maxTimeMS?: number
   fields: string[]
} & OptionalPopulate

export type FindOneAndReplaceResult<M> = Promise<DocumentResult<M> | undefined>

export default function findOneAndReplace<M>(params: FindOneAndReplaceParams<M>, collection: Collection<M>): FindOneAndReplaceResult<M> {
   if (!params.replace) {
      collection.logger.error('Replace field is required!')
      throw new Error('Replace field is required!')
   }
   const writeConcern = merge(collection.settings.writeConcern, params.writeConcern)

   const options: IFindOneAndReplaceOption = {
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
