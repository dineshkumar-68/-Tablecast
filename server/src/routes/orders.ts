import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { notifyKitchenOrderUpdate } from '../lib/socket';

const router = Router();

interface OrderItemPayload {
  menuItemId: string;
  quantity: number;
  addonIds?: string[];
  addedByName?: string;
}

// Helper to generate readable order numbers (e.g. #1056)
async function generateOrderNumber(restaurantId: string): Promise<string> {
  const count = await prisma.order.count({ where: { restaurantId } });
  return `#${1038 + count + 1}`;
}

// POST /api/orders - Place a new order
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { table_token, items, customerNotes, customerMobile, customerName } = req.body;

    if (!table_token || typeof table_token !== 'string') {
      res.status(400).json({ error: 'Valid table token is required.' });
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Order must contain at least one item.' });
      return;
    }

    const table = await prisma.restaurantTable.findUnique({
      where: { qrToken: table_token },
    });

    if (!table) {
      res.status(404).json({ error: 'Table not found or invalid QR token.' });
      return;
    }

    const menuItemIds = items.map((i: OrderItemPayload) => i.menuItemId);
    const dbMenuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
      },
      include: {
        addons: true,
      },
    });

    const menuMap = new Map(dbMenuItems.map((m) => [m.id, m]));

    let computedSubtotal = 0;
    let maxPrepTime = 15;
    const computedOrderItems = [];

    for (const item of items as OrderItemPayload[]) {
      const dbItem = menuMap.get(item.menuItemId);
      if (!dbItem) {
        res.status(400).json({ error: `Menu item '${item.menuItemId}' does not exist.` });
        return;
      }
      if (!dbItem.isAvailable) {
        res.status(400).json({ error: `Dish '${dbItem.name}' is currently unavailable.` });
        return;
      }

      const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
      let unitPrice = dbItem.price;
      let selectedAddonsList: Array<{ id: string; name: string; price: number }> = [];

      if (Array.isArray(item.addonIds) && item.addonIds.length > 0) {
        const addonMap = new Map(dbItem.addons.map((a) => [a.id, a]));
        for (const addonId of item.addonIds) {
          const dbAddon = addonMap.get(addonId);
          if (dbAddon) {
            selectedAddonsList.push({
              id: dbAddon.id,
              name: dbAddon.name,
              price: dbAddon.price,
            });
            unitPrice += dbAddon.price;
          }
        }
      }

      const itemSubtotal = unitPrice * qty;
      computedSubtotal += itemSubtotal;
      maxPrepTime = Math.max(maxPrepTime, dbItem.prepTimeMinutes);

      computedOrderItems.push({
        menuItemId: dbItem.id,
        quantity: qty,
        unitPrice: dbItem.price,
        addonsJson: selectedAddonsList.length > 0 ? JSON.stringify(selectedAddonsList) : null,
        subtotal: itemSubtotal,
        addedByName: item.addedByName ? String(item.addedByName).trim() : null,
      });
    }

    const taxesAndCharges = Math.round(computedSubtotal * 0.05); // 5% GST
    const finalTotalAmount = computedSubtotal + taxesAndCharges;

    const orderNumber = await generateOrderNumber(table.restaurantId);
    const trackingToken = `trk_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;

    const newOrder = await prisma.order.create({
      data: {
        restaurantId: table.restaurantId,
        orderNumber,
        tableId: table.id,
        trackingToken,
        customerMobile: customerMobile ? String(customerMobile).trim() : null,
        customerName: customerName ? String(customerName).trim() : null,
        status: 'PLACED',
        subtotalAmount: computedSubtotal,
        taxesAndCharges,
        totalAmount: finalTotalAmount,
        customerNotes: customerNotes ? String(customerNotes).trim() : null,
        items: {
          create: computedOrderItems,
        },
      },
      include: {
        table: {
          select: { id: true, tableNumber: true },
        },
        items: {
          include: {
            menuItem: {
              select: { name: true, imageUrl: true, isVeg: true },
            },
          },
        },
      },
    });

    await prisma.restaurantTable.update({
      where: { id: table.id },
      data: { status: 'OCCUPIED' },
    });

    // Real-Time WebSocket Notification
    notifyKitchenOrderUpdate('new_order', {
      id: newOrder.id,
      orderNumber: newOrder.orderNumber,
      tableId: newOrder.table.id,
      tableNumber: newOrder.table.tableNumber,
      status: newOrder.status,
      customerName: newOrder.customerName,
      customerMobile: newOrder.customerMobile,
      totalAmount: newOrder.totalAmount,
      items: newOrder.items,
      createdAt: newOrder.createdAt,
    });

    res.status(201).json({
      success: true,
      order: {
        id: newOrder.id,
        orderNumber: newOrder.orderNumber,
        tableNumber: newOrder.table.tableNumber,
        status: newOrder.status,
        subtotalAmount: newOrder.subtotalAmount,
        taxesAndCharges: newOrder.taxesAndCharges,
        totalAmount: newOrder.totalAmount,
        trackingToken: newOrder.trackingToken,
        prepTimeMinutes: maxPrepTime,
        createdAt: newOrder.createdAt,
        itemsCount: newOrder.items.length,
      },
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to process order. Please try again.' });
  }
});

// GET /api/orders/reorder-lookup?mobile=+919876543210 - Lookup previous orders by phone
router.get('/reorder-lookup', async (req: Request, res: Response): Promise<void> => {
  try {
    const mobile = req.query.mobile ? String(req.query.mobile).trim() : undefined;
    if (!mobile) {
      res.status(400).json({ error: 'Mobile number query param is required.' });
      return;
    }

    const pastOrders = await prisma.order.findMany({
      where: { customerMobile: mobile },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    res.json({ success: true, pastOrders });
  } catch (error) {
    console.error('Reorder lookup error:', error);
    res.status(500).json({ error: 'Failed to fetch reorder history' });
  }
});

// GET /api/orders/:id - Get live tracking information for an order
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!id) {
      res.status(400).json({ error: 'Order ID is required.' });
      return;
    }

    const headerToken = req.headers['x-tracking-token'];
    const queryToken = req.query.token;
    const trackingToken = (
      typeof headerToken === 'string'
        ? headerToken
        : Array.isArray(headerToken)
        ? headerToken[0]
        : typeof queryToken === 'string'
        ? queryToken
        : undefined
    );

    if (!trackingToken) {
      res.status(401).json({ error: 'Unauthorized: Order tracking token required.' });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        table: {
          select: { id: true, tableNumber: true },
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

    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    if (order.trackingToken !== trackingToken) {
      res.status(403).json({ error: 'Forbidden: Invalid tracking token for this order.' });
      return;
    }

    const maxPrepTime = Math.max(
      15,
      ...order.items.map((i: any) => i.menuItem?.prepTimeMinutes || 15)
    );

    res.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        tableId: order.table.id,
        tableNumber: order.table.tableNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        subtotalAmount: order.subtotalAmount,
        taxesAndCharges: order.taxesAndCharges,
        totalAmount: order.totalAmount,
        customerNotes: order.customerNotes,
        chefAssigned: order.chefAssigned,
        acceptedAt: order.acceptedAt,
        cookingAt: order.cookingAt,
        readyAt: order.readyAt,
        servedAt: order.servedAt,
        feedbackRating: order.feedbackRating,
        feedbackComment: order.feedbackComment,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        prepTimeMinutes: maxPrepTime,
        items: order.items.map((item: any) => ({
          id: item.id,
          name: item.menuItem.name,
          imageUrl: item.menuItem.imageUrl,
          isVeg: item.menuItem.isVeg,
          addedByName: item.addedByName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          addons: item.addonsJson ? JSON.parse(item.addonsJson) : [],
          subtotal: item.subtotal,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching order status:', error);
    res.status(500).json({ error: 'Internal server error while tracking order' });
  }
});

// POST /api/orders/:id/call-waiter - Alert waiter from table
router.post('/:id/call-waiter', async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : (idParam as string);
    const order = await prisma.order.findUnique({
      where: { id },
      include: { table: true },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const call = await prisma.tableCall.create({
      data: {
        restaurantId: order.restaurantId,
        tableId: order.tableId,
        type: req.body.type || 'WAITER',
        guestName: order.customerName || 'Guest',
      },
      include: { table: true },
    });

    notifyKitchenOrderUpdate('waiter_call', {
      id: call.id,
      tableNumber: call.table.tableNumber,
      type: call.type,
      guestName: call.guestName,
      createdAt: call.createdAt,
    });

    res.json({ success: true, call });
  } catch (error) {
    console.error('Call waiter error:', error);
    res.status(500).json({ error: 'Failed to call waiter' });
  }
});

// POST /api/orders/:id/pay - In-app payment endpoint
router.post('/:id/pay', async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : (idParam as string);
    const { paymentMethod, splitType, paidAmount } = req.body;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        paymentStatus: 'PAID',
        paymentMethod: paymentMethod || 'UPI',
      },
    });

    notifyKitchenOrderUpdate('order_paid', {
      id: updated.id,
      orderNumber: updated.orderNumber,
      paymentMethod: updated.paymentMethod,
      totalAmount: updated.totalAmount,
    });

    res.json({ success: true, order: updated });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

// PUT /api/orders/:id/status - Update order status (used by admin, kitchen, waiter)
router.put('/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : (idParam as string);


    if (!id) {
      res.status(400).json({ error: 'Order ID is required.' });
      return;
    }

    const { status, chefAssigned } = req.body;

    const validStatuses = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'CANCELLED'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const now = new Date();
    const updateData: any = { status };
    if (chefAssigned) updateData.chefAssigned = chefAssigned;

    if (status === 'ACCEPTED') updateData.acceptedAt = now;
    if (status === 'PREPARING') updateData.cookingAt = now;
    if (status === 'READY') updateData.readyAt = now;
    if (status === 'SERVED') updateData.servedAt = now;

    const updated = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        table: { select: { id: true, tableNumber: true } },
      },
    });

    // Real-Time WebSocket Broadcast to all subscribers
    notifyKitchenOrderUpdate('order_status_updated', {
      id: updated.id,
      orderNumber: updated.orderNumber,
      tableId: updated.table.id,
      tableNumber: updated.table.tableNumber,
      status: updated.status,
      chefAssigned: updated.chefAssigned,
      acceptedAt: updated.acceptedAt,
      cookingAt: updated.cookingAt,
      readyAt: updated.readyAt,
      servedAt: updated.servedAt,
      updatedAt: updated.updatedAt,
    });

    res.json({ success: true, order: updated });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// POST /api/orders/:id/feedback - Customer feedback and rating
router.post('/:id/feedback', async (req: Request, res: Response): Promise<void> => {
  try {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : (idParam as string);
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'Rating must be between 1 and 5.' });
      return;
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        feedbackRating: Number(rating),
        feedbackComment: comment ? String(comment).trim() : null,
      },
    });

    res.json({ success: true, order: { feedbackRating: updated.feedbackRating, feedbackComment: updated.feedbackComment } });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

export default router;

