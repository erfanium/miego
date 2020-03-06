import { Collection } from '../Collection'
import { FindQuery, DocumentAfterTransform, OptionalPopulate, OptionalSort, OptionalPagination } from '../types&Interfaces'

export type FindManyAndReturnObjectParams<M> = {
   query?: FindQuery<M>
   key?: keyof DocumentAfterTransform<M>
   fields?: string[]
} & OptionalPopulate &
   OptionalSort<M> &
   OptionalPagination

type ObjectReturnType<M> = { [key: string]: DocumentAfterTransform<M> }

export type FindManyAndReturnObjectResult<M> = Promise<ObjectReturnType<M>>

export default async function findManyAndReturnObject<M>(
   params: FindManyAndReturnObjectParams<M> = {},
   collection: Collection<M>
): FindManyAndReturnObjectResult<M> {
   const docs = await collection.findMany({
      query: params.query,
      sort: params.sort,
      page: params.page,
      pageSize: params.pageSize,
      populate: params.populate,
      fields: params.fields
   })
   const key: keyof DocumentAfterTransform<M> = params.key || '_id'
   const o: ObjectReturnType<M> = {}

   docs.forEach(function(doc) {
      if (o[doc[key].toString()]) return
      o[doc[key].toString()] = collection.transformDocument(doc)
   })

   return o
}
