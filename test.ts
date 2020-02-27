import { Collection } from './src/index'

interface Post {
   creator: string
   text: string
}

const post = new Collection<Post>('post')

async function doo() {
   await post.connect()

   // post.insertOne({
   //    data: {
   //       creator: 'erf',
   //       text: 'hi',
   //    },
   // })

   // const result = await post.insertMany({
   //    data: [
   //       {
   //          creator: 'ali',
   //          text: 'hi im ali',
   //       },
   //       {
   //          creator: 'hos',
   //          text: 'hi im hos',
   //       },
   //    ],
   // })
   const result = await post.deleteOne({
      query: {
         creator: 'hos',
      },
   })
}

doo()
