import { Collection } from './Collection'
import { WriteConcernOptions } from './types&Interfaces'
import { merge } from 'ramda'

export function decodeSortDash(s: string): [string, -1 | 1] {
   if (s.startsWith('-')) return [s.slice(1), -1]
   return [s, 1]
}
export function decodeFieldDash(s: string): [string, 0 | 1] {
   if (s === '-_id') s = '_id'
   if (s.startsWith('-')) return [s.slice(1), 0]
   return [s, 1]
}

export function isObject(a: unknown): boolean {
   return !!a && a.constructor === Object
}

export function returnPageSize(collection: Collection, paramPageSize?: number): number {
   return paramPageSize || collection.settings.pagination.defaultPageSize || 10
}
export function returnWriteConcern(collection: Collection, paramWC?: WriteConcernOptions): WriteConcernOptions {
   return merge(collection.settings.writeConcern, paramWC) || {}
}
