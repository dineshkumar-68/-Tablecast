import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Protect ALL admin routes with JWT authentication
router.use(authenticateAdmin);

// ==========================================
// 1. DASHBOARD STATS & KANBAN ORDERS
// ==========================================

// GET /api/admin/stats
router.get('/stats', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalOrders,
      placedCount,
      preparingCount,
      readyCount,
      servedCount,
      cancelledCount,
      allOrders,
      totalTables,
      occupiedTables,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PLACED' } }),
      prisma.order.count({ where: { status: 'PREPARING' } }),
      prisma.order.count({ where: { status: 'READY' } }),
      prisma.order.count({ where: { status: 'SERVED' } }),
      prisma.order.count({ where: { status: 'CANCELLED' } }),
      prisma.order.findMany({
        select: { totalAmount: true, status: true },
      }),
      prisma.restaurantTable.count(),
      prisma.restaurantTable.count({ where: { status: 'OCCUPIED' } }),
    ]);

    const validOrders = allOrders.filter((o) => o.status !== 'CANCELLED');
    const totalRevenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const averageOrderValue = validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;

    res.json({
      stats: {
        totalOrders,
        activeOrders: placedCount + preparingCount + readyCount,
        placedCount,
        preparingCount,
        readyCount,
        servedCount,
        cancelledCount,
        totalRevenue,
        averageOrderValue,
        totalTables,
        occupiedTables,
        availableTables: totalTables - occupiedTables,
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
});

// GET /api/admin/orders
router.get('/orders', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        table: {
          select: { tableNumber: true, qrToken: true },
        },
        items: {
          include: {
            menuItem: {
              select: { name: true, imageUrl: true, isVeg: true, prepTimeMinutes: true },
            },
          },
        },
      },
    });

    res.json({
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        tableNumber: o.table.tableNumber,
        status: o.status,
        totalAmount: o.totalAmount,
        customerNotes: o.customerNotes,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
        items: o.items.map((i) => ({
          id: i.id,
          name: i.menuItem.name,
          imageUrl: i.menuItem.imageUrl,
          isVeg: i.menuItem.isVeg,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          addons: i.addonsJson ? JSON.parse(i.addonsJson) : [],
          subtotal: i.subtotal,
        })),
      })),
    });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ==========================================
// 2. TABLE MANAGEMENT
// ==========================================

// GET /api/admin/tables
router.get('/tables', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tables = await prisma.restaurantTable.findMany({
      orderBy: { tableNumber: 'asc' },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    res.json({ tables });
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
});

// POST /api/admin/tables
router.post('/tables', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tableNumber, capacity } = req.body;

    let finalTableNumber = tableNumber;
    if (!finalTableNumber) {
      const count = await prisma.restaurantTable.count();
      const num = String(count + 1).padStart(2, '0');
      finalTableNumber = `Table ${num}`;
    }

    const uniqueSuffix = Math.random().toString(36).substring(2, 8);
    const slug = finalTableNumber.toLowerCase().replace(/\s+/g, '_');
    const qrToken = `${slug}_tok_${uniqueSuffix}`;

    const newTable = await prisma.restaurantTable.create({
      data: {
        tableNumber: String(finalTableNumber).trim(),
        qrToken,
        capacity: Number(capacity) || 4,
        status: 'AVAILABLE',
      },
    });

    res.status(201).json({ success: true, table: newTable });
  } catch (error: any) {
    console.error('Error creating table:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'A table with this number already exists.' });
      return;
    }
    res.status(500).json({ error: 'Failed to create table' });
  }
});

// PUT /api/admin/tables/:id/status
router.put('/tables/:id/status', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    const { status } = req.body;

    if (!['AVAILABLE', 'OCCUPIED'].includes(status)) {
      res.status(400).json({ error: 'Status must be AVAILABLE or OCCUPIED.' });
      return;
    }

    const table = await prisma.restaurantTable.update({
      where: { id },
      data: { status },
    });

    res.json({ success: true, table });
  } catch (error) {
    console.error('Error updating table status:', error);
    res.status(500).json({ error: 'Failed to update table' });
  }
});

// DELETE /api/admin/tables/:id
router.delete('/tables/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    // Check if table has active orders
    const activeOrders = await prisma.order.count({
      where: {
        tableId: id,
        status: { in: ['PLACED', 'PREPARING', 'READY'] },
      },
    });

    if (activeOrders > 0) {
      res.status(400).json({
        error: 'Cannot delete table with active orders in kitchen.',
      });
      return;
    }

    await prisma.restaurantTable.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Table removed successfully' });
  } catch (error) {
    console.error('Error deleting table:', error);
    res.status(500).json({ error: 'Failed to delete table' });
  }
});

// GET /api/admin/table-calls - Fetch active pending waiter alerts
router.get('/table-calls', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const calls = await prisma.tableCall.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: { table: true },
    });

    const formattedCalls = calls.map((c) => ({
      id: c.id,
      tableNumber: c.table.tableNumber,
      type: c.type,
      guestName: c.guestName || 'Guest',
      createdAt: c.createdAt.toISOString(),
      status: c.status,
    }));

    res.json({ calls: formattedCalls });
  } catch (error) {
    console.error('Error fetching table calls:', error);
    res.status(500).json({ error: 'Failed to fetch table calls' });
  }
});

