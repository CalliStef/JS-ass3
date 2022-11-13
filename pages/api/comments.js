import { prisma } from '../../server/db/client'

import { unstable_getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]"

async function comment(req, res){
    const session = await unstable_getServerSession(req, res, authOptions)
    const { comment: content, postId } = req.body
  
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

    
  
   
    if(content && postId){
      const comment = await prisma.comment.create({
        data: {
          content,
          userId: prismaUser.id,
          postId: postId
        },
        include: {
            user: true
        }
      })
      if(comment){
        await prisma.post.update({
            where: {
                id: postId
            },
            data: {
                totalComments: { increment: 1 }
            }
        })
      }
      res.status(201).json(comment)
    } else {
      console.log("error ", req.body)
    }
  
  
  }


export default async function handle(req, res) {
const { method } = req

switch (method) {
    case 'POST':
    // get the title and content from the request body
    // const { title, content } = req.body
    // use prisma to create a new post using that data
    comment(req,res)
    break
    default:
    res.status(405).end(`Method ${method} Not Allowed`)
}
}
  