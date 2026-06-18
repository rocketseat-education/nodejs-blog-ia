import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import request from 'supertest'
import { createApp } from '../../src/app.js'

describe('swagger API (e2e)', () => {
  const app = createApp()

  it('GET /api/docs/json returns the OpenAPI specification', async () => {
    const response = await request(app).get('/api/docs/json').expect(200)

    assert.equal(response.headers['content-type'], 'application/json')
    assert.equal(response.body.openapi, '3.0.3')
    assert.equal(response.body.info.title, 'Rocketseat Blog IA API')
    assert.ok(response.body.paths['/posts'])
    assert.ok(response.body.paths['/posts/draft'])
    assert.ok(response.body.paths['/posts/{id}/approve'])
    assert.ok(response.body.paths['/posts/{id}/reject'])
  })

  it('GET /api/docs returns Swagger UI HTML', async () => {
    const response = await request(app).get('/api/docs').expect(200)

    assert.match(response.headers['content-type'], /^text\/html/)
    assert.match(response.text, /swagger-ui/)
    assert.match(response.text, /\/api\/docs\/json/)
  })
})
