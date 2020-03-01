import { Collection, ValidModel } from '../Collection'
import { FindQuery, DocumentResult, OptionalPopulate, OptionalSort, OptionalPagination } from '../types&Interfaces'

export type FindManyAndReturnObjectParams<M> = {
   query: FindQuery<M>
   key?: keyof DocumentResult<M>
} & OptionalPopulate &
   OptionalSort<M> &
   OptionalPagination

type ObjectReturnType<M> = { [key: string]: DocumentResult<M> }

export type FindManyAndReturnObjectResult<M> = Promise<ObjectReturnType<M>>

export default async function findManyAndReturnObject<M extends ValidModel>(
   params: FindManyAndReturnObjectParams<M>,
   collection: Collection<M>
): FindManyAndReturnObjectResult<M> {
   const docs = await collection.findMany({
      query: params.query,
      sort: params.sort,
      page: params.page,
      pageSize: params.pageSize,
      populate: params.populate
   })
   const key: keyof DocumentResult<M> = params.key || '_id'
   const o: ObjectReturnType<M> = {}

   docs.forEach(function(doc) {
      if (o[doc[key]]) return
      o[doc[key].toString()] = collection.transformDocument(doc)
   })

   return o
}
