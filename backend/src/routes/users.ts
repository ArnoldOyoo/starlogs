import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const updateProfileSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  avatar: z.string().url().optional(),
  location: z.string().optional(),
  preferences: z.object({
    darkMode: z.boolean().optional(),
    notifications: z.boolean().optional(),
    units: z.enum(['metric', 'imperial']).optional(),
  }).optional(),
});

// Get current user profile
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        location: true,
        preferences: true,
        createdAt: true,
      },
    });

    if (!user) throw new AppError('User not found', 404);

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Update profile
router.patch('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = updateProfileSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        location: true,
        preferences: true,
      },
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Delete account
router.delete('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.userId } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export { router as userRoutes };