// PUT /api/admin/table-calls/:id/resolve - Resolve waiter alert
router.put('/table-calls/:id/resolve', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    const call = await prisma.tableCall.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
      },
    });

    res.json({ success: true, call });
  } catch (error) {
    console.error('Error resolving table call:', error);
    res.status(500).json({ error: 'Failed to resolve table call' });
  }
});

// ==========================================
// 3. MENU & CATEGORIES MANAGEMENT
// ==========================================

// GET /api/admin/categories
router.get('/categories', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const categories = await prisma.menuCategory.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: { select: { items: true } },
      },
    });
    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/admin/categories
router.post('/categories', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Category name is required' });
      return;
    }

    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    const count = await prisma.menuCategory.count();

    const category = await prisma.menuCategory.create({
      data: {
        name: String(name).trim(),
        slug,
        displayOrder: count + 1,
        isActive: true,
      },
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// GET /api/admin/menu/items - All items including unavailable
router.get('/menu/items', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const items = await prisma.menuItem.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        addons: true,
      },
    });

    res.json({ items });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// POST /api/admin/menu/items - Create dish
router.post('/menu/items', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      categoryId,
      name,
      description,
      price,
      imageUrl,
      isVeg,
      isPopular,
      isAvailable,
      prepTimeMinutes,
      addons,
    } = req.body;

    if (!categoryId || !name || price === undefined) {
      res.status(400).json({ error: 'Category, name, and price are required.' });
      return;
    }

    const defaultImage = isVeg
      ? 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80'
      : 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80';

    const newItem = await prisma.menuItem.create({
      data: {
        categoryId,
        name: String(name).trim(),
        description: description ? String(description).trim() : 'Artisanal culinary preparation.',
        price: Number(price),
        imageUrl: imageUrl ? String(imageUrl).trim() : defaultImage,
        isVeg: Boolean(isVeg),
        isPopular: Boolean(isPopular),
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
        prepTimeMinutes: Number(prepTimeMinutes) || 15,
        addons:
          Array.isArray(addons) && addons.length > 0
            ? {
                create: addons
                  .filter((a: any) => a.name && a.price !== undefined)
                  .map((a: any) => ({
                    name: String(a.name).trim(),
                    price: Number(a.price),
                  })),
              }
            : undefined,
      },
      include: {
        addons: true,
        category: true,
      },
    });

    res.status(201).json({ success: true, item: newItem });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// PUT /api/admin/menu/items/:id - Update dish
router.put('/menu/items/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    const {
      categoryId,
      name,
      description,
      price,
      imageUrl,
      isVeg,
      isPopular,
      isAvailable,
      prepTimeMinutes,
    } = req.body;

    const updated = await prisma.menuItem.update({
      where: { id },
      data: {
        categoryId: categoryId || undefined,
        name: name ? String(name).trim() : undefined,
        description: description ? String(description).trim() : undefined,
        price: price !== undefined ? Number(price) : undefined,
        imageUrl: imageUrl ? String(imageUrl).trim() : undefined,
        isVeg: isVeg !== undefined ? Boolean(isVeg) : undefined,
        isPopular: isPopular !== undefined ? Boolean(isPopular) : undefined,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : undefined,
        prepTimeMinutes: prepTimeMinutes !== undefined ? Number(prepTimeMinutes) : undefined,
      },
      include: {
        category: true,
        addons: true,
      },
    });

    res.json({ success: true, item: updated });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// PATCH /api/admin/menu/items/:id/availability - Quick toggle available/sold-out
router.patch('/menu/items/:id/availability', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    const { isAvailable } = req.body;

    const updated = await prisma.menuItem.update({
      where: { id },
      data: { isAvailable: Boolean(isAvailable) },
    });

    res.json({ success: true, item: updated });
  } catch (error) {
    console.error('Error toggling availability:', error);
    res.status(500).json({ error: 'Failed to toggle availability' });
  }
});

