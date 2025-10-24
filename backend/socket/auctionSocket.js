import { Server } from 'socket.io';

let io = null;

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    // Join auction room
    socket.on('join_auction', (productId) => {
      const room = `auction_${productId}`;
      socket.join(room);
      console.log(`👤 User ${socket.id} joined ${room}`);
    });

    // Leave auction room
    socket.on('leave_auction', (productId) => {
      const room = `auction_${productId}`;
      socket.leave(room);
      console.log(`👋 User ${socket.id} left ${room}`);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id);
    });
  });

  console.log('✅ WebSocket server initialized');
  return io;
};

// Emit new bid to all users in auction room
export const emitNewBid = (productId, data) => {
  if (!io) return;
  
  const room = `auction_${productId}`;
  io.to(room).emit('new_bid', data);
  console.log(`📢 Emitted new bid to ${room}:`, data);
};

// Emit auction time extended
export const emitAuctionExtended = (productId, newAuctionEnd) => {
  if (!io) return;
  
  const room = `auction_${productId}`;
  io.to(room).emit('auction_extended', {
    productId,
    newAuctionEnd
  });
  console.log(`⏰ Emitted auction extended to ${room}:`, newAuctionEnd);
};

// Emit auction ended
export const emitAuctionEnded = (productId, winnerId) => {
  if (!io) return;
  
  const room = `auction_${productId}`;
  io.to(room).emit('auction_ended', {
    productId,
    winnerId
  });
  console.log(`🏁 Emitted auction ended to ${room}`);
};

export const getIO = () => io;



