import type {Request, Response, NextFunction} from "express"
import {verifySessionToken} from "../lib/jwt.js"

declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[process.env.COOKIE_NAME || "session"]

  if (!token) {
    return res.status(401).json({error: "Not authenticated"})
  }

  try {
    const payload = verifySessionToken(token)
    req.userId = payload.userId
    next()
  } catch {
    return res.status(401).json({error: "Invalid or expired session"})
  }
}
