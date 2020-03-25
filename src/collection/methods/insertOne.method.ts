import { Collection } from '../Collection'
import { Document, WriteConcernOptions } from '../types&Interfaces'
import { returnWriteConcern } from '../utils'

export interface InsertOneMethodParams {
   entity: Document
   writeConcern?: WriteConcernOptions
}

export type InsertOneMethodResult = Promise<Document>

export default async function insertOne(this: Collection, params: InsertOneMethodParams): InsertOneMethodResult {
   const writeConcern = returnWriteConcern(this, params.writeConcern)

   const doc = await this.base
      .insertOne(params.entity, {
         w: writeConcern.w,
         j: writeConcern.j,
         wtimeout: writeConcern.wtimeout
      })
      .then((r) => r.ops[0])

   return this.transformDocument(doc)
}
