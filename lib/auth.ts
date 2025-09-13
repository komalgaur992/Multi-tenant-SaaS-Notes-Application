import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = 'dhdYQ0QNwsQLlNvuHTnbMILSl3AAMfmwQoSURwfjq6I='

export interface JWTPayload {
  userId: string
  tenantId: string
  role: string
  email: string
  exp: number
}

export function generateToken(payload: Omit<JWTPayload, 'exp'>): string {
  return jwt.sign(
    { ...payload, exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) }, // 24 hours
    JWT_SECRET
  )
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}
