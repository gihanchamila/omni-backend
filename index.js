import http from 'http'
import app from './app.js'
import { port } from "./config/kyes.js"

// create server
const server = http.createServer(app)

// listen server
app.listen(port, () => console.log(`Server is running on port ${port}`))
