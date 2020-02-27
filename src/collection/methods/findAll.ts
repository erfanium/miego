import { Collection } from '../Collection'
import { FindQuery, DocumentFindResult, OptionalPopulate, CurserOptions, OptionalSortKeys } from '../types&Interfaces'
import { getDocumentCreatedAt } from '../utils'
import mongodb from 'mongodb'

export type FindAllMethodParams<M> = {
   query: FindQuery<M>
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
      const [key] = Object.keys(params.sort) as Array<OptionalSortKeys<M>>
      curser.sort(key as string, params.sort[key])
   }

   curser.map((doc) => {
      doc._createdAt = getDocumentCreatedAt(doc)
      if (params.numbering) {
         numberingStartAt++
         doc._number = numberingStartAt
      }
      if (params.map) return params.map(doc) // this is not Array.map
      return doc
   })

   if (params.returnCurser === true) return curser

   return curser.toArray()
}
