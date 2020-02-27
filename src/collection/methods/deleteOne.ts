import { Collection } from '../Collection'
import { FindQuery, DeleteResult } from '../types&Interfaces'

export type DeleteOneMethodParams<M> = {
   query: FindQuery<M>
}

export type DeleteOneMethodResult = Promise<DeleteResult>

export default async function deleteOne<M>(
   params: DeleteOneMethodParams<M>,
   collection: Collection<M>,
): DeleteOneMethodResult {
   const result = await collection.getBase().deleteOne(params.query)
   return {
      deletedCount: result.deletedCount,
      ok: result.result.ok === 1,
   }
}
