import assert from 'node:assert/strict'
import { after, beforeEach, describe, it } from 'node:test'
import request from 'supertest'
import { createApp } from '../../src/app.js'
import { closePool, truncatePosts } from '../helpers/db.js'

async function createPostDraftStub(idea) {
  return {
    id: 'e2e-draft-from-stub',
    title: `Title: ${idea}`,
    content: `# ${idea}`,
    published_at: null,
    created_at: new Date().toISOString(),
    approved_at: null,
    rejected_at: null,
  }
}

describe('POST /posts/draft (e2e)', () => {
  const app = createApp({ createPostDraft: createPostDraftStub })

  beforeEach(async () => {
    await truncatePosts()
  })

  after(async () => {
    await truncatePosts()
    await closePool()
  })

  it('creates a draft post from the request body', async () => {
    const response = await request(app)
      .post('/posts/draft')
      .send({ idea: 'Node.js testing with supertest' })
      .expect(201)

    assert.equal(response.body.data.id, 'e2e-draft-from-stub')
    assert.equal(
      response.body.data.title,
      'Title: Node.js testing with supertest',
    )
    assert.equal(response.body.data.content, '# Node.js testing with supertest')
    assert.equal(response.body.data.published_at, null)
    assert.equal(response.body.data.approved_at, null)
  })
})
