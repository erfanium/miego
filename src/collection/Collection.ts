import mongodb, { IndexOptions } from 'mongodb'
import { merge } from 'ramda'
import { Logger } from '../Logger'
import count from './methods/count.method'
import deleteMany from './methods/deleteMany.method'
import deleteOne from './methods/deleteOne.method'
import findMany from './methods/findMany.method'
import findManyAndReturnObject from './methods/findManyAndReturnObject.method'
import findOne from './methods/findOne.method'
import findOneAndDelete from './methods/findOneAndDelete.method'
import findOneAndUpdate from './methods/findOneAndUpdate.method'
import insertMany from './methods/insertMany.method'
import insertOne from './methods/insertOne.method'
import list from './methods/list.method'
import updateMany from './methods/updateMany.method'
import updateOne from './methods/updateOne.method'
import { KeySetting, Populator } from './Populator'
import { AnyObject, WriteConcernOptions, Document } from './types&Interfaces'

type Indexes = [string | unknown, IndexOptions?][]

export interface ConstructorSettings {
   client?: mongodb.MongoClient
   pagination?: PaginationSettings
   writeConcern?: WriteConcernOptions
   transform?: {
      createdAt?: boolean
   }
   populates?: {
      [key: string]: KeySetting | Collection
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

export class Collection {
   public readonly name: string
   base: mongodb.Collection
   client: mongodb.MongoClient
   connected = false
   dbName?: string
   settings: Settings
   logger: Logger
   indexesName: string[]
   readonly populator: Populator

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
      if (!this.connected) throw new Error('Collection does not have client yet')
      throw new Error('Something went wrong - No base found')
   }
   transformDocument(d: Document): Document {
      if (!d) return undefined
      const result: AnyObject = d
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
   findOne = findOne
   findMany = findMany
   insertOne = insertOne
   insertMany = insertMany
   deleteOne = deleteOne
   deleteMany = deleteMany
   updateOne = updateOne
   updateMany = updateMany
   count = count
   findOneAndDelete = findOneAndDelete
   findOneAndUpdate = findOneAndUpdate
   findManyAndReturnObject = findManyAndReturnObject
   list = list
}
