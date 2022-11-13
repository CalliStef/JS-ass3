import { unstable_getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]"
import { useSession, signIn, signOut } from "next-auth/react"
import PostSmall from '../components/PostSmall'
import Comment from '../components/Comment'
import Button from '../components/Button'

export default function Profile({sessionUser, posts, comments}) {
  const { data: session } = useSession()
  console.log("HELLO", hello)
  console.log("session", session, sessionUser, posts, comments)
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

  if (session) {
    return (
      <div className="pt-8 pb-10 lg:pt-12 lg:pb-14 mx-auto max-w-7xl px-2">
        <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-100"> {session.user.name}</h1>
        <img src={session.user.image}></img> <br />
        <h2>{session.user.name}</h2><br />
        <p> {session.user.email} </p> <br />
        <Button onClick={() => signOut()}>Sign out</Button>
        <br />
        
        <h2>Recent Posts</h2>
        <ul className="mt-8">
            {posts.map((post) => (

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

    <br />
        <h2>Recent Comments</h2>
        <ul>
            {
                comments.map(comment => (
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

      </div>
    )
  }
  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </>
  )
}

export async function getServerSideProps(context){
    const session = await unstable_getServerSession(context.req, context.res, authOptions)
    console.log("session1", session)
    if(!session){
        // redirect to login page

        return {
            redirect: {
                destination: "/api/auth/signin",
                permanent: false,
            },
        }
    }

    const sessionUser = await prisma.user.findUnique({
      where: {
        email: session.user.email 
      }
    })
    console.log("session2", sessionUser)
    const posts = await prisma.post.findMany({
      where: {
        userId: sessionUser.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: true,
        Like: true
      }
    })
    console.log("session3", posts)
    const comments = await prisma.comment.findMany({
      where: {
         userId: sessionUser.id
      },
      orderBy: {
          createdAt: 'desc'
      },
      include: {
          user: true
      }
    })
    console.log("session4", comments)
    return{
        props: {
            session,
            sessionUser,
            posts: JSON.parse(JSON.stringify(posts)),
            comments: JSON.parse(JSON.stringify(comments))
        },
    }
}