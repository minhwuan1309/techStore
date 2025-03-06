const express = require("express")
require("dotenv").config()
const http = require("http")
const dbConnect = require("./config/dbconnect")
const initRoutes = require("./routes")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()
const server = http.createServer(app) // Tạo server HTTP để tích hợp với WebSocket

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ["POST", "PUT", "GET", "DELETE"],
    credentials: true,
}))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

dbConnect()

initRoutes(app)


// Khởi động server
const port = process.env.PORT || 8888
server.listen(port, () => {
    console.log("Server đang chạy trên cổng: " + port)
})
