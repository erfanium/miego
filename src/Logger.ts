enum LogLevels {
   debug = 1,
   info = 2,
   warn = 3,
   error = 4
}

export const logLevel: LogLevels = getGlobalLogLevel()

export class Logger {
   logLevel: LogLevels
   namespace: string
   constructor(namespace: string, logLevelString?: keyof typeof LogLevels) {
      this.namespace = namespace
      this.logLevel = LogLevels[logLevelString] || logLevel
   }
   debug(...args: any) {
      if (this.logLevel <= LogLevels.debug) console.log(`\x1b[36mMIEGO-DEBUG | ${this.namespace} |\x1b[0m`, ...args)
   }
   info(...args: any) {
      if (this.logLevel <= LogLevels.info) console.info(`\x1b[32mMIEGO-INFO | ${this.namespace} |\x1b[0m`, ...args)
   }
   warn(...args: any) {
      if (this.logLevel <= LogLevels.warn) console.warn(`\x1b[33mMIEGO-WARN | ${this.namespace} |\x1b[0m`, ...args)
   }
   error(...args: any) {
      console.error(`\x1b[31mMIEGO-ERROR | ${this.namespace} |\x1b[0m`, ...args)
   }
   startTrace(): number {
      if (this.logLevel <= LogLevels.debug) return process.hrtime()[1]
      return undefined
   }
   endTrace(start: number, label: string) {
      if (!start) return
      this.debug(label, '\x1b[47m\x1b[30m\x1b[2m' + ((process.hrtime()[1] - start) / 1000000).toFixed(2), 'ms\x1b[0m')
   }
}

export function getGlobalLogLevel(): LogLevels {
   const NODE_ENV: string = process.env.NODE_ENV || 'development'
   if (NODE_ENV.toLowerCase() === 'production') return LogLevels.warn
   return LogLevels.debug
}
