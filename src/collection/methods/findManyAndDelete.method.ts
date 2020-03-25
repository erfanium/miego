import { Document, OptionalPopulate, AnyObject } from '../types&Interfaces'
import { Collection } from 'collection/Collection'

export type FindManyAndDeleteParams = {
   query?: AnyObject
   fields?: string[]
} & OptionalPopulate

export type FindManyAndDeleteResult = Promise<Document[] | undefined>

export default async function findManyAndDelete(this: Collection, params: FindManyAndDeleteParams = {}): FindManyAndDeleteResult {
   const oldDocs = await this.findMany({
      query: params.query,
      populate: params.populate,
      fields: params.fields
   })

   await this.deleteMany({
      query: params.query
   })
   return oldDocs
}
