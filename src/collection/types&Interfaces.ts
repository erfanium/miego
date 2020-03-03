// type Optional<T> = { [P in keyof T]? : T[P] }
import mongodb, { WriteError, ObjectID, FindOneOptions } from 'mongodb'

export interface AnyObject {
   [key: string]: any
}

export type ModelWithId<M> = {
   _id: ObjectID
} & M

export type ModelWithOptionalId<M> = {
   _id?: ObjectID
} & M

export type DocumentResult<M> = {
   _id?: ObjectID
} & {
   [key in keyof M]?: M[key] extends ObjectID ? any : M[key]
}

export type DocumentAfterTransform<M> = {
   _id?: ObjectID
   _createdAt?: Date
} & {
   [key in keyof M]?: M[key] extends ObjectID ? any : M[key]
}

export type FindQuery<M> =
   | ({
        [key in keyof ModelWithId<M>]?: ModelWithId<M>[key]
     } &
        ModelWithOptionalId<M>)
   | {
        [key: string]: any
     }

export type UpdateQuery<M> = mongodb.UpdateQuery<ModelWithId<M>>

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

export type OptionalSort<M> = {
   sort?: string
}

export interface OptionalMap {
   map?: (d: any) => any
}

export type CurserOptions<M> = OptionalPagination & OptionalSort<M> & OptionalMap

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

export type InsertWriteOpResult<M> = {
   insertedCount: number
   ops: Array<ModelWithId<M> & CreatedAt>
   insertedIds: { [key: number]: ObjectID }
   result: { ok: number; n: number; errors?: Array<WriteError> }
}

export interface WriteConcernOptions {
   w?: number | 'majority' | string
   j?: boolean
   wtimeout?: number
}

export interface IFindOneOptions extends FindOneOptions {
   projection?: {
      [key: string]: string | number
   }
}
