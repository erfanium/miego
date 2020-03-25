import { Document, OptionalPopulate, OptionalSort, OptionalPagination, AnyObject } from '../types&Interfaces'
import { Collection } from 'collection/Collection'

export type FindManyAndReturnObjectParams = {
   query?: AnyObject
   key?: keyof Document
   fields?: string[]
} & OptionalPopulate &
   OptionalSort &
   OptionalPagination

type ObjectReturnType = { [key: string]: Document }

export default async function findManyAndReturnObject(this: Collection, params: FindManyAndReturnObjectParams = {}): Promise<ObjectReturnType> {
   const docs = await this.findMany({
      query: params.query,
      sort: params.sort,
      page: params.page,
      pageSize: params.pageSize,
      populate: params.populate,
      fields: params.fields
   })
   const key: keyof Document = params.key || '_id'
   const o: ObjectReturnType = {}

   docs.forEach((doc: Document) => {
      if (o[doc[key].toString()]) return
      o[doc[key].toString()] = this.transformDocument(doc)
   })

   return o
}
