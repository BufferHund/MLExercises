import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router: Router = Router();
const prisma = new PrismaClient();

// GET /leaderboard - 获取排行榜
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const gameId = req.query.gameId as string;
    if (!gameId) {
      return res.status(400).json({ error: 'Missing gameId' });
    }

    const leaderboard = await prisma.participation.findMany({
      where: { gameId },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            role: true,
            isEliminated: true,
          },
        },
      },
      orderBy: { score: 'desc' },
    });

    res.json({ leaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
