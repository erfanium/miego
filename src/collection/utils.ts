export function decodeSortDash(s: string): [string, -1 | 1] {
   if (s.startsWith('-')) return [s.slice(1), -1]
   return [s, 1]
}
export function decodeFieldDash(s: string): [string, 0 | 1] {
   if (s.startsWith('-')) return [s.slice(1), 0]
   return [s, 1]
}

export function isObject(a: any) {
   return !!a && a.constructor === Object
}
// export function waitForEvent(eName: string, event: EventEmitter): Promise<any> {
//    return new Promise(function(resolve) {
//       event.once(eName, resolve)
//    })
// }
