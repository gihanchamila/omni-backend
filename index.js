import http from 'http'
import app from './app.js'
import { initializeSocket } from './utils/socket.js'
import { port } from "./config/kyes.js"

// Ceate server
const server = http.createServer(app)

// Initialize Socket.io
initializeSocket(server);

// Listen server
// This is used for online server

// server.listen(process.env.PORT || 8080, () => console.log(`Server is running on port ${port}`))

// This is used for localhost
