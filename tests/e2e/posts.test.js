import assert from 'node:assert/strict'
import { after, before, beforeEach, describe, it } from 'node:test'
import request from 'supertest'
import { createApp } from '../../src/app.js'
import { insertPost } from '../../src/repositories/post-repository.js'
import { closePool, createPostFixture, truncatePosts } from '../helpers/db.js'

describe('posts API (e2e)', () => {
  const app = createApp()

  before(() => {
    process.env.API_KEY = 'test-secret-key'
  })

  beforeEach(async () => {
    await truncatePosts()
  })

  after(async () => {
    await truncatePosts()
    await closePool()
  })

  it('GET /posts returns an empty list when there are no published posts', async () => {
    const response = await request(app).get('/posts').expect(200)

    assert.deepEqual(response.body, { data: [] })
  })

  it('GET /posts returns only published and approved posts', async () => {
    const draft = createPostFixture({ id: 'e2e-draft-01' })
    const published = createPostFixture({ id: 'e2e-published-01' })

    await insertPost(draft)
    await insertPost(published)

    await request(app).patch(`/posts/${published.id}/approve`).expect(200)

    const response = await request(app).get('/posts').expect(200)

    assert.equal(response.body.data.length, 1)
    assert.equal(response.body.data[0].id, published.id)
  })

  it('GET /posts/:id returns a published post', async () => {
    const post = createPostFixture({ id: 'e2e-get-by-id-01' })

    await insertPost(post)
    await request(app).patch(`/posts/${post.id}/approve`).expect(200)

    const response = await request(app).get(`/posts/${post.id}`).expect(200)

    assert.equal(response.body.data.id, post.id)
    assert.equal(response.body.data.title, post.title)
  })

  it('GET /posts/:id returns 404 for a draft post', async () => {
    const draft = createPostFixture({ id: 'e2e-draft-404' })
    await insertPost(draft)

    const response = await request(app).get(`/posts/${draft.id}`).expect(404)

    assert.deepEqual(response.body, { message: 'Post not found' })
  })

  it('PATCH /posts/:id/approve publishes a draft', async () => {
    const draft = createPostFixture({ id: 'e2e-approve-01' })
    await insertPost(draft)

    const response = await request(app)
      .patch(`/posts/${draft.id}/approve`)
      .expect(200)

    assert.equal(response.body.data.id, draft.id)
    assert.ok(response.body.data.approved_at)
    assert.ok(response.body.data.published_at)
  })

  it('DELETE /posts/:id/reject rejects a post', async () => {
    const post = createPostFixture({ id: 'e2e-reject-01' })
    await insertPost(post)
    await request(app).patch(`/posts/${post.id}/approve`).expect(200)

    const response = await request(app)
      .delete(`/posts/${post.id}/reject`)
      .expect(200)

    assert.ok(response.body.data.rejected_at)
    assert.equal(response.body.data.approved_at, null)
    assert.equal(response.body.data.published_at, null)
  })

  it('GET /posts?include=all returns 403 without API key', async () => {
    const response = await request(app).get('/posts?include=all').expect(403)

    assert.deepEqual(response.body, { message: 'Forbidden' })
  })

  it('GET /posts?include=all returns all posts with a valid API key', async () => {
    const draft = createPostFixture({ id: 'e2e-admin-draft' })
    await insertPost(draft)

    const response = await request(app)
      .get('/posts?include=all')
      .set('Authorization', 'Bearer test-secret-key')
      .expect(200)

    assert.equal(response.body.data.length, 1)
    assert.equal(response.body.data[0].id, draft.id)
  })

  it('returns 404 for unknown routes', async () => {
    const response = await request(app).get('/unknown-route').expect(404)

    assert.deepEqual(response.body, { message: 'Not Found' })
  })
})
