import { Collection } from '../Collection'
import { FindQuery, DocumentAfterTransform, OptionalPopulate } from '../types&Interfaces'

export type FindManyAndDeleteParams<M> = {
   query?: FindQuery<M>
   fields?: string[]
} & OptionalPopulate

export type FindManyAndDeleteResult<M> = Promise<DocumentAfterTransform<M>[] | undefined>

export default async function findManyAndDelete<M>(
   params: FindManyAndDeleteParams<M> = {},
   collection: Collection<M>
): FindManyAndDeleteResult<M> {
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
