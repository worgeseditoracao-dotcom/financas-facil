import crypto from 'crypto'

const SALT = 'financas-facil-auth-salt-2024'
const SESSION_COOKIE = 'ff_session'
const SESSION_SECRET = 'financas-facil-session-secret-2024'

export function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, SALT, 1000, 64, 'sha512').toString('hex')
}

export function verifyPassword(password: string, hash: string): boolean {
  return crypto.pbkdf2Sync(password, SALT, 1000, 64, 'sha512').toString('hex') === hash
}

export function createSessionToken(userId: string): string {
  const payload = `${userId}:${Date.now()}:${crypto.randomBytes(16).toString('hex')}`
  const hmac = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex')
  return Buffer.from(`${payload}:${hmac}`).toString('base64url')
}

export function verifySessionToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8')
    const parts = decoded.split(':')
    if (parts.length < 4) return null
    const hmac = parts.pop()
    const payload = parts.join(':')
    const expected = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex')
    if (hmac !== expected) return null
    return parts[0]
  } catch {
    return null
  }
}

export const VALID_PAYMENT_STATUSES = ['paid', 'approved', 'completed', 'payment_approved']

export function isPaymentApproved(status: string): boolean {
  return VALID_PAYMENT_STATUSES.includes(status.toLowerCase())
}
