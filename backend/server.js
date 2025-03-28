const express = require("express")
require("dotenv").config()
const http = require("http")
const dbConnect = require("./config/dbconnect")
const initRoutes = require("./routes")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const initSocket = require("./config/socket") // Import your socket initialization
const app = express()
const server = http.createServer(app)

// CORS Configuration
const corsOptions = {
    origin: process.env.CLIENT_URL,
    methods: ["POST", "PUT", "GET", "DELETE"],
    credentials: true,
}

// Middleware
app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Initialize Socket.IO
initSocket(server)

dbConnect()
initRoutes(app)

// Start server
const port = process.env.PORT || 8888
server.listen(port, () => {
    console.log("Server đang chạy trên cổng: " + port)
})