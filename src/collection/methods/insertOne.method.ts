import { Collection } from '../Collection'
import { DocumentResult, ModelWithOptionalId, WriteConcernOptions } from '../types&Interfaces'
import { returnWriteConcern } from '../utils'

export interface InsertOneMethodParams<M> {
   entity: ModelWithOptionalId<M>
   writeConcern?: WriteConcernOptions
}

export type InsertOneMethodResult<M> = Promise<DocumentResult<M>>

export default async function insertOne<M>(params: InsertOneMethodParams<M>, collection: Collection<M>): InsertOneMethodResult<M> {
   const writeConcern = returnWriteConcern(collection, params.writeConcern)

   const doc = await collection
      .useNative()
      .insertOne(params.entity, {
         w: writeConcern.w,
         j: writeConcern.j,
         wtimeout: writeConcern.wtimeout
      })
      .then((r) => r.ops[0])

   return collection.transformDocument(doc)
}
