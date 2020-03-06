import { Logger } from '../../src/Logger'

describe('Logger', () => {
   const logs: {
      level: string
      args: unknown[]
   }[] = []

   const l = new Logger('test', 'debug')
   l.base = {
      debug(...args: unknown[]): void {
         logs.push({ level: 'debug', args })
      },
      info(...args: unknown[]): void {
         logs.push({ level: 'info', args })
      },
      warn(...args: unknown[]): void {
         logs.push({ level: 'warn', args })
      },
      error(...args: unknown[]): void {
         logs.push({ level: 'error', args })
      }
   }

   it('Should work', () => {
      l.debug('d', 'e')
      l.info('hi', true)
      l.warn('www')
      l.error('oh my gash')

      expect(logs.length).toBe(4)
      expect(logs.map((log) => log.level)).toEqual(['debug', 'info', 'warn', 'error'])
   })
})

describe('static => getGlobalLogLevel', () => {
   it('should work correctly', () => {
      expect(Logger.getGlobalLogLevel()).toBe(2)
   })
})
