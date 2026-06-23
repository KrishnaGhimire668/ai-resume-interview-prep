const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

app.use(express.json())
app.use(cookieParser())

//  CORS logic to  match  specific allowed frontend instances safely
const allowedOrigins = [
    "http://localhost:5173",
    "https://career-ai-web-3a4v.onrender.com"
]

app.use(cors({
    origin: function (origin, callback) {
        // Allows server-to-server or tools like Postman (where origin is undefined)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            return callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}))

const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

module.exports = app