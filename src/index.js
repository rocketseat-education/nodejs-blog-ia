import http from 'node:http'
import {
  findAllPosts,
  insertPost,
  findPostById,
} from './repositories/post-repository.js'
import { createPostDraft } from './services/create-post-draft.js'

const { API_PORT, API_HOST, API_PROTOCOL } = process.env

// Req = Request (Requisição)
// Res = Response (Resposta)
const server = http.createServer(async (req, res) => {
  const { url, method } = req
  const paths = url.split('?').filter(Boolean)
  const path = paths.at(0) || '/'

  if (path === '/posts' && method === 'GET') {
    const posts = await findAllPosts()
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ data: posts }))

    return
  }

  const postByIdMatch = path.match(/^\/posts\/([^/]+)$/)
  if (postByIdMatch && method === 'GET') {
    const postId = postByIdMatch[1]
    const post = await findPostById(postId)
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ data: post }))

    return
  }

  if (path === '/posts/draft' && method === 'POST') {
    const bodyBuffer = []
    let body = null

    // Armazena o corpo da requisição em um array
    req.on('data', (chunk) => bodyBuffer.push(chunk))
    req.on('end', async () => {
      try {
        const bodyString = Buffer.concat(bodyBuffer).toString()
        body = JSON.parse(bodyString)

        const draft = await createPostDraft(body.idea)
        const post = await insertPost(draft)

        res.writeHead(201, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ data: post }))
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ message: error.message }))
      }
    })

    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  return res.end(JSON.stringify({ message: 'Not Found' }))
})

server.listen(API_PORT, API_HOST, () => {
  console.log(`Server running on ${API_PROTOCOL}://${API_HOST}:${API_PORT}`)
  console.log('Press CTRL+C to stop')
})
