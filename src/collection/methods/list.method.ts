import { Document } from '../types&Interfaces'
import { FindManyMethodParams } from './findMany.method'
import { returnPageSize } from '../utils'
import { Collection } from 'collection/Collection'

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

export default async function list(this: Collection, params: ListParams = { page: 1 }): ListResult {
   const docsP = this.findMany(params)
   const countP = this.count({
      query: params.query,
      estimated: params.estimated || true
   })
   const [docs, nResults] = await Promise.all([docsP, countP])
   const pageSize = returnPageSize(this, params.pageSize)

   return {
      docs,
      nResults,
      page: params.page,
      pageSize,
      totalPages: Math.floor((nResults + pageSize - 1) / pageSize)
   }
}
