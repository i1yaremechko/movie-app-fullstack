import {Router} from "express"
import {z} from "zod"
import {prisma} from "../lib/prisma.js"
import {verifySessionToken} from "../lib/jwt.js"

const router = Router()

const feedbackSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  message: z.string().min(1).max(2000)
})

router.post("/", async (req, res) => {
  const parsed = feedbackSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({error: parsed.error.flatten()})
  }

  let userId: string | undefined
  const token = req.cookies?.[process.env.COOKIE_NAME || "session"]
  if (token) {
    try {
      userId = verifySessionToken(token).userId
    } catch {}
  }

  const feedback = await prisma.feedback.create({
    data: {...parsed.data, userId}
  })

  res.status(201).json({feedback})
})

export default router
