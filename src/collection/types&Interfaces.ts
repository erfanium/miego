// type Optional<T> = { [P in keyof T]? : T[P] }
import { ObjectID } from 'mongodb'

export type ModelWithId<M> = {
   _id: ObjectID
} & M

export type ModelWithOptionalId<M> = {
   _id?: ObjectID
} & M

export type DocumentFindResult<M> = ModelWithId<M> & CreatedAt

export type FindQuery<M> =
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

export type OptionalSortKeys<M> = keyof ModelWithOptionalId<M> | string

export type OptionalSort<M> = {
   sort?: {
      [key in OptionalSortKeys<M>]?: -1 | 1
   }
}

export interface OptionalMap {
   map?: (d: any) => any
}

export interface OptionalNumbering {
   numbering?: boolean
}

export type CurserOptions<M> = {
   returnCurser?: boolean
} & OptionalPagination &
   OptionalSort<M> &
   OptionalMap &
   OptionalNumbering

export interface DeleteResult {
   deletedCount: number
   ok: boolean
}
