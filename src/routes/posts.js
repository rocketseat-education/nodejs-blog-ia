import {
  findAllPublishedAndApprovedPosts,
  insertPost,
  findPostById,
  approvePostById,
} from '../repositories/post-repository.js'
import { createPostDraft } from '../services/create-post-draft.js'
import { readJsonBody } from '../http/read-json-body.js'

export function registerPostRoutes(router) {
  router.get('/posts', async (_req, res) => {
    const posts = await findAllPublishedAndApprovedPosts()
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ data: posts }))
  })

  router.get('/posts/:id', async (req, res) => {
    const post = await findPostById(req.params.id)
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
