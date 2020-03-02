import { Collection } from '../Collection'
import { FindQuery, DocumentResult, OptionalPopulate, CurserOptions } from '../types&Interfaces'
import { getSortDetail } from '../utils'

export type FindManyMethodParams<M> = {
   query: FindQuery<M>
} & OptionalPopulate &
   CurserOptions<M>

export type FindManyMethodResult<M> = Promise<Array<DocumentResult<M> | undefined>>

export default function findMany<M>(params: FindManyMethodParams<M>, collection: Collection<M>): FindManyMethodResult<M> {
   const curser = collection.useNative().find(params.query)

   if (params.page) {
      const pageSize = params.pageSize || this.settings.pagination.defaultPageSize
      curser.limit(pageSize)
      curser.skip((params.page - 1) * pageSize)
   }

   if (params.sort) {
      const detail = getSortDetail(params.sort)
      curser.sort(detail.sortKey, detail.direction)
   }

   curser.map((doc) => {
      if (params.map) return params.map(doc) // this is not Array.map
      return collection.transformDocument(doc)
   })

   return curser.toArray().then((docs) => {
      if (params.populate) collection.populator.populate(docs, params.populate)
      return docs
   })
}
