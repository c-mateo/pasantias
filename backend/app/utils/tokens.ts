import crypto from 'node:crypto'
import { sha256 } from '#utils/hash'

export function generateToken() {
  const token = crypto.randomBytes(32).toString('base64url')
  const tokenHash = sha256(token)
  return { token, tokenHash }
}

export const TOKEN_EXPIRATION_MINUTES = 60 // default expiration
