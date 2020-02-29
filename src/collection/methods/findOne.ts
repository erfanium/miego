import { Collection } from '../Collection'
import { FindOrUpdateQuery, DocumentResult, OptionalPopulate } from '../types&Interfaces'

export type FindOneMethodParams<M> = {
   query: FindOrUpdateQuery<M>
} & OptionalPopulate

export type FindOneMethodResult<M> = Promise<DocumentResult<M> | undefined>

export default function findOne<M>(params: FindOneMethodParams<M>, collection: Collection<M>): FindOneMethodResult<M> {
   return collection
      .useNative()
      .findOne(params.query)
      .then(collection.transformDocument)
}
