import { Collection } from '../Collection'
import { FindOrUpdateQuery, DocumentResult, OptionalPopulate } from '../types&Interfaces'

export type FindAllAndDeleteParams<M> = {
   query: FindOrUpdateQuery<M>
} & OptionalPopulate

export type FindAllAndDeleteResult<M> = Promise<DocumentResult<M>[] | undefined>

export default async function findAllAndDelete<M>(params: FindAllAndDeleteParams<M>, collection: Collection<M>): FindAllAndDeleteResult<M> {
   const oldDocs = await collection.findAll({
      query: params.query,
      populate: params.populate
   })
   await collection.deleteAll({
      query: params.query
   })
   return oldDocs
}
