import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../utils/jwt.js';
import { nearbyEnemies, nearbyPlayers } from '../utils/geo.js';

const prisma = new PrismaClient();

interface SocketData {
  userId: string;
  gameId: string;
}

// 位置缓存（内存）
const positionCache = new Map<
  string,
  {
    userId: string;
    gameId: string;
    role: 'HUNTER' | 'RUNNER';
    lat: number;
    lng: number;
    timestamp: number;
  }
>();

// 速率限制
const rateLimiter = new Map<string, number>();
const RATE_LIMIT_MS = parseInt(process.env.POSITION_UPDATE_COOLDOWN_SEC || '3') * 1000;

export function setupGameSocket(io: Server) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const payload = verifyToken(token);
      socket.data.userId = payload.userId;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id} (user: ${socket.data.userId})`);

    // 加入游戏房间
    socket.on('game:join', async (data: { gameId: string }) => {
      try {
        const { gameId } = data;
        socket.data.gameId = gameId;
        socket.join(`game:${gameId}`);

        const user = await prisma.user.findUnique({
          where: { id: socket.data.userId },
        });

        console.log(`User ${socket.data.userId} joined game ${gameId}`);
        socket.emit('game:joined', { gameId, role: user?.role });
      } catch (error) {
        console.error('Join game error:', error);
        socket.emit('error', { message: 'Failed to join game' });
      }
    });

    // 位置更新
    socket.on(
      'pos:update',
      async (data: { lat: number; lng: number; accuracy?: number }) => {
        try {
          const { userId, gameId } = socket.data as SocketData;
          if (!gameId) {
            return socket.emit('error', { message: 'Not in a game' });
          }

          // 速率限制
          const key = `${userId}:${gameId}`;
          const lastUpdate = rateLimiter.get(key) || 0;
          const now = Date.now();
          if (now - lastUpdate < RATE_LIMIT_MS) {
            return; // 静默丢弃
          }
          rateLimiter.set(key, now);

          // 获取用户信息
          const user = await prisma.user.findUnique({
            where: { id: userId },
          });

          if (!user || !user.role) {
            return socket.emit('error', { message: 'Invalid user' });
          }

          // 更新缓存
          positionCache.set(key, {
            userId,
            gameId,
            role: user.role as 'HUNTER' | 'RUNNER',
            lat: data.lat,
            lng: data.lng,
            timestamp: now,
          });

          // 持久化到数据库（异步，不阻塞）
          prisma.positionLog
            .create({
              data: {
                userId,
                gameId,
                lat: data.lat,
                lng: data.lng,
                accuracy: data.accuracy,
              },
            })
            .catch((err) => console.error('Position log error:', err));

          // 获取所有玩家位置
          const allPositions = Array.from(positionCache.values()).filter(
            (pos) => pos.gameId === gameId && pos.userId !== userId
          );

          // 检查隐身道具
          const stealthedUsers = new Set<string>();
          const stealthPickups = await prisma.pickup.findMany({
            where: {
              gameId,
              used: true,
              expiresAt: { gt: new Date() },
              item: { type: "STEALTH" },
            },
          });
          stealthPickups.forEach((p) => stealthedUsers.add(p.userId));

          // 获取所有可见玩家（包括队友）
          const allPlayers = nearbyPlayers(
            { lat: data.lat, lng: data.lng, role: user.role as 'HUNTER' | 'RUNNER' },
            allPositions.map((pos) => ({
              userId: pos.userId,
              role: pos.role,
              lat: pos.lat,
              lng: pos.lng,
              lastSeenSec: Math.floor((now - pos.timestamp) / 1000),
              isStealthed: stealthedUsers.has(pos.userId),
            })),
            5000 // 5公里范围内的所有玩家
          );

          // 向房间内所有玩家广播这个玩家的位置更新
          io.to(`game:${gameId}`).emit('pos:player-update', {
            userId,
            role: user.role,
            lat: data.lat,
            lng: data.lng,
            timestamp: now,
          });

          // 发送当前玩家可见的所有玩家列表
          socket.emit('pos:all-players', { users: allPlayers });
        } catch (error) {
          console.error('Position update error:', error);
          socket.emit('error', { message: 'Position update failed' });
        }
      }
    );

    // 断开连接
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      if (socket.data.userId && socket.data.gameId) {
        const key = `${socket.data.userId}:${socket.data.gameId}`;
        positionCache.delete(key);
      }
    });
  });

  // 定期清理过期缓存（5分钟）
  setInterval(() => {
    const now = Date.now();
    const expireTime = 5 * 60 * 1000;
    for (const [key, pos] of positionCache.entries()) {
      if (now - pos.timestamp > expireTime) {
        positionCache.delete(key);
      }
    }
  }, 60000);
}
