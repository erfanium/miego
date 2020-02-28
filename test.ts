import { Collection } from './src/index'

interface Post {
   creator: string
   text: string
}

const post = new Collection<Post>('post')

async function doo() {
   await post.connect()

   // await post.base.createIndex(
   //    {
   //       creator: 1
   //    },
   //    { unique: true }
   // )
   // @ts-ignore
   const result = await post.updateAll({
      query: { text: 'hi' },
      update: {
         $set: {
            creator: 'x'
         }
      },
      upsert: true
   })

   console.log(result)
}

doo()