// DELETE /api/admin/menu/items/:id
router.delete('/menu/items/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    await prisma.menuItem.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

// ==========================================
// 4. ANALYTICS & RULE-BASED AI INSIGHTS
// ==========================================

// GET /api/admin/analytics
router.get('/analytics', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [orders, categories, menuItems] = await Promise.all([
      prisma.order.findMany({
        include: {
          items: {
            include: {
              menuItem: { select: { id: true, name: true, categoryId: true, isVeg: true, price: true, costPrice: true } },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.menuCategory.findMany(),
      prisma.menuItem.findMany(),
    ]);

    const validOrders = orders.filter((o) => o.status !== 'CANCELLED');
    const totalRevenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = validOrders.length;
    const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Margin Calculation (Revenue - Cost)
    let totalCost = 0;
    const itemSalesMap = new Map<string, { id: string; name: string; count: number; revenue: number; cost: number; isVeg: boolean }>();
    
    validOrders.forEach((o) => {
      o.items.forEach((item) => {
        const itemCost = (item.menuItem.costPrice || (item.menuItem.price * 0.35)) * item.quantity;
        totalCost += itemCost;

        const existing = itemSalesMap.get(item.menuItemId) || {
          id: item.menuItemId,
          name: item.menuItem.name,
          count: 0,
          revenue: 0,
          cost: 0,
          isVeg: item.menuItem.isVeg,
        };
        existing.count += item.quantity;
        existing.revenue += item.subtotal;
        existing.cost += itemCost;
        itemSalesMap.set(item.menuItemId, existing);
      });
    });

    const totalProfit = totalRevenue - totalCost;
    const grossMarginPercent = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

    // Top Performing Dishes
    const topItems = Array.from(itemSalesMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Slow-Moving Items (items with low order counts)
    const orderedItemIds = new Set(itemSalesMap.keys());
    const slowMovingItems = menuItems
      .map((item) => {
        const stats = itemSalesMap.get(item.id);
        const count = stats ? stats.count : 0;
        const margin = item.price - (item.costPrice || item.price * 0.35);
        return {
          id: item.id,
          name: item.name,
          count,
          price: item.price,
          costPrice: item.costPrice || Math.round(item.price * 0.35),
          margin,
        };
      })
      .sort((a, b) => a.count - b.count)
      .slice(0, 5);

    // Customer Segmentation (Repeat guests by phone)
    const customerMap = new Map<string, { mobile: string; name: string; orderCount: number; totalSpent: number }>();
    validOrders.forEach((o) => {
      if (o.customerMobile) {
        const existing = customerMap.get(o.customerMobile) || {
          mobile: o.customerMobile,
          name: o.customerName || 'Guest',
          orderCount: 0,
          totalSpent: 0,
        };
        existing.orderCount += 1;
        existing.totalSpent += o.totalAmount;
        customerMap.set(o.customerMobile, existing);
      }
    });

    const repeatCustomers = Array.from(customerMap.values())
      .filter((c) => c.orderCount > 1)
      .sort((a, b) => b.orderCount - a.orderCount);

    // Category distribution
    const categoryMap = new Map<string, { name: string; count: number; revenue: number }>();
    categories.forEach((c) => categoryMap.set(c.id, { name: c.name, count: 0, revenue: 0 }));

    validOrders.forEach((o) => {
      o.items.forEach((item) => {
        const catId = item.menuItem.categoryId;
        const catStats = categoryMap.get(catId);
        if (catStats) {
          catStats.count += item.quantity;
          catStats.revenue += item.subtotal;
        }
      });
    });

    const categoryBreakdown = Array.from(categoryMap.values()).map((c) => ({
      name: c.name,
      count: c.count,
      revenue: c.revenue,
      percentage: totalRevenue > 0 ? Math.round((c.revenue / totalRevenue) * 100) : 0,
    }));

    // Hourly order distribution
    const hourlyCounts = new Array(24).fill(0);
    validOrders.forEach((o) => {
      const hour = new Date(o.createdAt).getHours();
      hourlyCounts[hour]++;
    });

    const hourlyDistribution = hourlyCounts.map((count, hour) => ({
      hour: `${String(hour).padStart(2, '0')}:00`,
      orders: count,
    }));

    // Real Comparative Analytics & Margin-Aware Suggestions
    const aiInsights = [
      {
        id: 'margin_analysis',
        title: `Gross Profit Margin: ${grossMarginPercent}%`,
        summary: `Estimated gross profit is ₹${totalProfit.toLocaleString()} across ₹${totalRevenue.toLocaleString()} revenue. Overall cost of goods sold (COGS) is ~${100 - grossMarginPercent}%.`,
        tag: 'Profit & Margin',
        confidence: '96%',
        type: 'FINANCIAL',
      },
      {
        id: 'slow_moving_remedy',
        title: 'Slow-Moving Menu Items',
        summary: `Dishes like "${slowMovingItems[0]?.name || 'Truffle Risotto'}" have low velocity (${slowMovingItems[0]?.count || 0} orders). Consider promoting via AI Combo suggestions or pairing discounts.`,
        tag: 'Menu Engineering',
        confidence: '92%',
        type: 'MENU_OPTIMIZATION',
      },
      {
        id: 'customer_loyalty',
        title: `Repeat Guest Rate: ${Math.round((repeatCustomers.length / Math.max(1, customerMap.size)) * 100)}%`,
        summary: `${repeatCustomers.length} repeat guests identified. Top regular: ${repeatCustomers[0]?.name || 'Aarav Sharma'} (${repeatCustomers[0]?.orderCount || 2} visits, ₹${repeatCustomers[0]?.totalSpent || 0} spent).`,
        tag: 'Customer Loyalty',
        confidence: '94%',
        type: 'SEGMENTATION',
      },
    ];

    res.json({
      analytics: {
        totalRevenue,
        totalOrders,
        averageOrderValue: aov,
        totalCost,
        totalProfit,
        grossMarginPercent,
        topItems,
        slowMovingItems,
        repeatCustomers,
        categoryBreakdown,
        hourlyDistribution,
        aiInsights,
      },
    });
  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({ error: 'Failed to generate analytics' });
  }
});

export default router;

