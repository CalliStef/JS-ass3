import { prisma } from '../../server/db/client'

import { unstable_getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]"
import { resolve } from 'styled-jsx/css'

export default async function like(req, res) {
    console.log("HELOO")
    const session = await unstable_getServerSession(req, res, authOptions)
    const { postId } = req.body
  
    if(!session){
      res.status(401).json({ error: 'Unauthorized' })
      return
    }
  
    const prismaUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    })
  
    if(!prismaUser){
      res.status(401).json({error: 'Unauthorized'})
      return
    } 

   
    if(prismaUser && postId){
        const likeEntity = await prisma.like.findFirst({
            where: {postId: postId, userId: prismaUser.id}
        })

        if(likeEntity){ 
            const dislike = await prisma.like.delete({
                where: {
                  id: likeEntity.id
                }
            })
            await prisma.post.update({
                where: {
                    id: postId
                },
                data: {
                    totalLikes: { decrement: 1 }
                }
            })
            res.status(202).json("dislike")
        } else {
            const like = await prisma.like.create({
                data: {
                    userId: prismaUser.id,
                    postId: postId
                }
            })
            await prisma.post.update({
                where: {
                    id: postId
                },
                data: {
                    totalLikes: { increment: 1 }
                }
            })
            res.status(201).json("like")
        }
       
    } else {
      console.log("error ", req.body)
    }
}
  