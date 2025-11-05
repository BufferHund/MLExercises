import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router: Router = Router();
const prisma = new PrismaClient();

// GET /me - 获取当前用户信息
router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        nickname: true,
        role: true,
        badgeCode: true,
        isEliminated: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /me/badge - 获取徽章二维码
router.get('/me/badge', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const badgeText = `badge:${user.id}:${user.badgeCode}`;
    const qrDataUrl = await QRCode.toDataURL(badgeText, {
      width: 300,
      margin: 2,
    });

    res.json({
      badgeCode: user.badgeCode,
      badgeText,
      qrDataUrl,
    });
  } catch (error) {
    console.error('Get badge error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
