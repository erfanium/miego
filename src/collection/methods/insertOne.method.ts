import { Collection } from '../Collection'
import { Document, WriteConcernOptions } from '../types&Interfaces'
import { returnWriteConcern } from '../utils'

export interface InsertOneMethodParams {
   entity: Document
   writeConcern?: WriteConcernOptions
}

export type InsertOneMethodResult = Promise<Document>

export default async function insertOne(params: InsertOneMethodParams, collection: Collection): InsertOneMethodResult {
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
