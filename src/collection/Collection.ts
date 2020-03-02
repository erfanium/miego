import mongodb from 'mongodb'
import { Connection } from '../connection/Connection'
import { merge } from 'ramda'
import { WriteConcernOptions, DocumentResult, DocumentAfterTransform, AnyObject } from './types&Interfaces'
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
import { Populator, KeySetting } from './Populator'
import { Logger } from '../Logger'

interface ConstructorSettings {
   connection?: Connection
   pagination?: PaginationSettings
   writeConcern?: WriteConcernOptions
   transform?: {
      createdAt?: boolean
   }
   populates?: {
      [key: string]: KeySetting | Collection<AnyObject>
   }
   indexes?: {}
}

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
   client: mongodb.MongoClient
   isConnecting: boolean = false
   connected: boolean = false
   settings: Settings
   logger: Logger
   readonly populator: Populator<M>

   constructor(name: string, settings?: ConstructorSettings) {
      this.settings = merge(settings, defaultSettings)
      this.name = name
      this.populator = new Populator(this, settings.populates)
      this.logger = new Logger(`COLLECTION ${this.name}`)
      if (settings.connection) this.setConnection(settings.connection)
   }

   setConnection(client: mongodb.MongoClient): mongodb.Collection {
      if (!client.isConnected()) {
         this.client = client
         return undefined
      }
      this.base = client.db().collection(this.name)

      this.isConnecting = false
      this.connected = true
      return this.base
   }
   useNative(): mongodb.Collection {
      if (this.isConnecting)
         throw new Error(
            "Collection connection not yet connected, Use query's ONLY when connection is connected, For example use await for connect method"
         )
      if (this.base) return this.base

      if (this.client) {
         return this.setConnection(this.client)
      }

      if (!this.connected) throw new Error('Collection does not have connection yet')
      throw new Error('No base found')
   }
   async connect(url?: string, dbName?: string): Promise<mongodb.MongoClient> {
      this.logger.info("it's better to create a separate connection and set it to Collection")
      if (this.connected || this.isConnecting) return undefined
      const connection: mongodb.MongoClient = Connection.getConnection(url)
      this.isConnecting = true

      const client = await connection.connect()
      this.setConnection(connection)
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
   deleteMany(argA: DeleteManyMethodParams<M> = {}): DeleteManyMethodResult {
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
