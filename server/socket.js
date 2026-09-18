import { Server } from 'socket.io';
import { verifyToken } from './auth.js';

const online = new Map(); // userId -> socket count

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: true, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Missing token'));
    try {
      socket.auth = verifyToken(token);
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.auth.id;
    const room = `user:${userId}`;
    socket.join(room);

    online.set(userId, (online.get(userId) || 0) + 1);
    io.emit('presence:update', [...online.keys()].map(Number));

    socket.on('typing:start', ({ to }) => {
      if (to) socket.to(`user:${to}`).emit('typing:start', { from: userId });
    });
    socket.on('typing:stop', ({ to }) => {
      if (to) socket.to(`user:${to}`).emit('typing:stop', { from: userId });
    });

    socket.on('disconnect', () => {
      const left = (online.get(userId) || 1) - 1;
      if (left <= 0) online.delete(userId);
      else online.set(userId, left);
      io.emit('presence:update', [...online.keys()].map(Number));
    });
  });

  return io;
}
