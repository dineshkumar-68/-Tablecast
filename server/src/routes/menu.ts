import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/menu
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.menuCategory.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        items: {
          where: { isAvailable: true },
          include: {
            addons: true,
          },
          orderBy: [
            { isPopular: 'desc' },
            { name: 'asc' },
          ],
        },
      },
    });

    // Also compute flat items list and summary stats
    const allItems = categories.flatMap((cat) => cat.items);

    res.json({
      categories,
      totalItems: allItems.length,
      popularItems: allItems.filter((i) => i.isPopular),
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'Internal server error while fetching menu' });
  }
});

export default router;
