import { FindQuery, DocumentResult, OptionalPopulate } from '../types&Interfaces'
import { Collection } from 'collection/Collection'

export type FindOneMethodParams<M> = {
   query: FindQuery<M>
} & OptionalPopulate

export type FindOneMethodResult<M> = Promise<DocumentResult<M> | undefined>

export default function findOne<M>(params: FindOneMethodParams<M>, collection: Collection<M>): FindOneMethodResult<M> {
   return collection
      .useNative()
      .findOne(params.query)
      .then(this.transformDocument)
}
