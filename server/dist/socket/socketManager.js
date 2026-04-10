import { Server as SocketServer } from 'socket.io';
let io;
export const initSocket = (server) => {
    io = new SocketServer(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });
    io.on('connection', (socket) => {
        console.log('🔌 Socket: Client connected', socket.id);
        socket.on('join_business', (businessId) => {
            socket.join(String(businessId));
            console.log(`📡 Socket: Client joined business room ${businessId}`);
        });
        socket.on('disconnect', () => {
            console.log('🔌 Socket: Client disconnected');
        });
    });
    return io;
};
export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
/**
 * Emit a typed event to a specific business room
 */
export const emitToBusiness = (businessId, event, data) => {
    if (io) {
        io.to(String(businessId)).emit(event, data);
    }
};
