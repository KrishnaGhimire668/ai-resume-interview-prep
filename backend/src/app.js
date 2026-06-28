const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

app.use(express.json())
app.use(cookieParser())

app.use(cors({
  origin: "https://career-ai-web-3a4v.onrender.com",
  credentials: true,
  // Allows your decoupled frontend to read file headers like file names and sizes
  exposedHeaders: ["Content-Disposition"] 
}))

const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

module.exports = app