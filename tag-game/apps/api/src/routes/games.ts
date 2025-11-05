import { Router } from 'express';
import { PrismaClient, GameStatus } from '@prisma/client';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { assignTeams } from '../utils/game.js';

const router = Router();
const prisma = new PrismaClient();

const createGameSchema = z.object({
  name: z.string().min(1).max(50),
  areaBounds: z.object({
    north: z.number(),
    south: z.number(),
    east: z.number(),
    west: z.number(),
  }).optional(),
});

// POST /games - 创建游戏
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const data = createGameSchema.parse(req.body);

    const game = await prisma.game.create({
      data: {
        name: data.name,
        areaBounds: data.areaBounds ? JSON.stringify(data.areaBounds) : null,
        status: GameStatus.LOBBY,
      },
    });

    res.json({ game });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create game error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /games/:id - 获取游戏详情
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const game = await prisma.game.findUnique({
      where: { id: req.params.id },
      include: {
        participations: {
          include: {
            user: {
              select: { id: true, nickname: true, isEliminated: true },
            },
          },
        },
      },
    });

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json({ game });
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /games/:id/join - 加入游戏
router.post('/:id/join', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const game = await prisma.game.findUnique({
      where: { id: req.params.id },
    });

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.status !== GameStatus.LOBBY) {
      return res.status(400).json({ error: 'Game already started' });
    }

    // 检查是否已加入
    const existing = await prisma.participation.findUnique({
      where: {
        userId_gameId: {
          userId: req.user!.userId,
          gameId: game.id,
        },
      },
    });

    if (existing) {
      return res.json({ participation: existing });
    }

    // 临时分配为 RUNNER，等待正式分配
    const participation = await prisma.participation.create({
      data: {
        userId: req.user!.userId,
        gameId: game.id,
        team: 'RUNNER',
      },
    });

    res.json({ participation });
  } catch (error) {
    console.error('Join game error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /games/:id/assign-teams - 分配阵营
router.post('/:id/assign-teams', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const game = await prisma.game.findUnique({
      where: { id: req.params.id },
      include: { participations: true },
    });

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.status !== GameStatus.LOBBY) {
      return res.status(400).json({ error: 'Teams already assigned' });
    }

    const userIds = game.participations.map(p => p.userId);
    const assignments = assignTeams(userIds);

    // 批量更新
    await Promise.all(
      assignments.map(({ userId, team }) =>
        prisma.participation.update({
          where: {
            userId_gameId: { userId, gameId: game.id },
          },
          data: { team },
        })
      )
    );

    // 更新用户角色
    await Promise.all(
      assignments.map(({ userId, team }) =>
        prisma.user.update({
          where: { id: userId },
          data: { role: team },
        })
      )
    );

    const updated = await prisma.participation.findMany({
      where: { gameId: game.id },
      include: { user: true },
    });

    res.json({ participations: updated });
  } catch (error) {
    console.error('Assign teams error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /games/:id/start - 开始游戏
router.post('/:id/start', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const game = await prisma.game.update({
      where: { id: req.params.id },
      data: {
        status: GameStatus.RUNNING,
        startAt: new Date(),
      },
    });

    res.json({ game });
  } catch (error) {
    console.error('Start game error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /games/:id/end - 结束游戏
router.post('/:id/end', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const game = await prisma.game.update({
      where: { id: req.params.id },
      data: {
        status: GameStatus.ENDED,
        endAt: new Date(),
      },
    });

    res.json({ game });
  } catch (error) {
    console.error('End game error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
