import { Collection } from '../Collection'
import { FindOrUpdateQuery, DeleteResult } from '../types&Interfaces'

export type DeleteOneMethodParams<M> = {
   query: FindOrUpdateQuery<M>
}

export type DeleteOneMethodResult = Promise<DeleteResult>

export default async function deleteOne<M>(params: DeleteOneMethodParams<M>, collection: Collection<M>): DeleteOneMethodResult {
   const result = await collection.getBase().deleteOne(params.query)
   return {
      deletedCount: result.deletedCount,
      ok: result.result.ok === 1
   }
}
