import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { generateToken } from '../utils/jwt.js';
import { nanoid } from 'nanoid';

const router: Router = Router();
const prisma = new PrismaClient();

const anonLoginSchema = z.object({
  nickname: z.string().min(1).max(20),
});

// POST /auth/anon - 匿名登录
router.post('/anon', async (req, res) => {
  try {
    const { nickname } = anonLoginSchema.parse(req.body);

    const user = await prisma.user.create({
      data: {
        nickname,
        badgeCode: nanoid(12),
      },
    });

    const token = generateToken({
      userId: user.id,
      nickname: user.nickname,
    });

    res.json({
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        badgeCode: user.badgeCode,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
