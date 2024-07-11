import http from 'http'
import app from './app.js'
import { port } from "./config/kyes.js"

// Ceate server
const server = http.createServer(app)

// Listen server
app.listen(port, () => console.log(`Server is running on port ${port}`))
