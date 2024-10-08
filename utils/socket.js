import { Server } from 'socket.io';
let io; 

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log(`A user connected with ID: ${socket.id}`);
        socket.on('clientToServer', (data) => {
            console.log('Received from client:', data);
    
            // Send a response back to the client
            socket.emit('serverToClient', { message: 'Hello from server!' });
        });
        socket.on('disconnect', () => {
            console.log(`User disconnected with ID: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
};