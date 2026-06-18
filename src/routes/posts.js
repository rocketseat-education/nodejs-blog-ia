import {
  findAllPublishedAndApprovedPosts,
  findAllPosts,
  insertPost,
  findPostById,
  approvePostById,
  rejectPostById,
} from '../repositories/post-repository.js'
import { createPostDraft } from '../services/create-post-draft.js'
import { readJsonBody } from '../http/read-json-body.js'
import { isValidApiKey } from '../http/verify-api-key.js'

export function registerPostRoutes(router) {
  router.get('/posts', async (req, res) => {
    const { searchParams } = new URL(req.url, 'http://localhost')

    if (searchParams.get('include') === 'all') {
      if (!isValidApiKey(req)) {
        res.writeHead(403, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ message: 'Forbidden' }))
        return
      }

      const posts = await findAllPosts()
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ data: posts }))
      return
    }

    const posts = await findAllPublishedAndApprovedPosts()
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ data: posts }))
  })

  router.get('/posts/:id', async (req, res) => {
    const post = await findPostById(req.params.id)

    if (!post) {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ message: 'Post not found' }))
      return
    }

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ data: post }))
  })

  router.patch('/posts/:id/approve', async (req, res) => {
    const post = await approvePostById(req.params.id)

    if (!post) {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ message: 'Post not found' }))
      return
    }

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ data: post }))
  })

  router.delete('/posts/:id/reject', async (req, res) => {
    const post = await rejectPostById(req.params.id)

    if (!post) {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ message: 'Post not found' }))
      return
    }

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ data: post }))
  })

  router.post('/posts/draft', async (req, res) => {
    try {
      const body = await readJsonBody(req)
      const draft = await createPostDraft(body.idea)
      const post = await insertPost(draft)

      res.writeHead(201, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ data: post }))
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ message: error.message }))
    }
  })
}
