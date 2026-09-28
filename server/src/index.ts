import express from "express"
import cors from "cors"
import helmet from "helmet"
import cookieParser from "cookie-parser"
import path from "node:path"
import {fileURLToPath} from "node:url"
import {prisma} from "./lib/prisma.js"
import authRouter from "./routes/auth.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = Number(process.env.PORT) || 5000

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "https://accounts.google.com"],
        "script-src-elem": ["'self'", "https://accounts.google.com"],
        "frame-src": ["'self'", "https://accounts.google.com"],
        "connect-src": ["'self'", "https://accounts.google.com"]
      }
    }
  })
)
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  })
)
app.use(express.json())
app.use(cookieParser())

app.use(express.static(path.join(__dirname, "../public")))

app.get("/api/health", async (_req, res) => {
  const users = await prisma.user.count()
  res.json({status: "ok", users})
})

app.use("/api/auth", authRouter)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
