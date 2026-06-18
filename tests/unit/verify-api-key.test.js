import assert from 'node:assert/strict'
import { describe, it, beforeEach, afterEach } from 'node:test'
import { isValidApiKey } from '../../src/http/verify-api-key.js'

describe('isValidApiKey', () => {
  const originalApiKey = process.env.API_KEY

  beforeEach(() => {
    process.env.API_KEY = 'test-secret-key'
  })

  afterEach(() => {
    if (originalApiKey === undefined) {
      delete process.env.API_KEY
    } else {
      process.env.API_KEY = originalApiKey
    }
  })

  it('returns true for a valid Bearer token', () => {
    const req = {
      headers: {
        authorization: 'Bearer test-secret-key',
      },
    }

    assert.equal(isValidApiKey(req), true)
  })

  it('returns false when API_KEY is not configured', () => {
    delete process.env.API_KEY

    const req = {
      headers: {
        authorization: 'Bearer test-secret-key',
      },
    }

    assert.equal(isValidApiKey(req), false)
  })

  it('returns false when Authorization header is missing', () => {
    const req = { headers: {} }

    assert.equal(isValidApiKey(req), false)
  })

  it('returns false when Authorization header does not use Bearer scheme', () => {
    const req = {
      headers: {
        authorization: 'Basic test-secret-key',
      },
    }

    assert.equal(isValidApiKey(req), false)
  })

  it('returns false for an invalid token', () => {
    const req = {
      headers: {
        authorization: 'Bearer wrong-key',
      },
    }

    assert.equal(isValidApiKey(req), false)
  })
})
