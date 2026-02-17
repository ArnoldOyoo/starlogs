import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const createSessionSchema = z.object({
  date: z.string().datetime(),
  location: z.string(),
  conditions: z.object({
    seeing: z.number().min(1).max(5),
    transparency: z.number().min(1).max(5),
    cloudCover: z.number().min(0).max(100),
    temperature: z.number().optional(),
    humidity: z.number().optional(),
  }),
  equipment: z.string().optional(),
  notes: z.string().optional(),
  objects: z.array(z.object({
    name: z.string(),
    type: z.string(),
    notes: z.string().optional(),
    rating: z.number().min(1).max(5).optional(),
  })).optional(),
  photos: z.array(z.string().url()).optional(),
});

// Get all sessions for user
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const sessions = await prisma.observationSession.findMany({
      where: { userId: req.userId },
      include: { objects: true },
      orderBy: { date: 'desc' },
    });

    res.json(sessions);
  } catch (error) {
    next(error);
  }
});

// Get single session
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const session = await prisma.observationSession.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { objects: true },
    });

    if (!session) throw new AppError('Session not found', 404);

    res.json(session);
  } catch (error) {
    next(error);
  }
});

// Create session
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = createSessionSchema.parse(req.body);

    const session = await prisma.observationSession.create({
      data: {
        userId: req.userId!,
        date: new Date(data.date),
        location: data.location,
        conditions: data.conditions,
        equipment: data.equipment,
        notes: data.notes,
        photos: data.photos || [],
        objects: {
          create: data.objects || [],
        },
      },
      include: { objects: true },
    });

    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
});

// Update session
router.patch('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const existing = await prisma.observationSession.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!existing) throw new AppError('Session not found', 404);

    const session = await prisma.observationSession.update({
      where: { id: req.params.id },
      data: req.body,
      include: { objects: true },
    });

    res.json(session);
  } catch (error) {
    next(error);
  }
});

// Delete session
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const existing = await prisma.observationSession.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!existing) throw new AppError('Session not found', 404);

    await prisma.observationSession.delete({ where: { id: req.params.id } });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export { router as sessionRoutes };
