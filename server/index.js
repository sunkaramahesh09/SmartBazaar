require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Connect DB
connectDB();

const app = express();
const httpServer = http.createServer(app);

// ── Socket.io ──────────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io available to all controllers via req.app.get('io')
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);
  socket.on('disconnect', () => console.log(`🔌 Socket disconnected: ${socket.id}`));
});

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/products',  require('./routes/product'));
app.use('/api/categories',require('./routes/category'));
app.use('/api/stores',    require('./routes/store'));
app.use('/api/orders',    require('./routes/order'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/ai',        require('./routes/ai'));

// Health check
app.get('/api/health', (req, res) =>
  res.json({ success: true, message: 'Smart Bazaar API running 🚀' })
);

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () =>
  console.log(`🚀 Server + Socket.io running on http://localhost:${PORT}`)
);
