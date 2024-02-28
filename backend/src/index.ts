import { Hono } from 'hono'
const app = new Hono().basePath('/api/v1')

import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'



// routing
app.get('/', (c) => {
  return c.json({
    message: 'Hello, World!'
  })
})

app.post('/user/signup', (c) => {
  return c.json({
    message: 'User signup'
  })
})

app.post('/user/signin', (c) => {
  return c.json({
    message: 'User signin'
  })
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

// any wrong route
app.get('*', (c) => {
  return c.json({ message: 'this may not be what you are finding' }, 404)
})


export default app