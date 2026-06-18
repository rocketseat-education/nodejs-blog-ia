import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createRouter } from '../../src/http/router.js'
import { createMockResponse } from '../helpers/mock-response.js'

describe('createRouter', () => {
  it('dispatches a matching GET route', async () => {
    const router = createRouter()

    router.get('/hello', (req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ message: 'ok' }))
    })

    const req = { method: 'GET', url: '/hello' }
    const res = createMockResponse()

    await router.dispatch(req, res)

    assert.equal(res.statusCode, 200)
    assert.deepEqual(JSON.parse(res.body), { message: 'ok' })
  })

  it('extracts path params', async () => {
    const router = createRouter()
    let capturedParams

    router.get('/posts/:id', (req, res) => {
      capturedParams = req.params
      res.writeHead(200)
      res.end()
    })

    const req = { method: 'GET', url: '/posts/abc123' }
    const res = createMockResponse()

    await router.dispatch(req, res)

    assert.deepEqual(capturedParams, { id: 'abc123' })
  })

  it('ignores query string when matching routes', async () => {
    const router = createRouter()
    let matched = false

    router.get('/posts', (req, res) => {
      matched = true
      res.writeHead(200)
      res.end()
    })

    const req = { method: 'GET', url: '/posts?include=all' }
    const res = createMockResponse()

    await router.dispatch(req, res)

    assert.equal(matched, true)
  })

  it('returns 404 when no route matches', async () => {
    const router = createRouter()
    const req = { method: 'GET', url: '/unknown' }
    const res = createMockResponse()

    await router.dispatch(req, res)

    assert.equal(res.statusCode, 404)
    assert.deepEqual(JSON.parse(res.body), { message: 'Not Found' })
  })

  it('does not match routes with different HTTP methods', async () => {
    const router = createRouter()

    router.get('/posts', (req, res) => {
      res.writeHead(200)
      res.end()
    })

    const req = { method: 'POST', url: '/posts' }
    const res = createMockResponse()

    await router.dispatch(req, res)

    assert.equal(res.statusCode, 404)
  })
})
