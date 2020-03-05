import { Collection } from '../Collection'
import { DocumentResult } from '../types&Interfaces'
import findMany, { FindManyMethodParams } from './findMany.method'
import count from './count.method'
import { returnPageSize } from '../utils'

export interface ListParams<M> extends FindManyMethodParams<M> {
   page?: number
   estimated?: boolean
}

interface ObjectReturnType<M> {
   results: DocumentResult<M>[]
   nResults: number
   page: number
   pageSize: number
   totalPages: number
}

export type ListResult<M> = Promise<ObjectReturnType<M>>

export default async function list<M>(params: ListParams<M> = { page: 1 }, collection: Collection<M>): ListResult<M> {
   const docsP = findMany(params, collection)
   const countP = count(
      {
         query: params.query,
         estimated: params.estimated || true
      },
      collection
   )
   const [results, nResults] = await Promise.all([docsP, countP])
   const pageSize = returnPageSize(collection, params.pageSize)

   return {
      results,
      nResults,
      page: params.page,
      pageSize,
      totalPages: Math.floor((nResults + pageSize - 1) / pageSize)
   }
}
