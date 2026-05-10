import jwt from 'jsonwebtoken';

export function initSocket(io) {
    io.use((socket, next) => {
        try {
            const cookieHeader = socket.handshake.headers.cookie || '';
            const tokenCookie = cookieHeader
                .split('; ')
                .find(c => c.startsWith('token='));
            const token = tokenCookie?.split('=')[1]
                || socket.handshake.auth?.token
                || socket.handshake.headers.authorization?.replace(/^Bearer\s+/i, '');
            if (token) {
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
        socket.on('join:order', async (orderId) => {
            if (!socket.user?.userId) return;
            try {
                const Order = (await import('../models/Order.js')).default;
                const order = await Order.findById(orderId).lean();
                if (!order) return;
                const userId = socket.user.userId.toString();
                const isCustomer = order.customer.toString() === userId;
                const isArtisan = order.items.some(i => i.artisan?.toString() === userId);
                const isAdmin = socket.user.role === 'admin';
                if (isCustomer || isArtisan || isAdmin) {
                    socket.join(`order:${orderId}`);
                }
            } catch {
            }
        });
        socket.on('send:message', (data) => {
            io.to(`customization:${data.customizationId}`).emit('receive:message', {
                ...data,
                timestamp: new Date(),
            });
            if (data.recipientId) {
                const senderName = data.senderName || '\u0627\u0644\u0645\u0631\u0633\u0644';
                const preview = data.preview ? `: ${data.preview}` : '';
                io.to(`user:${data.recipientId}`).emit('notification:new', {
                    type: 'message',
                    title: '\u0631\u0633\u0627\u0644\u0629 \u062e\u0627\u0635\u0629 \u062c\u062f\u064a\u062f\u0629',
                    body: `${senderName} \u0623\u0631\u0633\u0644 \u0644\u0643 \u0631\u0633\u0627\u0644\u0629 \u062e\u0627\u0635\u0629${preview}`,
                    link: `/customizations?request=${data.customizationId}`,
                    data: {
                        requestId: data.customizationId,
                        senderId: data.senderId,
                        senderName,
                        kind: 'private_message',
                    },
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
