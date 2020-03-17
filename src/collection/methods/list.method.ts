import { Collection } from '../Collection'
import { Document } from '../types&Interfaces'
import findMany, { FindManyMethodParams } from './findMany.method'
import count from './count.method'
import { returnPageSize } from '../utils'

export interface ListParams extends FindManyMethodParams {
   page?: number
   estimated?: boolean
}

interface ObjectReturnType {
   docs: Document[]
   nResults: number
   page: number
   pageSize: number
   totalPages: number
}

export type ListResult = Promise<ObjectReturnType>

export default async function list(params: ListParams = { page: 1 }, collection: Collection): ListResult {
   const docsP = findMany(params, collection)
   const countP = count(
      {
         query: params.query,
         estimated: params.estimated || true
      },
      collection
   )
   const [docs, nResults] = await Promise.all([docsP, countP])
   const pageSize = returnPageSize(collection, params.pageSize)

   return {
      docs,
      nResults,
      page: params.page,
      pageSize,
      totalPages: Math.floor((nResults + pageSize - 1) / pageSize)
   }
}
