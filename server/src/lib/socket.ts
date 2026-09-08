import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server | null = null;

export function initSocketServer(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`⚡ WebSocket client connected: ${socket.id}`);

    // Join channel rooms (kitchen, waiter, table:123, order:EP-1045)
    socket.on('join_room', (room: string) => {
      socket.join(room);
      console.log(`📌 Socket ${socket.id} joined room: ${room}`);
    });

    socket.on('leave_room', (room: string) => {
      socket.leave(room);
      console.log(`👋 Socket ${socket.id} left room: ${room}`);
    });

    // Customer calls waiter
    socket.on('call_waiter', (data: { tableId: string; tableNumber: string; guestName?: string; type?: string }) => {
      console.log(`🔔 Waiter call from ${data.tableNumber}`);
      io?.to('waiter').to('kitchen').emit('waiter_alert', {
        id: `call_${Date.now()}`,
        tableId: data.tableId,
        tableNumber: data.tableNumber,
        guestName: data.guestName || 'Guest',
        type: data.type || 'WAITER',
        timestamp: new Date().toISOString(),
      });
    });

    // Real-time shared cart item addition / update
    socket.on('cart_update', (data: { tableId: string; cart: any[] }) => {
      socket.to(`table:${data.tableId}`).emit('shared_cart_updated', data);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 WebSocket client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io has not been initialized!');
  }
  return io;
}

export function notifyKitchenOrderUpdate(event: string, payload: any) {
  if (io) {
    io.to('kitchen').emit(event, payload);
    io.to('waiter').emit(event, payload);
    if (payload?.tableId) {
      io.to(`table:${payload.tableId}`).emit(event, payload);
    }
    if (payload?.id || payload?.orderId) {
      io.to(`order:${payload.id || payload.orderId}`).emit(event, payload);
    }
  }
}
