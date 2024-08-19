import http from 'http'
import app from './app.js'
import { Server } from 'socket.io'
import { port } from "./config/kyes.js"

// Ceate server
const server = http.createServer(app)

export const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Listen server
server.listen(port, () => console.log(`Server is running on port ${port}`))

