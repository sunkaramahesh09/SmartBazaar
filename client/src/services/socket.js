import { io } from 'socket.io-client';

// Connect to the backend WebSocket server.
// In production VITE_API_URL = https://smart-bazaar-api.onrender.com (no /api suffix).
// In development the Vite proxy handles /api so we connect to the same origin.
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
});

socket.on('connect', () =>
  console.log('🔌 Socket connected:', socket.id)
);
socket.on('disconnect', (reason) =>
  console.log('🔌 Socket disconnected:', reason)
);
socket.on('connect_error', (err) =>
  console.warn('🔌 Socket connect error:', err.message)
);

export default socket;
