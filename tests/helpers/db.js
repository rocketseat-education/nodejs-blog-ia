import { pool } from '../../src/database/pool.js'

export async function truncatePosts() {
  await pool.query('TRUNCATE TABLE posts')
}

export async function closePool() {
  await pool.end()
}

export function createPostFixture(overrides = {}) {
  const now = new Date().toISOString()

  return {
    id: 'test-post-id-01',
    title: 'Test Post Title',
    content: '# Test content',
    published_at: null,
    created_at: now,
    approved_at: null,
    rejected_at: null,
    ...overrides,
  }
}
