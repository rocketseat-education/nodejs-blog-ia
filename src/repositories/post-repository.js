import { pool } from '../database/pool.js'

function mapRowToPost(row) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    published_at: row.published_at?.toISOString() ?? null,
    created_at: row.created_at.toISOString(),
    approved_at: row.approved_at?.toISOString() ?? null,
    rejected_at: row.rejected_at?.toISOString() ?? null,
  }
}

export async function findAllPosts() {
  const { rows } = await pool.query(
    'SELECT id, title, content, published_at, created_at, approved_at, rejected_at FROM posts ORDER BY published_at DESC',
  )

  return rows.map(mapRowToPost)
}

export async function findPostById(id) {
  const { rows } = await pool.query(
    'SELECT id, title, content, published_at, created_at, approved_at, rejected_at FROM posts WHERE id = $1',
    [id],
  )

  return mapRowToPost(rows[0])
}

export async function insertPost(post) {
  const { rows } = await pool.query(
    `INSERT INTO posts (id, title, content, published_at, created_at, approved_at, rejected_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, title, content, published_at, created_at, approved_at, rejected_at`,
    [
      post.id,
      post.title,
      post.content,
      post.published_at,
      post.created_at,
      post.approved_at,
      post.rejected_at,
    ],
  )

  return mapRowToPost(rows[0])
}
