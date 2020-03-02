import { MongoClient, MongoClientOptions } from 'mongodb'
import { Logger } from '../Logger'
import ramda from 'ramda'

const defaultUrl = 'mongodb://localhost:27017'
const defaultOptions: MongoClientOptions = {
   useUnifiedTopology: true
}

export class Connection extends MongoClient {
   public readonly url: string
   logger: Logger
   static getConnection(url?: string, opts?: MongoClientOptions): MongoClient {
      return new Connection(url, opts)
   }
   constructor(url: string = defaultUrl, opts: MongoClientOptions = {}) {
      const options: MongoClientOptions = ramda.merge(defaultOptions, opts)
      super(url, options)
      this.url = url
      this.logger = new Logger(`CONNECTION ${this.url}`)
      this.on('serverOpening', () => {
         this.logger.info(`Connected`)
      })
   }
}
