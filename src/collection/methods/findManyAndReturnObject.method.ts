import { Collection } from '../Collection'
import { Document, OptionalPopulate, OptionalSort, OptionalPagination, AnyObject } from '../types&Interfaces'

export type FindManyAndReturnObjectParams = {
   query?: AnyObject
   key?: keyof Document
   fields?: string[]
} & OptionalPopulate &
   OptionalSort &
   OptionalPagination

type ObjectReturnType = { [key: string]: Document }

export type FindManyAndReturnObjectResult = Promise<ObjectReturnType>

export default async function findManyAndReturnObject(
   params: FindManyAndReturnObjectParams = {},
   collection: Collection
): FindManyAndReturnObjectResult {
   const docs = await collection.findMany({
      query: params.query,
      sort: params.sort,
      page: params.page,
      pageSize: params.pageSize,
      populate: params.populate,
      fields: params.fields
   })
   const key: keyof Document = params.key || '_id'
   const o: ObjectReturnType = {}

   docs.forEach(function(doc) {
      if (o[doc[key].toString()]) return
      o[doc[key].toString()] = collection.transformDocument(doc)
   })

   return o
}
