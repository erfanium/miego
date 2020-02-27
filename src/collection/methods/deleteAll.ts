import { Collection } from '../Collection'
import { FindQuery, DeleteResult } from '../types&Interfaces'

export type DeleteAllMethodParams<M> = {
   query: FindQuery<M>
}

export type DeleteAllMethodResult = Promise<DeleteResult>

export default async function deleteAll<M>(
   params: DeleteAllMethodParams<M>,
   collection: Collection<M>,
): DeleteAllMethodResult {
   const result = await collection.getBase().deleteMany(params.query)
   return {
      deletedCount: result.deletedCount,
      ok: result.result.ok === 1,
   }
}
