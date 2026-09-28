import express from "express"
import cors from "cors"
import helmet from "helmet"
import {prisma} from "./lib/prisma.js"

const app = express()
const PORT = Number(process.env.PORT) || 5000

app.use(helmet())
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  })
)
app.use(express.json())

app.get("/api/health", async (_req, res) => {
  const users = await prisma.user.count()
  res.json({status: "ok", users})
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
