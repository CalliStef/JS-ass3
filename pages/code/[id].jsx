import { useState, useEffect } from 'react'
import { useSession, signIn } from "next-auth/react"
import { unstable_getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]"
import Post from '../../components/Post'
import CommentForm from '../../components/CommentForm'
import Comment from '../../components/Comment'
import { prisma } from '../../server/db/client'
import axios from 'axios'


export default function Code({post, comments, sessionUser}){
    const { data: session } = useSession()
    const [postComments, setPostComments] = useState(comments)

    console.log("selected post", post)
    console.log("selected post comments", comments)

    useEffect(() => {
        setPostComments(comments)
    }, [comments])

    const handleSubmit =  async (payload) => {
        if(!session){
            signIn()
        } else {
            payload.postId = post.id
            console.log("payload", payload)
            const res = await axios.post('/api/comments', payload)
            console.log('RES DATA', res.data)
            setPostComments([...comments, res.data])
        }
    }

    const handleLike = async (postId) => {
        console.log('session', session)
        if(!session){
            signIn()
        } else {
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
        <>
           <Post
            onComment={() => console.log("comment")}
            onLike={() => handleLike(post.id)}
            onShare={() => console.log("share")}
            liked={checkLike(post)}
            post={post}
            user={post.user}
            className="max-w-2xl mx-auto px-6 my-6"
           />

            <div className="max-w-2xl mx-auto my-6 border-t border-gray-600">
                {
                    session && (
                        <CommentForm 
                            onSubmit={handleSubmit}
                            user={session.user}
                            className="px-6 my-6"
                        />  
                    )
                }
                <ul>
                    {
                        postComments.map(comment => (
                            <li key={comment.id} className="my-6 border-t border-gray-600 pt-6">
                                <Comment
                                    comment={comment}
                                    user={comment.user}
                                    className="px-6"
                                />
                            </li>
                        ))
                    }
                </ul>
           </div>
        </>
    )
}

export async function getServerSideProps(context){
    const session = await unstable_getServerSession(context.req, context.res, authOptions)
    const { id } = context.query

    let sessionUser = null
    if(session){
        sessionUser = await prisma.user.findUnique({
        where: {
            email: session.user.email 
        }
        })
    }


    
    const post = await prisma.post.findUnique({
        where: {
          id: parseInt(id),
        },
        include: {
            user: true,
            Comment: true,
            Like: true
        }
    })

    const comments = await prisma.comment.findMany({
        where: {
            postId: post.id
        },
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            user: true
        }
    })

    return{
        props: {
            post: JSON.parse(JSON.stringify(post)),
            comments: JSON.parse(JSON.stringify(comments)),
            session,
            sessionUser
        }
    }
}