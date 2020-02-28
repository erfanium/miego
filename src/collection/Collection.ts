import mongodb from 'mongodb'
import Connection from '../connection/Connection'
import findOne, { FindOneMethodParams, FindOneMethodResult } from './methods/findOne'
import findAll, { FindAllMethodParams, FindAllMethodResult } from './methods/findAll'
import insertOne, { InsertOneMethodParams, InsertOneMethodResult } from './methods/insertOne'
import insertMany, { InsertManyMethodParams, InsertManyMethodResult } from './methods/insertMany'
import deleteOne, { DeleteOneMethodParams, DeleteOneMethodResult } from './methods/deleteOne'
import deleteAll, { DeleteAllMethodParams, DeleteAllMethodResult } from './methods/deleteAll'
import updateOne, { UpdateOneMethodParams, UpdateOneMethodResult } from './methods/updateOne'
import updateAll, { UpdateAllMethodParams, UpdateAllMethodResult } from './methods/updateAll'

interface ConstructorOptions {}

interface Options {
   pagination: PaginationOptions
}

interface PaginationOptions {
   defaultPageSize: number
}

const defaultOptions: Options = {
   pagination: {
      defaultPageSize: 10
   }
}
export interface ValidModel {
   [key: string]: any
}
export class Collection<M> {
   public readonly name: string
   base: mongodb.Collection
   isConnecting: boolean = false
   options: Options
   constructor(name: string, opts?: ConstructorOptions) {
      this.options = defaultOptions
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
   getBase(): mongodb.Collection {
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
   findOne(argA: FindOneMethodParams<M>): FindOneMethodResult<M> {
      return findOne(argA, this)
   }
   findAll(argA: FindAllMethodParams<M>): FindAllMethodResult<M> {
      return findAll<M>(argA, this)
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
   deleteAll(argA: DeleteAllMethodParams<M>): DeleteAllMethodResult {
      return deleteAll<M>(argA, this)
   }
   updateOne(argA: UpdateOneMethodParams<M>): UpdateOneMethodResult {
      return updateOne<M>(argA, this)
   }
   updateAll(argA: UpdateAllMethodParams<M>): UpdateAllMethodResult {
      return updateAll<M>(argA, this)
   }
}
