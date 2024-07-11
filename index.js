import http from "http"
import app from "./app"
import { port } from "./config/kyes"

// create server
const server = http.createServer(app)

// listen server
app.listen(port, () => console.log(` server is running on port ${port}`))
