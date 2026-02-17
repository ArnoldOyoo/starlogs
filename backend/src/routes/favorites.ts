import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const addFavoriteSchema = z.object({
  objectId: z.string(),
  objectName: z.string(),
  objectType: z.enum(['star', 'planet', 'constellation', 'dso', 'other']),
  notes: z.string().optional(),
});

// Get all favorites
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(favorites);
  } catch (error) {
    next(error);
  }
});

// Add favorite
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = addFavoriteSchema.parse(req.body);

    const existing = await prisma.favorite.findFirst({
      where: { userId: req.userId, objectId: data.objectId },
    });

    if (existing) throw new AppError('Already in favorites', 400);

    const favorite = await prisma.favorite.create({
      data: { userId: req.userId!, ...data },
    });

    res.status(201).json(favorite);
  } catch (error) {
    next(error);
  }
});

// Remove favorite
router.delete('/:objectId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const favorite = await prisma.favorite.findFirst({
      where: { userId: req.userId, objectId: req.params.objectId },
    });

    if (!favorite) throw new AppError('Favorite not found', 404);

    await prisma.favorite.delete({ where: { id: favorite.id } });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export { router as favoriteRoutes };
