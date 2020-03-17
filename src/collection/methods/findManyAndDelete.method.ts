import { Collection } from '../Collection'
import { Document, OptionalPopulate, AnyObject } from '../types&Interfaces'

export type FindManyAndDeleteParams = {
   query?: AnyObject
   fields?: string[]
} & OptionalPopulate

export type FindManyAndDeleteResult = Promise<Document[] | undefined>

export default async function findManyAndDelete(params: FindManyAndDeleteParams = {}, collection: Collection): FindManyAndDeleteResult {
   const oldDocs = await collection.findMany({
      query: params.query,
      populate: params.populate,
      fields: params.fields
   })

   await collection.deleteMany({
      query: params.query
   })
   return oldDocs
}
