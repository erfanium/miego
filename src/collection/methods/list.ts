import { Collection, ValidModel } from '../Collection'
import { DocumentResult } from '../types&Interfaces'
import findMany, { FindManyMethodParams } from './findMany'
import count from './count'
import { returnPageSize } from 'collection/utils'

export interface ListParams<M> extends FindManyMethodParams<M> {
   page: number
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

export default async function list<M extends ValidModel>(params: ListParams<M> = { page: 1 }, collection: Collection<M>): ListResult<M> {
   const docsP = findMany(params, collection)
   const countP = count(
      {
         query: params.query,
         estimated: params.estimated || true
      },
      collection
   )
   const [results, nResults] = await Promise.all([docsP, countP])
   const pageSize = returnPageSize(params.pageSize, collection)

   return {
      results,
      nResults,
      page: params.page,
      pageSize,
      totalPages: Math.floor((nResults + pageSize - 1) / pageSize)
   }
}
