import { Collection } from './Collection'
import { ObjectID } from 'mongodb'
import { isObject } from './utils'
import { Document } from './types&Interfaces'

interface PopulateDependency {
   target: Collection
   splittedKeys: SplittedKey[]
   keys: string[]
   requiredIds: ObjectID[]
   params?: {
      populate?: string[]
      fields?: string[]
   }
   result?: AnyObject
}

export interface AnyObject {
   [key: string]: unknown
}

type SplittedKey = string[]

export interface KeySetting {
   target: Collection
   params: {
      populate?: string[]
      fields?: string[]
   }
}

export function pushIfNotExist(toPush: unknown | unknown[], array: unknown[]): void {
   if (!toPush) return
   if (Array.isArray(toPush)) {
      toPush.forEach((v): void => {
         if (!v) return
         if (!array.includes(v)) array.push(v)
      })
      return
   }
   if (!array.includes(toPush)) array.push(toPush)
}

export function getIdsFromDoc(doc: AnyObject, splittedKey: SplittedKey, ids: ObjectID[]): void {
   if (!doc) return undefined
   const value = doc[splittedKey[0]]
   if (!value) return undefined
   if (value instanceof ObjectID) return pushIfNotExist(value, ids)
   if (splittedKey[1]) {
      if (Array.isArray(value)) value.forEach((d) => this.getIdsFromDoc(d, splittedKey.slice(1), ids))
      if (isObject(value)) this.getIdsFromDoc(value, splittedKey.slice(1), ids)
   }
   if (Array.isArray(value)) {
      value.forEach((v) => {
         if (v instanceof ObjectID) return pushIfNotExist(v, ids)
         return undefined
      })
   }
   return undefined
}

function getIdsFromDocs(docs: AnyObject[], splittedKey: SplittedKey, ids: ObjectID[]): void {
   if (!docs) return undefined
   docs.forEach((doc) => getIdsFromDoc(doc, splittedKey, ids))
   return undefined
}

export function replaceIdsFromDoc(doc: AnyObject, splittedKey: SplittedKey, ids: ObjectID[], result: AnyObject): void {
   if (!doc) return
   const value = doc[splittedKey[0]]
   if (!value) return
   if (value instanceof ObjectID) {
      doc[splittedKey[0]] = result[value.toString()]
      return
   }

   if (splittedKey[1]) {
      if (Array.isArray(value)) value.forEach((d) => replaceIdsFromDoc(d, splittedKey.slice(1), ids, result))
      if (isObject(value)) replaceIdsFromDoc(value as AnyObject, splittedKey.slice(1), ids, result)
   }
   if (Array.isArray(value)) {
      value.forEach((v, index) => {
         if (v instanceof ObjectID) {
            value[index] = result[v.toString()]
            return
         }
         return
      })
   }
   return
}

function replaceIdsFromDocs(docs: AnyObject[], splittedKey: SplittedKey, ids: ObjectID[], result: AnyObject): void {
   if (!docs) return undefined
   docs.forEach((doc) => replaceIdsFromDoc(doc, splittedKey, ids, result))
   return undefined
}

export class Populator {
   readonly keysSetting: { [key: string]: KeySetting }

   constructor(keysSetting: { [key: string]: KeySetting | Collection } = {}) {
      this.keysSetting = {}
      Object.keys(keysSetting).forEach((keyName: string) => {
         const setting = keysSetting[keyName]
         if (setting instanceof Collection) {
            this.keysSetting[keyName] = {
               target: setting,
               params: {}
            }
            return
         }
         this.keysSetting[keyName] = setting as KeySetting
      })
   }

   async populate(docs: Document[], populateKeys: string[]): Promise<AnyObject[]> {
      const populateDependencies: PopulateDependency[] = []
      const splittedKeys: SplittedKey[] = []

      // find dependencies

      populateKeys.forEach((key: string) => {
         const populateKeySetting = this.keysSetting[key]
         if (!populateKeySetting) return
         const splittedKey: SplittedKey = key.split('.')

         let dependency = populateDependencies.find((d) => d.target === populateKeySetting.target)
         if (!dependency) {
            dependency = {
               target: populateKeySetting.target,
               splittedKeys: [],
               keys: [],
               requiredIds: [],
               params: populateKeySetting.params
            }
            populateDependencies.push(dependency)
         }

         dependency.splittedKeys.push(splittedKey)
         dependency.keys.push(key)

         splittedKeys.push(splittedKey)
         pushIfNotExist(getIdsFromDocs(docs, splittedKey, dependency.requiredIds), dependency.requiredIds)
      })

      // fetch dependencies

      const promises: Promise<unknown>[] = []
      populateDependencies.forEach((populateDependency) => {
         promises.push(
            populateDependency.target
               .findManyAndReturnObject({
                  query: {
                     _id: {
                        $in: populateDependency.requiredIds
                     }
                  },
                  key: '_id',
                  populate: populateDependency.params.populate,
                  fields: populateDependency.params.fields
               })
               .then((result) => (populateDependency.result = result))
         )
      })

      await Promise.all(promises)

      // transform

      populateKeys.forEach((key: string, keyIndex) => {
         const dependency = populateDependencies.find((dependency) => dependency.keys.includes(key))
         replaceIdsFromDocs(docs, splittedKeys[keyIndex], dependency.requiredIds, dependency.result)
      })
      return docs
   }
}
