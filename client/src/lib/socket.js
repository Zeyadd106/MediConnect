import { io } from 'socket.io-client';
import { getToken } from './api.js';

let socket = null;

export function getSocket() {
  if (socket?.connected) return socket;
  if (socket) socket.disconnect();
  socket = io({ auth: { token: getToken() } });
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
