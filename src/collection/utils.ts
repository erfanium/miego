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
