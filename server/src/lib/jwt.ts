import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET as string
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in .env")
}

export type SessionPayload = {
  userId: string
}

export function signSessionToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]
  })
}

export function verifySessionToken(token: string): SessionPayload {
  return jwt.verify(token, JWT_SECRET) as SessionPayload
}
