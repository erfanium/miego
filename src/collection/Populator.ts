import { Collection } from './Collection'
import { DocumentResult } from './types&Interfaces'
import { ObjectID } from 'mongodb'
import { isObject } from './utils'

interface PopulateDependency<M> {
   target: Collection<AnyObject>
   splittedKeys: SplittedKey[]
   keys: string[]
   requiredIds: ObjectID[]
   params?: {
      populate?: string[]
      fields?: string[]
   }
   result?: DocumentResult<AnyObject>
}

interface AnyObject {
   [key: string]: any
}
type SplittedKey = string[]

export const utils = {
   pushIfNotExist(toPush: any | any[], array: any[]) {
      if (!toPush) return
      if (Array.isArray(toPush)) {
         toPush.forEach((v) => {
            if (!v) return
            if (!array.includes(v)) array.push(v)
         })
      }
      if (!array.includes(toPush)) array.push(toPush)
   },
   // splitPopulateKeys(keys: string[]): SplittedKey[] {
   //    return keys.map((key) => key.split('.'))
   // },
   getIdsFromDoc(doc: AnyObject, splittedKey: SplittedKey, ids: ObjectID[]) {
      if (!doc) return undefined
      const value = doc[splittedKey[0]]
      if (!value) return undefined
      if (value instanceof ObjectID) return utils.pushIfNotExist(value, ids)
      if (splittedKey[1]) {
         if (Array.isArray(value)) value.forEach((d) => this.getIdsFromDoc(d, splittedKey.slice(1), ids))
         if (isObject(value)) this.getIdsFromDoc(value, splittedKey.slice(1), ids)
      }
      if (Array.isArray(value)) {
         value.forEach((v) => {
            if (v instanceof ObjectID) return utils.pushIfNotExist(v, ids)
            return undefined
         })
      }
      return undefined
   },
   getIdsFromDocs(docs: AnyObject[], splittedKey: SplittedKey, ids: ObjectID[]): void {
      if (!docs) return undefined
      docs.forEach((doc) => this.getIdsFromDoc(doc, splittedKey, ids))
      return undefined
   },
   replaceIdsFromDoc(doc: AnyObject, splittedKey: SplittedKey, ids: ObjectID[], result: AnyObject): void {
      if (!doc) return
      const value = doc[splittedKey[0]]
      if (!value) return
      if (value instanceof ObjectID) {
         doc[splittedKey[0]] = result[value.toString()]
         return
      }

      if (splittedKey[1]) {
         if (Array.isArray(value)) value.forEach((d) => this.getIdsFromDoc(d, splittedKey.slice(1), ids))
         if (isObject(value)) this.getIdsFromDoc(value, splittedKey.slice(1), ids)
      }
      if (Array.isArray(value)) {
         value.forEach((v) => {
            if (v instanceof ObjectID) {
               doc[splittedKey[0]] = result[v.toString()]
               return
            }
            return
         })
      }
      return
   },
   replaceIdsFromDocs(docs: AnyObject[], splittedKey: SplittedKey, ids: ObjectID[], result: AnyObject): void {
      if (!docs) return undefined
      docs.forEach((doc) => this.replaceIdsFromDoc(doc, splittedKey, ids, result))
      return undefined
   }
}
export interface KeySetting {
   target: Collection<{ [key: string]: any }>
   params: {
      populate?: string[]
      fields?: string[]
   }
}

export class Populator<M> {
   readonly keysSetting: { [key: string]: KeySetting }
   readonly collection: Collection<M>

   constructor(collection: Collection<M>, keysSetting: { [key: string]: KeySetting | Collection<AnyObject> } = {}) {
      this.collection = collection
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

   async populate(docs: DocumentResult<M>[], populateKeys: string[]) {
      const populateDependencies: PopulateDependency<M>[] = []
      const splittedKeys: SplittedKey[] = []

      // find dependencies

      populateKeys.forEach((key: string) => {
         const populateKeySetting = this.keysSetting[key]
         if (!populateKeySetting) return

         let dependency = populateDependencies.find((d) => d.target === populateKeySetting.target)
         const splittedKey: SplittedKey = key.split('.')
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
         utils.pushIfNotExist(utils.getIdsFromDocs(docs, splittedKey, dependency.requiredIds), dependency.requiredIds)
      })

      // fetch dependencies

      const promises: Promise<any>[] = []
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
                  populate: populateDependency.params.populate
                  // fields: params.fields // todo: fix
               })
               .then((result) => (populateDependency.result = result))
         )
      })

      await Promise.all(promises)

      populateKeys.forEach((key: string, keyIndex) => {
         const dependency = populateDependencies.find((dependency) => dependency.keys.includes(key))
         utils.replaceIdsFromDocs(docs, splittedKeys[keyIndex], dependency.requiredIds, dependency.result)
      })
      return docs
   }
}
