import { Collection } from '../Collection'
import { FindQuery, DocumentResult, OptionalPopulate } from '../types&Interfaces'

export type FindManyAndDeleteParams<M> = {
   query: FindQuery<M>
} & OptionalPopulate

export type FindManyAndDeleteResult<M> = Promise<DocumentResult<M>[] | undefined>

export default async function findManyAndDelete<M>(params: FindManyAndDeleteParams<M>, collection: Collection<M>): FindManyAndDeleteResult<M> {
   const oldDocs = await collection.findMany({
      query: params.query,
      populate: params.populate
   })
   await collection.deleteMany({
      query: params.query
   })
   return oldDocs
}
