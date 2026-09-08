import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma';
import { initSocketServer } from './lib/socket';

import tablesRouter from './routes/tables';
import menuRouter from './routes/menu';
import ordersRouter from './routes/orders';
import authRouter from './routes/auth';
import adminRouter from './routes/admin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());

// Create HTTP server & attach Socket.io
const server = http.createServer(app);
initSocketServer(server);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/tables', tablesRouter);
app.use('/api/menu', menuRouter);
app.use('/api/orders', ordersRouter);

// Health Check Endpoint
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const [restaurant, tableCount, categoryCount, itemCount, orderCount, adminCount] =
      await Promise.all([
        prisma.restaurant.findFirst(),
        prisma.restaurantTable.count(),
        prisma.menuCategory.count(),
        prisma.menuItem.count(),
        prisma.order.count(),
        prisma.adminUser.count(),
      ]);

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      restaurant: restaurant?.name || 'Tablecast',
      db: {
        connected: true,
        stats: {
          tables: tableCount,
          categories: categoryCount,
          menuItems: itemCount,
          orders: orderCount,
          adminUsers: adminCount,
        },
      },
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Root welcome route
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'Tablecast REST API',
    version: '2.0.0',
    endpoints: {
      health: '/api/health',
      menu: '/api/menu',
      tables: '/api/tables/:qr_token',
      orders: '/api/orders',
      auth: '/api/auth/login',
      admin: '/api/admin/*',
    },
  });
});

// Start Server
server.listen(PORT, async () => {
  console.log(`🔥 [Tablecast] Server running on http://localhost:${PORT}`);
  try {
    await prisma.$connect();
    console.log('📦 Connected to Database successfully (Prisma ORM)');
  } catch (err) {
    console.error('❌ Failed to connect to Database:', err);
  }
});

// Handle termination
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Database disconnected');
  });
});

export default app;

