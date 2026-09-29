import {Router} from "express"
import {z} from "zod"
import {prisma} from "../lib/prisma.js"
import {requireAuth} from "../middleware/requireAuth.js"

const router = Router()

const listQuerySchema = z.object({
  tmdbId: z.coerce.number().int(),
  mediaType: z.enum(["movie", "tv"])
})

router.get("/", async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    return res.status(400).json({error: "tmdbId and mediaType are required"})
  }

  const comments = await prisma.comment.findMany({
    where: {tmdbId: parsed.data.tmdbId, mediaType: parsed.data.mediaType},
    orderBy: {createdAt: "desc"},
    include: {
      user: {select: {id: true, name: true, avatarUrl: true}}
    }
  })

  res.json({comments})
})

const createSchema = z.object({
  tmdbId: z.coerce.number().int(),
  mediaType: z.enum(["movie", "tv"]),
  text: z.string().min(1).max(2000)
})

router.post("/", requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({error: parsed.error.flatten()})
  }

  const comment = await prisma.comment.create({
    data: {...parsed.data, userId: req.userId!},
    include: {
      user: {select: {id: true, name: true, avatarUrl: true}}
    }
  })

  res.status(201).json({comment})
})

const idParamSchema = z.object({
  id: z.string().min(1)
})

router.delete("/:id", requireAuth, async (req, res) => {
  const parsedParams = idParamSchema.safeParse(req.params)
  if (!parsedParams.success) {
    return res.status(400).json({error: "Invalid comment id"})
  }
  const {id} = parsedParams.data

  const comment = await prisma.comment.findUnique({where: {id}})

  if (!comment) {
    return res.status(404).json({error: "Comment not found"})
  }
  if (comment.userId !== req.userId) {
    return res
      .status(403)
      .json({error: "You can only delete your own comments"})
  }

  await prisma.comment.delete({where: {id}})
  res.json({ok: true})
})

export default router
