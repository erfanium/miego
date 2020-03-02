import { FindQuery, DocumentResult, OptionalPopulate } from '../types&Interfaces'
import { Collection } from 'collection/Collection'
import { FindOneOptions } from 'mongodb'
import { decodeSortDash, decodeFieldDash } from 'collection/utils'

interface IFindOneOptions extends FindOneOptions {
   projection?: {
      [key: string]: string | number
   }
}

export type FindOneMethodParams<M> = {
   query?: FindQuery<M>
   sort?: string
   fields?: string[]
   skip?: number
} & OptionalPopulate

export type FindOneMethodResult<M> = Promise<DocumentResult<M> | undefined>

export default function findOne<M>(params: FindOneMethodParams<M> = {}, collection: Collection<M>): FindOneMethodResult<M> {
   const options: IFindOneOptions = {
      projection: {
         skip: params.skip
      }
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
      .findOne(params.query, options)
      .then(async (doc: DocumentResult<M>) => {
         collection.transformDocument(doc)
         if (params.populate) await collection.populator.populate([doc], params.populate)
         return doc
      })
}
