import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router: Router = Router();
const prisma = new PrismaClient();

// GET /items/q/:code - 查询道具
router.get('/q/:code', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const item = await prisma.item.findUnique({
      where: { code: req.params.code },
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ item });
  } catch (error) {
    console.error('Query item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const pickupSchema = z.object({
  code: z.string(),
  gameId: z.string().uuid(),
});

// POST /pickups - 领取道具
router.post('/pickups', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { code, gameId } = pickupSchema.parse(req.body);

    const item = await prisma.item.findUnique({
      where: { code },
    });

    if (!item) {
      return res.status(404).json({ error: 'Invalid item code' });
    }

    // 检查是否已领取
    const existing = await prisma.pickup.findUnique({
      where: {
        userId_itemId_gameId: {
          userId: req.user!.userId,
          itemId: item.id,
          gameId,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Item already picked up' });
    }

    const pickup = await prisma.pickup.create({
      data: {
        userId: req.user!.userId,
        itemId: item.id,
        gameId,
      },
      include: { item: true },
    });

    res.json({ pickup });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Pickup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const useItemSchema = z.object({
  pickupId: z.string().uuid(),
});

// POST /items/use - 使用道具
router.post('/use', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { pickupId } = useItemSchema.parse(req.body);

    const pickup = await prisma.pickup.findUnique({
      where: { id: pickupId },
      include: { item: true },
    });

    if (!pickup) {
      return res.status(404).json({ error: 'Pickup not found' });
    }

    if (pickup.userId !== req.user!.userId) {
      return res.status(403).json({ error: 'Not your item' });
    }

    if (pickup.used) {
      return res.status(400).json({ error: 'Item already used' });
    }

    const expiresAt = new Date(Date.now() + pickup.item.durationSec * 1000);

    const updated = await prisma.pickup.update({
      where: { id: pickupId },
      data: {
        used: true,
        expiresAt,
      },
      include: { item: true },
    });

    res.json({ pickup: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Use item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /items/my-backpack - 获取背包
router.get('/my-backpack', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const gameId = req.query.gameId as string;
    if (!gameId) {
      return res.status(400).json({ error: 'Missing gameId' });
    }

    const pickups = await prisma.pickup.findMany({
      where: {
        userId: req.user!.userId,
        gameId,
      },
      include: { item: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ pickups });
  } catch (error) {
    console.error('Get backpack error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
