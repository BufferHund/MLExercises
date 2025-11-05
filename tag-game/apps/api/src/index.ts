import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import authRouter from './routes/auth.js';
import gamesRouter from './routes/games.js';
import itemsRouter from './routes/items.js';
import capturesRouter from './routes/captures.js';
import leaderboardRouter from './routes/leaderboard.js';
import usersRouter from './routes/users.js';

// WebSocket
import { setupGameSocket } from './ws/game-socket.js';

// ES modules fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (uploads)
const uploadDir = process.env.UPLOAD_DIR || './uploads';
app.use('/uploads', express.static(uploadDir));

// Routes
app.use('/auth', authRouter);
app.use('/games', gamesRouter);
app.use('/items', itemsRouter);
app.use('/captures', capturesRouter);
app.use('/leaderboard', leaderboardRouter);
app.use('/users', usersRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WebSocket setup
setupGameSocket(io);

// Error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
);

// Start server
const PORT = parseInt(process.env.PORT || '3000');
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket ready on ws://localhost:${PORT}`);
  console.log(`\n📋 API Endpoints:`);
  console.log(`   POST   /auth/anon`);
  console.log(`   POST   /games`);
  console.log(`   GET    /games/:id`);
  console.log(`   POST   /games/:id/join`);
  console.log(`   POST   /games/:id/assign-teams`);
  console.log(`   POST   /games/:id/start`);
  console.log(`   POST   /games/:id/end`);
  console.log(`   GET    /items/q/:code`);
  console.log(`   POST   /items/pickups`);
  console.log(`   POST   /items/use`);
  console.log(`   GET    /items/my-backpack`);
  console.log(`   POST   /captures`);
  console.log(`   GET    /captures`);
  console.log(`   GET    /leaderboard`);
  console.log(`   GET    /users/me`);
  console.log(`   GET    /users/me/badge`);
  console.log(`\n✨ Ready to play!\n`);
});
