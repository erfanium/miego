import { Collection } from './src/index'

interface Post {
   creator: string
   text: string
}

const post = new Collection<Post>('posts')

async function doo() {
   await post.connect()

   // await post.base.createIndex(
   //    {
   //       creator: 1
   //    },
   //    { unique: true }
   // )
   // @ts-ignore
   const result = await post.useNative().findAnd

   console.log(result)
}

doo()
