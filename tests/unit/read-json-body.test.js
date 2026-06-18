import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { describe, it } from 'node:test'
import { readJsonBody } from '../../src/http/read-json-body.js'

function createMockRequest(body) {
  const req = new EventEmitter()

  queueMicrotask(() => {
    if (body !== undefined && body !== null) {
      req.emit('data', Buffer.from(body))
    }

    req.emit('end')
  })

  return req
}

describe('readJsonBody', () => {
  it('parses a valid JSON body', async () => {
    const req = createMockRequest('{"idea":"test idea"}')

    const body = await readJsonBody(req)

    assert.deepEqual(body, { idea: 'test idea' })
  })

  it('resolves null for an empty body', async () => {
    const req = createMockRequest('')

    const body = await readJsonBody(req)

    assert.equal(body, null)
  })

  it('rejects invalid JSON', async () => {
    const req = createMockRequest('{ invalid json')

    await assert.rejects(() => readJsonBody(req), SyntaxError)
  })
})
