import {Router} from "express"
import {z} from "zod"
import {prisma} from "../lib/prisma.js"
import {requireAuth} from "../middleware/requireAuth.js"

const router = Router()

router.use(requireAuth)

router.get("/", async (req, res) => {
  const favorites = await prisma.favorite.findMany({
    where: {userId: req.userId},
    orderBy: {createdAt: "desc"}
  })
  res.json({favorites})
})

const addFavoriteSchema = z.object({
  tmdbId: z.coerce.number().int(),
  mediaType: z.enum(["movie", "tv"]),
  title: z.string().min(1),
  posterPath: z.string().nullable().optional(),
  releaseDate: z.string().nullable().optional(),
  voteAverage: z.coerce.number().nullable().optional(),
  genreIds: z.array(z.coerce.number().int()).optional().default([])
})

router.post("/", async (req, res) => {
  const parsed = addFavoriteSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({error: parsed.error.flatten()})
  }

  try {
    const favorite = await prisma.favorite.upsert({
      where: {
        userId_tmdbId_mediaType: {
          userId: req.userId!,
          tmdbId: parsed.data.tmdbId,
          mediaType: parsed.data.mediaType
        }
      },
      update: {},
      create: {...parsed.data, userId: req.userId!}
    })
    res.status(201).json({favorite})
  } catch (err) {
    console.error("Add favorite error:", err)
    res.status(500).json({error: "Failed to add favorite"})
  }
})

const deleteParamsSchema = z.object({
  mediaType: z.enum(["movie", "tv"]),
  tmdbId: z.coerce.number().int()
})

router.delete("/:mediaType/:tmdbId", async (req, res) => {
  const parsed = deleteParamsSchema.safeParse(req.params)
  if (!parsed.success) {
    return res.status(400).json({error: "Invalid parameters"})
  }

  await prisma.favorite.deleteMany({
    where: {
      userId: req.userId,
      mediaType: parsed.data.mediaType,
      tmdbId: parsed.data.tmdbId
    }
  })

  res.json({ok: true})
})

export default router
