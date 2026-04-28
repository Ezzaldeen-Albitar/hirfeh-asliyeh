export function initSocket(io) {
    io.on('connection', (socket) => {
        socket.on('join-user', (userId) => {
            socket.join(`user:${userId}`);
        });
        socket.on('join-chat', (requestId) => {
            socket.join(`customization:${requestId}`);
        });
    });
}
