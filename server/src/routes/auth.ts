import {Router} from "express"
import {OAuth2Client} from "google-auth-library"
import {z} from "zod"
import {prisma} from "../lib/prisma.js"
import {signSessionToken} from "../lib/jwt.js"
import {requireAuth} from "../middleware/requireAuth.js"

const router = Router()
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const COOKIE_NAME = process.env.COOKIE_NAME || "session"
const isProd = process.env.NODE_ENV === "production"

function setSessionCookie(res: import("express").Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 днів
  })
}

const googleAuthSchema = z.object({
  credential: z.string().min(1)
})

router.post("/google", async (req, res) => {
  const parsed = googleAuthSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({error: "credential is required"})
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: parsed.data.credential,
      audience: process.env.GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()
    if (!payload || !payload.sub) {
      return res.status(401).json({error: "Invalid Google token"})
    }

    const user = await prisma.user.upsert({
      where: {googleId: payload.sub},
      update: {
        email: payload.email,
        name: payload.name,
        avatarUrl: payload.picture
      },
      create: {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        avatarUrl: payload.picture
      }
    })

    const token = signSessionToken({userId: user.id})
    setSessionCookie(res, token)

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl
      }
    })
  } catch (err) {
    console.error("Google auth error:", err)
    res.status(401).json({error: "Google authentication failed"})
  }
})

router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {id: req.userId},
    select: {id: true, email: true, name: true, avatarUrl: true}
  })

  if (!user) {
    return res.status(404).json({error: "User not found"})
  }

  res.json({user})
})

router.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME)
  res.json({ok: true})
})

export default router
