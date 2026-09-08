import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import crypto from 'crypto';

const router = Router();

// GET /api/tables/:qr_token
router.get('/:qr_token', async (req: Request, res: Response): Promise<void> => {
  try {
    const qrTokenParam = req.params.qr_token;
    const qr_token = Array.isArray(qrTokenParam) ? qrTokenParam[0] : qrTokenParam;

    if (!qr_token) {
      res.status(400).json({ error: 'QR token is required' });
      return;
    }

    const table = await prisma.restaurantTable.findUnique({
      where: { qrToken: qr_token },
      select: {
        id: true,
        tableNumber: true,
        qrToken: true,
        capacity: true,
        status: true,
      },
    });

    if (!table) {
      res.status(404).json({
        error: 'Table not found',
        message: 'The scanned table QR code is invalid or has expired.',
      });
      return;
    }

    // Check for an active customer session on this table
    const activeSession = await prisma.customerSession.findFirst({
      where: {
        tableId: table.id,
        status: 'ACTIVE',
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        mobile: true,
        partySize: true,
        token: true,
        createdAt: true,
      },
    });

    const restaurant = await prisma.restaurant.findFirst({
      select: {
        name: true,
        tagline: true,
        currency: true,
        taxRate: true,
      },
    });

    res.json({
      table,
      activeSession: activeSession || null,
      restaurant: restaurant || {
        name: 'EMBER & PLATE',
        tagline: 'Artisanal Woodfire & Contemporary Dining',
        currency: 'INR',
        taxRate: 5.0,
      },
    });
  } catch (error) {
    console.error('Error fetching table info:', error);
    res.status(500).json({ error: 'Internal server error while fetching table details' });
  }
});

// POST /api/tables/login
// Customer registers/logs into table dashboard
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { qrToken, name, mobile, partySize } = req.body;

    if (!qrToken || !name || !mobile) {
      res.status(400).json({ error: 'Missing required fields: qrToken, name, and mobile are required.' });
      return;
    }

    const table = await prisma.restaurantTable.findUnique({
      where: { qrToken },
    });

    if (!table) {
      res.status(404).json({ error: 'Invalid or non-existent table QR code.' });
      return;
    }

    const sessionToken = `sess_${crypto.randomBytes(16).toString('hex')}`;

    // Deactivate previous sessions for this table if any
    await prisma.customerSession.updateMany({
      where: { tableId: table.id, status: 'ACTIVE' },
      data: { status: 'SUPERSEDED' },
    });

    // Create new customer session
    const session = await prisma.customerSession.create({
      data: {
        tableId: table.id,
        name: name.trim(),
        mobile: mobile.trim(),
        partySize: Math.max(1, parseInt(partySize) || 1),
        token: sessionToken,
        status: 'ACTIVE',
      },
    });

    // Mark table as occupied
    await prisma.restaurantTable.update({
      where: { id: table.id },
      data: { status: 'OCCUPIED' },
    });

    res.status(201).json({
      message: 'Customer session created successfully',
      session: {
        id: session.id,
        name: session.name,
        mobile: session.mobile,
        partySize: session.partySize,
        token: session.token,
        tableId: table.id,
        tableNumber: table.tableNumber,
        createdAt: session.createdAt,
      },
    });
  } catch (error) {
    console.error('Error during customer table login:', error);
    res.status(500).json({ error: 'Internal server error during table login.' });
  }
});

// POST /api/tables/session/verify
router.post('/session/verify', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ error: 'Token is required.' });
      return;
    }

    const session = await prisma.customerSession.findUnique({
      where: { token },
      include: {
        table: {
          select: {
            id: true,
            tableNumber: true,
            capacity: true,
            status: true,
            qrToken: true,
          },
        },
      },
    });

    if (!session || session.status !== 'ACTIVE') {
      res.status(401).json({ error: 'Invalid or expired customer session.' });
      return;
    }

    res.json({
      valid: true,
      session: {
        id: session.id,
        name: session.name,
        mobile: session.mobile,
        partySize: session.partySize,
        token: session.token,
        tableId: session.table.id,
        tableNumber: session.table.tableNumber,
        qrToken: session.table.qrToken,
      },
    });
  } catch (error) {
    console.error('Error verifying session:', error);
    res.status(500).json({ error: 'Internal server error during session verification.' });
  }
});

// POST /api/tables/logout
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ error: 'Token is required.' });
      return;
    }

    const session = await prisma.customerSession.findUnique({
      where: { token },
    });

    if (session) {
      await prisma.customerSession.update({
        where: { id: session.id },
        data: { status: 'CHECKED_OUT' },
      });

      // Reset table status to AVAILABLE if no active sessions remain
      const activeCount = await prisma.customerSession.count({
        where: { tableId: session.tableId, status: 'ACTIVE' },
      });

      if (activeCount === 0) {
        await prisma.restaurantTable.update({
          where: { id: session.tableId },
          data: { status: 'AVAILABLE' },
        });
      }
    }

    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    console.error('Error during customer logout:', error);
    res.status(500).json({ error: 'Internal server error during logout.' });
  }
});

export default router;
