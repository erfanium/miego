import mongodb from 'mongodb'
import Connection from '../connection/Connection'
import { WriteConcernOptions, DocumentResult, DocumentAfterTransform } from './types&Interfaces'
import findOne, { FindOneMethodParams, FindOneMethodResult } from './methods/findOne'
import findMany, { FindManyMethodParams, FindManyMethodResult } from './methods/findMany'
import insertOne, { InsertOneMethodParams, InsertOneMethodResult } from './methods/insertOne'
import insertMany, { InsertManyMethodParams, InsertManyMethodResult } from './methods/insertMany'
import deleteOne, { DeleteOneMethodParams, DeleteOneMethodResult } from './methods/deleteOne'
import deleteMany, { DeleteManyMethodParams, DeleteManyMethodResult } from './methods/deleteMany'
import updateOne, { UpdateOneMethodParams, UpdateOneMethodResult } from './methods/updateOne'
import updateMany, { UpdateManyMethodParams, UpdateManyMethodResult } from './methods/updateMany'
import count, { CountMethodParams, CountMethodResult } from './methods/count'
import findOneAndDelete, { FindOneAndDeleteParams, FindOneAndDeleteResult } from './methods/findOneAndDelete'
import findOneAndUpdate, { FindOneAndUpdateParams, FindOneAndUpdateResult } from './methods/findOneAndUpdate'
import findManyAndReturnObject, { FindManyAndReturnObjectParams, FindManyAndReturnObjectResult } from './methods/fIndManyAndReturnObject'

interface ConstructorSettings {}

interface Settings {
   pagination: PaginationSettings
   writeConcern: WriteConcernOptions
   transform: {
      createdAt?: boolean
   }
   indexes: {}
}

interface PaginationSettings {
   defaultPageSize: number
}

const defaultSettings: Settings = {
   pagination: {
      defaultPageSize: 10
   },
   writeConcern: {},
   transform: {
      createdAt: true
   },
   indexes: {}
}
export interface ValidModel {
   [key: string]: any
}
export class Collection<M> {
   public readonly name: string
   base: mongodb.Collection
   isConnecting: boolean = false
   settings: Settings
   constructor(name: string, opts?: ConstructorSettings) {
      this.settings = defaultSettings
      this.name = name
   }
   setConnection(client: mongodb.MongoClient, dbName?: string): void {
      if (!client.isConnected) {
         throw new Error('Only connected connections can be set')
      }
      const db = dbName ? client.db(dbName) : client.db()
      this.isConnecting = false
      this.base = db.collection(this.name)
   }
   useNative(): mongodb.Collection {
      if (this.isConnecting)
         throw new Error(
            "Collection connection not yet connected, Use query's ONLY when connection is connected, For example use await for connect method"
         )
      if (this.base) return this.base
      throw new Error('No base found')
   }
   async connect(url?: string, dbName?: string): Promise<mongodb.MongoClient> {
      const connection: mongodb.MongoClient = Connection.getConnection(url)
      this.isConnecting = true

      const client = await connection.connect()
      this.setConnection(connection, dbName)
      return client
   }
   transformDocument(d: DocumentResult<M>): DocumentAfterTransform<M> {
      if (!d) return undefined
      const result: DocumentAfterTransform<M> = d
      if (d._id && this.settings.transform.createdAt) result._createdAt = d._id.getTimestamp()

      return result
   }
   aggregate(p?: object[], options?: mongodb.CollectionAggregationOptions) {
      return this.useNative().aggregate(p, options)
   }
   bulkWrite(operations: object[], options?: mongodb.CollectionBulkWriteOptions) {
      return this.useNative().bulkWrite(operations, options)
   }

   findOne(argA: FindOneMethodParams<M>): FindOneMethodResult<M> {
      return findOne(argA, this)
   }
   findMany(argA: FindManyMethodParams<M>): FindManyMethodResult<M> {
      return findMany<M>(argA, this)
   }
   insertOne(argA: InsertOneMethodParams<M>): InsertOneMethodResult<M> {
      return insertOne<M>(argA, this)
   }
   insertMany(argA: InsertManyMethodParams<M>): InsertManyMethodResult<M> {
      return insertMany<M>(argA, this)
   }
   deleteOne(argA: DeleteOneMethodParams<M>): DeleteOneMethodResult {
      return deleteOne<M>(argA, this)
   }
   deleteMany(argA: DeleteManyMethodParams<M>): DeleteManyMethodResult {
      return deleteMany<M>(argA, this)
   }
   updateOne(argA: UpdateOneMethodParams<M>): UpdateOneMethodResult {
      return updateOne<M>(argA, this)
   }
   updateMany(argA: UpdateManyMethodParams<M>): UpdateManyMethodResult {
      return updateMany<M>(argA, this)
   }
   count(argA: CountMethodParams<M>): CountMethodResult {
      return count<M>(argA, this)
   }
   findOneAndDelete(argA: FindOneAndDeleteParams<M>): FindOneAndDeleteResult<M> {
      return findOneAndDelete<M>(argA, this)
   }
   findOneAndUpdate(argA: FindOneAndUpdateParams<M>): FindOneAndUpdateResult<M> {
      return findOneAndUpdate<M>(argA, this)
   }
   findManyAndReturnObject(argA: FindManyAndReturnObjectParams<M>): FindManyAndReturnObjectResult<M> {
      return findManyAndReturnObject<M>(argA, this)
   }
}
