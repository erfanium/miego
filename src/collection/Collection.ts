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

interface ConstructorSettings {
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
}

interface Settings {
   pagination: PaginationSettings
   writeConcern: WriteConcernOptions
   transform: {
      createdAt?: boolean
   }
   indexes: Indexes
   dropAdditionalIndexes: boolean
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
   dropAdditionalIndexes: false
}
export interface ValidModel {
   [key: string]: unknown
}
export class Collection<M> {
   public readonly name: string
   base: mongodb.Collection
   client: mongodb.MongoClient
   isConnecting = false
   connected = false
   settings: Settings
   logger: Logger
   indexesName: string[]
   readonly populator: Populator<M>

   constructor(name: string, settings?: ConstructorSettings) {
      this.settings = merge(defaultSettings, settings)
      this.name = name
      this.populator = new Populator(this, settings.populates)
      this.logger = new Logger(this.name + ' collection')
      if (settings.client) this.setClient(settings.client)
   }

   setClient(client: mongodb.MongoClient): mongodb.Collection {
      if (!client.isConnected()) {
         this.client = client
         client.once('open', () => this.setClient(client))
         return undefined
      }
      this.base = client.db().collection(this.name)

      this.isConnecting = false
      this.connected = true
      this.onConnect()
      return this.base
   }
   useNative(): mongodb.Collection {
      if (this.isConnecting)
         throw new Error(
            "Collection client not yet connected, Use query's ONLY when client is connected, For example use await for connect method"
         )
      if (this.base) return this.base
      // if (this.client) return this.setClient(this.client)

      if (!this.connected) throw new Error('Collection does not have client yet')
      throw new Error('No base found')
   }
   transformDocument(d: DocumentResult<M>): DocumentAfterTransform<M> {
      if (!d) return undefined
      const result: DocumentAfterTransform<M> = d
      if (d._id && this.settings.transform.createdAt) result._createdAt = d._id.getTimestamp()

      return result
   }
   private async onConnect(): Promise<void> {
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
   list(argA: ListParams<M>): ListResult<M> {
      return list<M>(argA, this)
   }
}
