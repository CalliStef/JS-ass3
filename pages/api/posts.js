// pages/api/posts.js
import { prisma } from '../../server/db/client'

import { unstable_getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]"
import { comment } from 'postcss'


async function post(req, res){
    const session = await unstable_getServerSession(req, res, authOptions)

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

    const { language, code } = req.body
    if(language && code){
      const post = await prisma.post.create({
        data: {
          language,
          code,
          userId: prismaUser.id,
        },
      })
      res.status(201).json(post)
    } else{
      console.log("error ", req.body)
    }
    // const title = titleFromCode(JSON.stringify(code))
    
}



export default async function handle(req, res) {
  const { method } = req

  switch (method) {
    case 'POST':
      // get the title and content from the request body
      // const { title, content } = req.body
      // use prisma to create a new post using that data
      post(req,res)
      break
    default:
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}