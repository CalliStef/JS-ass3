// pages/index.js
import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from "next-auth/react"
import { unstable_getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]"
import axios from 'axios'
import { prisma } from '../server/db/client'
import AddPostForm from './addPost'
import Button from '../components/Button'
import PostSmall from '../components/PostSmall'


export default function Home({posts, sessionUser}){
  const {data: session} = useSession()
  const [currentPosts, setCurrentPosts] = useState(posts)
  const [displayForm, setDisplayForm] = useState(false)
  console.log("POSTs", posts)

  useEffect(() => {
    setCurrentPosts(posts)
  }, [])



  const handleSubmit = async (payload) => {
    if(!session){
      signIn()
    } else{
      const res = await axios.post('/api/posts', payload)
      console.log(res.data)
      setCurrentPosts([...posts, res.data])
      setDisplayForm(false)
    }
  }

  const handleLike = async (postId) => {
    if(!session){
      signIn()
    } else{
      const res = await axios.post('/api/likes', {postId})
      console.log(res.data)
    }
  }

  const checkLike = (post) => {
    if(post.Like && sessionUser){
      return post.Like.some(l =>  l.userId == sessionUser.id)
    } else {
      return false
    }
  }

  
  return (
    <div className="pt-8 pb-10 lg:pt-12 lg:pb-14 mx-auto max-w-7xl px-2">
      {
        displayForm ?
        (
          <>
          <AddPostForm handleSubmit={handleSubmit}></AddPostForm>
          </>
        )
        :
        (
          <div className="max-w-2xl mx-auto">
          <Button onClick={() => setDisplayForm(true)}>Create a snippet</Button>
          
          <ul className="mt-8">
            {currentPosts.map((post) => (

              <li key={post.id}>
                  <PostSmall 
                    post={post}
                    user={post.user}
                    href={`/code/${post.id}`}
                    liked={checkLike(post)}
                    onLike={() => handleLike(post.id)}
                    className='my-10'
                    onComment={() => console.log("comment post", post.id)}
                    onShare={() => console.log("share post", post.id)}
                  />
              </li>
              
            ))}
          </ul>
          </div>
        )
      }
      
    </div>
  )
}

export async function getServerSideProps(context) {
  const session = await unstable_getServerSession(context.req, context.res, authOptions)

  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      user: true,
      Like: true
    }
  })

  let sessionUser = null
  if(session){
    sessionUser = await prisma.user.findUnique({
      where: {
        email: session.user.email 
      }
    })
  }




  return {
    props: {
      posts: JSON.parse(JSON.stringify(posts)),
      session,
      sessionUser
    }
  }
}
