export function getSortDetail(s: string): { sortKey: string; direction: -1 | 1 } {
   if (s.startsWith('-')) {
      return {
         sortKey: s.slice(1),
         direction: -1
      }
   }
   return {
      sortKey: s,
      direction: 1
   }
}
export function isObject(a: any) {
   return !!a && a.constructor === Object
}
// export function waitForEvent(eName: string, event: EventEmitter): Promise<any> {
//    return new Promise(function(resolve) {
//       event.once(eName, resolve)
//    })
// }
