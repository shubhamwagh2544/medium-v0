import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { Hono } from 'hono'
import { sign, verify, decode, jwt } from 'hono/jwt'

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JWT_SECRET: string
  }
}>().basePath('/api/v1')
const prisma = new PrismaClient()


// middleware before routing to blogs
app.use('/blog/*', async (c, next) => {
  const header = c.req.header('Authorization')
  if (header || header?.startsWith('Bearer ')) {
    const token = header.split(' ')[1]
    const decoded = await verify(token, c.env.JWT_SECRET)
    if (decoded.id) {
      next()
    }
  }
  else {
    return c.json({
      message: 'Unauthorized'
    }, 401)
  }
})

// user signup
app.post('/user/signup', async (c) => {
  const prisma = new PrismaClient({datasourceUrl: c.env.DATABASE_URL}).$extends(withAccelerate())

  const body = await c.req.json()
  // check if user already exists
  const userexists = await prisma.user.findUnique({
    where: {
      email: body.email
    }
  })
  if (userexists) {
    return c.json({
      message: 'User already exists with this email. Please login'
    }, 400)
  }
  // save user to db
  const userresponse = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      password: body.password
    }
  })
  if (userresponse) {
    const token = await sign({id: userresponse.id}, c.env.JWT_SECRET)
    return c.json({
      message: 'User created successfully',
      jwt: `Bearer ${token}`
    }, 201)
  }
  else {
    return c.json({
      message: 'User not created'
    }, 500)
  }
})

// user signin
app.post('/user/signin', async (c) => {
  const prisma = new PrismaClient({datasourceUrl: c.env.DATABASE_URL}).$extends(withAccelerate())
  const body = await c.req.json()
  // check if user exists
  const userexists = await prisma.user.findUnique({
    where: {
      email: body.email
    }
  })
  if (!userexists) {
    return c.json({
      message: 'User does not exist. Please signup'
    }, 400)
  }
  // if user exists, send token
  const token = await sign({id: userexists.id}, c.env.JWT_SECRET)
  return c.json({
    message: 'User signed in successfully',
    jwt: `Bearer ${token}`
  }, 200)
})

app.post('/blog', (c) => {
  return c.json({
    message: 'Create blog'
  })
})

app.put('/blog', (c) => {
  return c.json({
    message: 'Update blog'
  })
})

app.get('/blog/:id', (c) => {
  return c.json({
    message: 'Get blog: ' + c.req.param('id')
  })
})

app.get('/blog/blogs', (c) => {
  return c.json({
    message: 'all blogs on server'
  })
})

// any wrong route
app.get('*', (c) => {
  return c.json({
    message: 'This might not be the page you are looking for:'
  }, 404)
})


export default app