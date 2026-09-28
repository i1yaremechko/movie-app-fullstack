import express from "express"
import cors from "cors"
import helmet from "helmet"

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

app.get("/api/health", (_req, res) => {
  res.json({status: "ok", time: new Date().toISOString()})
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
