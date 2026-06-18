import http from 'node:http'
import { createRouter } from './http/router.js'
import { registerPostRoutes } from './routes/posts.js'

const { API_PORT, API_HOST, API_PROTOCOL } = process.env

const router = createRouter()
registerPostRoutes(router)

const server = http.createServer((req, res) => {
  router.dispatch(req, res)
})

server.listen(API_PORT, API_HOST, () => {
  console.log(`Server running on ${API_PROTOCOL}://${API_HOST}:${API_PORT}`)
  console.log('Press CTRL+C to stop')
})
