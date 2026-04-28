import jwt from 'jsonwebtoken';

export function initSocket(io) {
    io.use((socket, next) => {
        try {
            const cookieHeader = socket.handshake.headers.cookie || '';
            const tokenCookie = cookieHeader
                .split('; ')
                .find(c => c.startsWith('token='));
            if (tokenCookie) {
                const token = tokenCookie.split('=')[1];
                socket.user = jwt.verify(token, process.env.JWT_SECRET);
            }
        } catch {
        }
        next();
    });

    io.on('connection', (socket) => {
        if (socket.user?.userId) {
            socket.join(`user:${socket.user.userId}`);
            console.log(`User ${socket.user.userId} connected to socket`);
        }
        socket.on('join:customization', (requestId) => {
            socket.join(`customization:${requestId}`);
        });
        socket.on('leave:customization', (requestId) => {
            socket.leave(`customization:${requestId}`);
        });
        socket.on('join:order', (orderId) => {
            socket.join(`order:${orderId}`);
        });
        socket.on('send:message', (data) => {
            io.to(`customization:${data.customizationId}`).emit('receive:message', {
                ...data,
                timestamp: new Date(),
            });
            if (data.recipientId) {
                io.to(`user:${data.recipientId}`).emit('notification:new', {
                    type: 'message',
                    title: 'New message',
                    body: data.preview || 'You have a new message',
                    link: `/dashboard/customizations/${data.customizationId}`,
                });
            }
        });
        socket.on('typing:start', (customizationId) => {
            socket.to(`customization:${customizationId}`).emit('typing:update', { isTyping: true });
        });
        socket.on('typing:stop', (customizationId) => {
            socket.to(`customization:${customizationId}`).emit('typing:update', { isTyping: false });
        });
        socket.on('disconnect', () => {
            if (socket.user?.userId) {
                console.log(`User ${socket.user.userId} disconnected`);
            }
        });
    });
}