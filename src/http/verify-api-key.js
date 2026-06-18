import { timingSafeEqual } from 'node:crypto'

export function isValidApiKey(req) {
  const apiKey = process.env.API_KEY

  if (!apiKey) {
    return false
  }

  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return false
  }

  const token = authHeader.slice(7)

  if (token.length !== apiKey.length) {
    return false
  }

  // Prevent timing attacks by comparing the tokens in constant time
  return timingSafeEqual(Buffer.from(token), Buffer.from(apiKey))
}
