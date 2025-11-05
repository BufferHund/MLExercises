import { Router } from 'express';
import { PrismaClient, ItemType } from '@prisma/client';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { calculateDistance } from '../utils/geo.js';
import { scoreCapture } from '../utils/game.js';

const router = Router();
const prisma = new PrismaClient();

// 配置上传
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'capture-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: (parseInt(process.env.MAX_UPLOAD_MB || '4')) * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed'));
    }
  },
});

const captureSchema = z.object({
  runnerId: z.string().uuid(),
  gameId: z.string().uuid(),
  lat: z.number(),
  lng: z.number(),
});

// POST /captures - 提交抓捕
router.post(
  '/',
  authMiddleware,
  upload.single('photo'),
  async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Photo is required' });
      }

      const data = captureSchema.parse({
        runnerId: req.body.runnerId,
        gameId: req.body.gameId,
        lat: parseFloat(req.body.lat),
        lng: parseFloat(req.body.lng),
      });

      // 验证猎人身份
      const hunter = await prisma.user.findUnique({
        where: { id: req.user!.userId },
      });

      if (!hunter || hunter.role !== 'HUNTER') {
        return res.status(403).json({ error: 'Only hunters can capture' });
      }

      // 验证目标是逃亡者
      const runner = await prisma.user.findUnique({
        where: { id: data.runnerId },
      });

      if (!runner || runner.role !== 'RUNNER') {
        return res.status(400).json({ error: 'Invalid target' });
      }

      if (runner.isEliminated) {
        return res.status(400).json({ error: 'Target already eliminated' });
      }

      // 获取目标最近位置
      const runnerPosition = await prisma.positionLog.findFirst({
        where: {
          userId: data.runnerId,
          gameId: data.gameId,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!runnerPosition) {
        return res.status(400).json({ error: 'Target position unknown' });
      }

      // 验证距离
      const distance = calculateDistance(
        data.lat,
        data.lng,
        runnerPosition.lat,
        runnerPosition.lng
      );

      const maxDistance = parseInt(
        process.env.MAX_CAPTURE_DISTANCE_METERS || '5'
      );

      if (distance > maxDistance) {
        return res.status(400).json({
          error: `Too far from target (${distance.toFixed(1)}m > ${maxDistance}m)`,
        });
      }

      // 检查猎人是否持有 RADAR 道具
      const radarPickup = await prisma.pickup.findFirst({
        where: {
          userId: req.user!.userId,
          gameId: data.gameId,
          used: true,
          item: { type: ItemType.RADAR },
          expiresAt: { gt: new Date() },
        },
      });

      const points = scoreCapture(!!radarPickup);

      // 创建抓捕记录
      const capture = await prisma.capture.create({
        data: {
          hunterId: req.user!.userId,
          runnerId: data.runnerId,
          gameId: data.gameId,
          photoUrl: `/uploads/${req.file.filename}`,
          lat: data.lat,
          lng: data.lng,
          verified: true, // 简化版本自动验证
        },
      });

      // 标记逃亡者被淘汰
      await prisma.user.update({
        where: { id: data.runnerId },
        data: { isEliminated: true },
      });

      // 增加猎人积分
      await prisma.participation.update({
        where: {
          userId_gameId: {
            userId: req.user!.userId,
            gameId: data.gameId,
          },
        },
        data: {
          score: { increment: points },
        },
      });

      res.json({ capture, points, distance: Math.round(distance) });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Capture error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// GET /captures - 获取抓捕记录
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const gameId = req.query.gameId as string;
    if (!gameId) {
      return res.status(400).json({ error: 'Missing gameId' });
    }

    const captures = await prisma.capture.findMany({
      where: { gameId },
      include: {
        hunter: { select: { id: true, nickname: true } },
        runner: { select: { id: true, nickname: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ captures });
  } catch (error) {
    console.error('Get captures error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
