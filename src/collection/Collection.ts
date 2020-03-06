import mongodb, { IndexOptions } from 'mongodb'
import { merge } from 'ramda'
import { Logger } from '../Logger'
import count, { CountMethodParams, CountMethodResult } from './methods/count.method'
import deleteMany, { DeleteManyMethodParams, DeleteManyMethodResult } from './methods/deleteMany.method'
import deleteOne, { DeleteOneMethodParams, DeleteOneMethodResult } from './methods/deleteOne.method'
import findMany, { FindManyMethodParams, FindManyMethodResult } from './methods/findMany.method'
import findManyAndReturnObject, { FindManyAndReturnObjectParams, FindManyAndReturnObjectResult } from './methods/findManyAndReturnObject.method'
import findOne, { FindOneMethodParams, FindOneMethodResult } from './methods/findOne.method'
import findOneAndDelete, { FindOneAndDeleteParams, FindOneAndDeleteResult } from './methods/findOneAndDelete.method'
import findOneAndUpdate, { FindOneAndUpdateParams, FindOneAndUpdateResult } from './methods/findOneAndUpdate.method'
import insertMany, { InsertManyMethodParams, InsertManyMethodResult } from './methods/insertMany.method'
import insertOne, { InsertOneMethodParams, InsertOneMethodResult } from './methods/insertOne.method'
import list, { ListParams, ListResult } from './methods/list.method'
import updateMany, { UpdateManyMethodParams, UpdateManyMethodResult } from './methods/updateMany.method'
import updateOne, { UpdateOneMethodParams, UpdateOneMethodResult } from './methods/updateOne.method'
import { KeySetting, Populator } from './Populator'
import { AnyObject, DocumentAfterTransform, DocumentResult, WriteConcernOptions } from './types&Interfaces'

type Indexes = [string | unknown, IndexOptions?][]

export interface ConstructorSettings {
   client?: mongodb.MongoClient
   pagination?: PaginationSettings
   writeConcern?: WriteConcernOptions
   transform?: {
      createdAt?: boolean
   }
   populates?: {
      [key: string]: KeySetting | Collection<AnyObject>
   }
   indexes?: Indexes
   dropAdditionalIndexes?: boolean
   dbName?: string
   initializeCollection?: boolean
}

interface Settings {
   pagination: PaginationSettings
   writeConcern: WriteConcernOptions
   transform: {
      createdAt?: boolean
   }
   indexes: Indexes
   dropAdditionalIndexes: boolean
   initializeCollection: boolean
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
   indexes: [],
   dropAdditionalIndexes: false,
   initializeCollection: true
}
export interface ValidModel {
   [key: string]: unknown
}

export class Collection<M> {
   public readonly name: string
   base: mongodb.Collection
   client: mongodb.MongoClient
   connected = false
   dbName?: string
   settings: Settings
   logger: Logger
   indexesName: string[]
   readonly populator: Populator<M>

   constructor(name: string, settings: ConstructorSettings = {}) {
      this.settings = merge(defaultSettings, settings)
      this.name = name
      this.dbName = settings.dbName

      //populator
      this.populator = new Populator(settings.populates)

      this.logger = new Logger(this.name + ' collection')
      if (settings.client) this.setClient(settings.client)
   }

   setClient(client: mongodb.MongoClient): mongodb.Collection {
      this.client = client

      if (!client.isConnected()) {
         client.once('open', () => this.setClient(client))
         return undefined
      }
      this.base = client.db(this.dbName).collection(this.name)
      this.connected = true
      this.initializeCollectionInDatabase()
      return this.base
   }
   useNative(): mongodb.Collection {
      if (this.base) return this.base
      // if (this.client) return this.setClient(this.client)

      if (!this.connected) throw new Error('Collection does not have client yet')
      throw new Error('Something went wrong - No base found')
   }
   transformDocument(d: DocumentResult<M>): DocumentAfterTransform<M> {
      if (!d) return undefined
      const result: DocumentAfterTransform<M> = d
      if (d._id && this.settings.transform.createdAt) result._createdAt = d._id.getTimestamp()

      return result
   }
   async initializeCollectionInDatabase(): Promise<void> {
      if (!this.settings.initializeCollection) return
      if (this.settings.indexes.length > 0) {
         const indexesNamesP = this.settings.indexes.map(([fields, option]) => this.useNative().createIndex(fields, option))
         this.indexesName = await Promise.all(indexesNamesP)
         if (this.settings.dropAdditionalIndexes) this.dropAdditionalIndexes()
      }
   }
   async dropAdditionalIndexes(): Promise<void> {
      const indexes: { name: string }[] = await this.useNative().indexes()
      const additionalIndexesName: string[] = []
      const dropP: Promise<[]>[] = []

      indexes.map(({ name }) => {
         if (name != '_id_' && !this.indexesName.includes(name)) {
            additionalIndexesName.push(name)
            dropP.push(this.useNative().dropIndex(name))
         }
      })

      if (dropP.length > 0) {
         await Promise.all(dropP)
         this.logger.info(`Additional indexes: [${additionalIndexesName}] dropped!`)
         return
      }
      this.logger.debug('No additional index found')
   }
   findOne(params: FindOneMethodParams<M>): FindOneMethodResult<M> {
      return findOne(params, this)
   }
   findMany(params: FindManyMethodParams<M>): FindManyMethodResult<M> {
      return findMany<M>(params, this)
   }
   insertOne(params: InsertOneMethodParams<M>): InsertOneMethodResult<M> {
      return insertOne<M>(params, this)
   }
   insertMany(params: InsertManyMethodParams<M>): InsertManyMethodResult<M> {
      return insertMany<M>(params, this)
   }
   deleteOne(params: DeleteOneMethodParams<M>): DeleteOneMethodResult {
      return deleteOne<M>(params, this)
   }
   deleteMany(params: DeleteManyMethodParams<M> = {}): DeleteManyMethodResult {
      return deleteMany<M>(params, this)
   }
   updateOne(params: UpdateOneMethodParams<M>): UpdateOneMethodResult {
      return updateOne<M>(params, this)
   }
   updateMany(params: UpdateManyMethodParams<M>): UpdateManyMethodResult {
      return updateMany<M>(params, this)
   }
   count(params: CountMethodParams<M>): CountMethodResult {
      return count<M>(params, this)
   }
   findOneAndDelete(params: FindOneAndDeleteParams<M>): FindOneAndDeleteResult<M> {
      return findOneAndDelete<M>(params, this)
   }
   findOneAndUpdate(params: FindOneAndUpdateParams<M>): FindOneAndUpdateResult<M> {
      return findOneAndUpdate<M>(params, this)
   }
   findManyAndReturnObject(params: FindManyAndReturnObjectParams<M>): FindManyAndReturnObjectResult<M> {
      return findManyAndReturnObject<M>(params, this)
   }
   list(params: ListParams<M>): ListResult<M> {
      return list<M>(params, this)
   }
}
