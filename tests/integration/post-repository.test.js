import assert from 'node:assert/strict'
import { after, beforeEach, describe, it } from 'node:test'
import {
  approvePostById,
  findAllPosts,
  findAllPublishedAndApprovedPosts,
  findPostById,
  insertPost,
  rejectPostById,
} from '../../src/repositories/post-repository.js'
import { closePool, createPostFixture, truncatePosts } from '../helpers/db.js'

describe('post-repository', () => {
  beforeEach(async () => {
    await truncatePosts()
  })

  after(async () => {
    await truncatePosts()
    await closePool()
  })

  it('inserts and finds a draft post by id only when published', async () => {
    const draft = createPostFixture()
    await insertPost(draft)

    const notPublished = await findPostById(draft.id)
    assert.equal(notPublished, null)

    await approvePostById(draft.id)
    const published = await findPostById(draft.id)

    assert.equal(published.id, draft.id)
    assert.equal(published.title, draft.title)
    assert.ok(published.approved_at)
    assert.ok(published.published_at)
  })

  it('lists only published and approved posts', async () => {
    const draft = createPostFixture({ id: 'draft-post-01' })
    const approved = createPostFixture({ id: 'approved-post-01' })

    await insertPost(draft)
    await insertPost(approved)
    await approvePostById(approved.id)

    const publishedPosts = await findAllPublishedAndApprovedPosts()

    assert.equal(publishedPosts.length, 1)
    assert.equal(publishedPosts[0].id, approved.id)
  })

  it('lists all posts including drafts', async () => {
    const draft = createPostFixture({ id: 'draft-post-02' })
    const approved = createPostFixture({ id: 'approved-post-02' })

    await insertPost(draft)
    await insertPost(approved)
    await approvePostById(approved.id)

    const allPosts = await findAllPosts()

    assert.equal(allPosts.length, 2)
  })

  it('rejects a post and removes it from published listings', async () => {
    const post = createPostFixture({ id: 'reject-post-01' })

    await insertPost(post)
    await approvePostById(post.id)

    const rejected = await rejectPostById(post.id)

    assert.ok(rejected.rejected_at)
    assert.equal(rejected.approved_at, null)
    assert.equal(rejected.published_at, null)

    const publishedPosts = await findAllPublishedAndApprovedPosts()
    assert.equal(publishedPosts.length, 0)
  })

  it('returns null when approving or rejecting a non-existent post', async () => {
    const approved = await approvePostById('missing-id')
    const rejected = await rejectPostById('missing-id')

    assert.equal(approved, null)
    assert.equal(rejected, null)
  })
})
