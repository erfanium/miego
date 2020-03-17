// type Optional<T> = { [P in keyof T]? : T[P] }
import { WriteError, ObjectID, FindOneOptions } from 'mongodb'

export interface AnyObject {
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   [key: string]: any
}

export interface Document {
   _id?: ObjectID
   [key: string]: unknown
}

export interface CreatedAt {
   _createdAt: Date
}

export interface OptionalPopulate {
   populate?: string[]
}

export interface OptionalPagination {
   page?: number
   pageSize?: number
}

export type OptionalSort = {
   sort?: string
}

export type CurserOptions = OptionalPagination & OptionalSort

export interface DeleteResult {
   deletedCount: number
   ok: boolean
}

export interface UpdateResult {
   updatedCount: number
   upsertedCount: number
   matchedCount: number
   upsertedId?: { _id: ObjectID }
   ok: boolean
}

export type InsertWriteOpResult = {
   insertedCount: number
   ops: Array<Document>
   insertedIds: { [key: number]: ObjectID }
   result: { ok: number; n: number; errors?: Array<WriteError> }
}

export interface WriteConcernOptions {
   w?: number | 'majority' | string
   j?: boolean
   wtimeout?: number
}

export interface ExtendedFindOneOptions extends FindOneOptions {
   projection?: {
      [key: string]: string | number
   }
}
