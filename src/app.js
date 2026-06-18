import http from 'node:http'
import { createRouter } from './http/router.js'
import { registerPostRoutes } from './routes/posts.js'

export function createApp(options = {}) {
  const router = createRouter()
  registerPostRoutes(router, options)

  return http.createServer((req, res) => {
    router.dispatch(req, res)
  })
}
