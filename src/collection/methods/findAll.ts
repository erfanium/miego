import { Collection } from '../Collection'
import { FindOrUpdateQuery, DocumentFindResult, OptionalPopulate, CurserOptions } from '../types&Interfaces'
import { getDocumentCreatedAt, getSortDetail } from '../utils'
import mongodb from 'mongodb'

export type FindAllMethodParams<M> = {
   query: FindOrUpdateQuery<M>
} & OptionalPopulate &
   CurserOptions<M>

export type FindAllMethodResult<M> = Promise<Array<DocumentFindResult<M> | undefined>> | mongodb.Cursor

export default function findAll<M>(params: FindAllMethodParams<M>, collection: Collection<M>): FindAllMethodResult<M> {
   const curser = collection.getBase().find(params.query)
   if (params.numbering === undefined) params.numbering = true

   let numberingStartAt: number = 0

   if (params.page) {
      const pageSize = params.pageSize || collection.options.pagination.defaultPageSize
      numberingStartAt = (params.page - 1) * pageSize
      curser.limit(pageSize)
      curser.skip(numberingStartAt)
   }

   if (params.sort) {
      const detail = getSortDetail(params.sort)
      curser.sort(detail.sortKey, detail.direction)
   }

   curser.map(doc => {
      doc._createdAt = getDocumentCreatedAt(doc)
      if (params.numbering) {
         numberingStartAt++
         doc._number = numberingStartAt
      }
      if (params.map) return params.map(doc) // this is not Array.map
      return doc
   })

   return curser.toArray()
}
