import { Collection } from './src/index'

interface Post {
   creator: string
   text: string
}

const post = new Collection<Post>('posts')

async function doo() {
   await post.connect()

   const result = await post.findManyAndReturnObject({
      query: {}
   })

   console.log(result)
}

doo()
