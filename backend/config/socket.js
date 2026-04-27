export function initSocket(io) {
    io.on('connection', (socket) => {
        console.log('User connected to socket');
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
}