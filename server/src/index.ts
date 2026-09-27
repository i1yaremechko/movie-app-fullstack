import express, {Request, Response} from "express"
import cors from "cors"
import dotenv from "dotenv"
// import prisma from "./prisma.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get("/api/health", (req: Request, res: Response) => {
  res.json({status: "Server is running with TypeScript!"})
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
