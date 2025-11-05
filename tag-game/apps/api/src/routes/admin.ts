import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import QRCode from 'qrcode';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { nanoid } from 'nanoid';

const router: Router = Router();
const prisma = new PrismaClient();

// 所有管理员路由都需要认证和管理员权限
router.use(requireAuth);
router.use(requireAdmin);

/**
 * 创建道具
 */
const createItemSchema = z.object({
  gameId: z.string(),
  type: z.enum(['STEALTH', 'BOOST', 'RADAR', 'REFLECT']),
  name: z.string(),
  description: z.string().optional(),
  durationSec: z.number().int().positive(),
  count: z.number().int().positive().max(100).default(1), // 批量创建
});

router.post('/items', async (req: Request, res: Response) => {
  try {
    const data = createItemSchema.parse(req.body);
    const userId = req.user!.userId;

    // 验证游戏存在且是创建者
    const game = await prisma.game.findUnique({
      where: { id: data.gameId },
    });

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.creatorId !== userId) {
      return res.status(403).json({ error: 'Only game creator can create items' });
    }

    // 批量创建道具
    const items = [];
    for (let i = 0; i < data.count; i++) {
      const item = await prisma.item.create({
        data: {
          code: nanoid(12), // 生成12位随机码
          type: data.type,
          name: data.name,
          description: data.description,
          durationSec: data.durationSec,
          gameId: data.gameId,
          creatorId: userId,
        },
      });
      items.push(item);
    }

    res.json({ items });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create item error:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

/**
 * 获取道具二维码（单个）
 */
router.get('/items/:code/qr', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    const item = await prisma.item.findUnique({
      where: { code },
      include: { game: true },
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // 生成二维码 (base64)
    const qrData = JSON.stringify({
      type: 'ITEM',
      code: item.code,
      gameId: item.gameId,
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 400,
      margin: 2,
    });

    res.json({
      item,
      qrCode: qrCodeDataUrl,
    });
  } catch (error) {
    console.error('Get QR code error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

/**
 * 获取游戏所有道具（用于批量生成二维码）
 */
router.get('/games/:gameId/items', async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        items: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // 为每个道具生成二维码
    const itemsWithQR = await Promise.all(
      game.items.map(async (item) => {
        const qrData = JSON.stringify({
          type: 'ITEM',
          code: item.code,
          gameId: item.gameId,
        });

        const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
          width: 300,
          margin: 1,
        });

        return {
          ...item,
          qrCode: qrCodeDataUrl,
        };
      })
    );

    res.json({
      game: {
        id: game.id,
        name: game.name,
      },
      items: itemsWithQR,
    });
  } catch (error) {
    console.error('Get game items error:', error);
    res.status(500).json({ error: 'Failed to get items' });
  }
});

/**
 * 审核捕捉
 */
const verifyCaptureSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  note: z.string().optional(),
});

router.post('/captures/:id/verify', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = verifyCaptureSchema.parse(req.body);
    const userId = req.user!.userId;

    const capture = await prisma.capture.findUnique({
      where: { id },
      include: {
        game: true,
        hunter: true,
        runner: true,
      },
    });

    if (!capture) {
      return res.status(404).json({ error: 'Capture not found' });
    }

    // 只有游戏创建者可以审核
    if (capture.game.creatorId !== userId) {
      return res.status(403).json({ error: 'Only game creator can verify captures' });
    }

    // 更新捕捉状态
    const updated = await prisma.capture.update({
      where: { id },
      data: {
        verificationStatus: data.status,
        verifiedBy: userId,
        verificationNote: data.note,
        verifiedAt: new Date(),
      },
    });

    // 如果审核通过，标记 runner 为已淘汰
    if (data.status === 'APPROVED') {
      await prisma.user.update({
        where: { id: capture.runnerId },
        data: { isEliminated: true },
      });

      // 更新猎人积分
      await prisma.participation.updateMany({
        where: {
          userId: capture.hunterId,
          gameId: capture.gameId,
        },
        data: {
          score: { increment: 10 },
        },
      });
    }

    res.json({ capture: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Verify capture error:', error);
    res.status(500).json({ error: 'Failed to verify capture' });
  }
});

/**
 * 获取待审核的捕捉列表
 */
router.get('/games/:gameId/captures/pending', async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;

    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const captures = await prisma.capture.findMany({
      where: {
        gameId,
        verificationStatus: 'PENDING',
      },
      include: {
        hunter: { select: { id: true, nickname: true, badgeCode: true } },
        runner: { select: { id: true, nickname: true, badgeCode: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ captures });
  } catch (error) {
    console.error('Get pending captures error:', error);
    res.status(500).json({ error: 'Failed to get pending captures' });
  }
});

/**
 * 设置用户为管理员（仅限已有管理员）
 */
router.post('/users/:userId/make-admin', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isAdmin: true },
    });

    res.json({ user });
  } catch (error) {
    console.error('Make admin error:', error);
    res.status(500).json({ error: 'Failed to make user admin' });
  }
});

export default router;
