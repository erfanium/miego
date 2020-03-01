enum LogLevels {
   debug = 1,
   info = 2,
   warn = 3,
   error = 4
}

export const logLevel: LogLevels = getGlobalLogLevel()

export class Logger {
   logLevel: LogLevels
   constructor(logLevelString?: keyof typeof LogLevels) {
      this.logLevel = LogLevels[logLevelString] || logLevel
   }
   debug(...args: any) {
      if (this.logLevel <= LogLevels.debug) console.log('DEBUG', ...args)
   }
   info(...args: any) {
      if (this.logLevel <= LogLevels.info) console.info('INFO', ...args)
   }
   warn(...args: any) {
      if (this.logLevel <= LogLevels.warn) console.warn('WARN', ...args)
   }
   error(...args: any) {
      console.error('ERROR', ...args)
   }
}

export function getGlobalLogLevel(): LogLevels {
   const NODE_ENV: string = process.env.NODE_ENV || 'development'
   if (NODE_ENV.toLowerCase() === 'production') return LogLevels.warn
   return LogLevels.info
}
