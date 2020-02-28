// type Optional<T> = { [P in keyof T]? : T[P] }
import { WriteError, ObjectID } from 'mongodb'

export interface AnyObject {
   [key: string]: any
}

export type ModelWithId<M> = {
   _id: ObjectID
} & M

export type ModelWithOptionalId<M> = {
   _id?: ObjectID
} & M

export type DocumentFindResult<M> = ModelWithId<M> & CreatedAt

export type FindOrUpdateQuery<M> =
   | ({
        [key in keyof ModelWithId<M>]?: ModelWithId<M>[key]
     } &
        ModelWithOptionalId<M>)
   | {
        [key: string]: any
     }

export interface CreatedAt {
   _createdAt: Date
}

export interface OptionalPopulate {
   populate?: [string]
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

export interface OptionalNumbering {
   numbering?: boolean
}

export type CurserOptions<M> = OptionalPagination & OptionalSort<M> & OptionalMap & OptionalNumbering

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
