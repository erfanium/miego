import { Collection } from '../Collection'
import { FindOrUpdateQuery, DocumentResult, OptionalPopulate, CurserOptions } from '../types&Interfaces'
import { getSortDetail } from '../utils'

export type FindAllMethodParams<M> = {
   query: FindOrUpdateQuery<M>
} & OptionalPopulate &
   CurserOptions<M>

export type FindAllMethodResult<M> = Promise<Array<DocumentResult<M> | undefined>>

export default function findAll<M>(params: FindAllMethodParams<M>, collection: Collection<M>): FindAllMethodResult<M> {
   const curser = collection.useNative().find(params.query)

   if (params.page) {
      const pageSize = params.pageSize || collection.settings.pagination.defaultPageSize
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

   return curser.toArray()
}
