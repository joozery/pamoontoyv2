import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';

// Import database connection
import { testConnection } from './config/database.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import bidRoutes from './routes/bidRoutes.js';
import adminUserRoutes from './routes/adminUserRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import discountRoutes from './routes/discountRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

// Import jobs
import { startAuctionEndJob, checkEndedAuctions, autoExtendAuctions } from './jobs/auctionEndJob.js';
import { startScheduler } from './schedulers/publishScheduledProducts.js';
import { socketScheduler } from './schedulers/socketScheduler.js';

// Import WebSocket
import { initializeSocket } from './socket/auctionSocket.js';

// Load environment variables
dotenv.config({ path: './config.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy - important for rate limiting behind Nginx
app.set('trust proxy', 1); // Only trust first proxy (Nginx)

// Security middleware
app.use(helmet());

// CORS configuration - Disabled (handled by Nginx)
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// Rate limiting - More permissive for production use
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 1 * 60 * 1000, // 1 minute (shorter window)
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 200, // 200 requests per minute (high limit)
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true, // ✅ Enable trust proxy for rate limiter
  skip: (req) => {
    // Skip rate limiting for:
    // - Health checks
    // - Static assets
    // - Common API endpoints that need high frequency
    return req.path === '/health' || 
           req.path.startsWith('/uploads/') ||
           req.path === '/api/products' ||
           req.path === '/api/favorites';
  }
});

// Apply rate limiter only to sensitive endpoints
app.use('/api/auth', limiter); // Only limit auth endpoints

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Pamoontoy Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/admin', adminUserRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/reviews', reviewRoutes);

// LINE Webhook for automatic admin registration
app.post('/webhook/line', async (req, res) => {
  try {
    const events = req.body.events || [];
    
    for (const event of events) {
      // Handle join event (bot added to group)
      if (event.type === 'join') {
        if (event.source.type === 'group') {
          const groupId = event.source.groupId;
          console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('🎉 Bot joined a group!');
          console.log('📋 Group ID:', groupId);
          console.log('💡 Add this to config.env:');
          console.log(`   LINE_GROUP_ID=${groupId}`);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        }
      }
      
      // Handle message events
      if (event.type === 'message' && event.message.type === 'text') {
        const sourceType = event.source.type; // user or group
        const lineUserId = event.source.userId;
        const groupId = event.source.groupId;
        const messageText = event.message.text.trim().toLowerCase();
        
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📲 LINE Event Type:', event.type);
        console.log('📍 Source Type:', sourceType);
        if (sourceType === 'group') {
          console.log('👥 Group ID:', groupId);
        }
        console.log('👤 LINE User ID:', lineUserId);
        console.log('💬 Message:', event.message.text);
        console.log('🕐 Timestamp:', new Date(event.timestamp).toLocaleString('th-TH'));
        
        // Check if message is a registration command: "register EMAIL"
        if (messageText.startsWith('register ')) {
          const email = messageText.replace('register ', '').trim();
          
          try {
            // Check if admin exists
            const [admins] = await pool.query(
              'SELECT id, name, email, role FROM users WHERE email = ? AND role = ?',
              [email, 'admin']
            );
            
            if (admins.length > 0) {
              const admin = admins[0];
              
              // Update LINE User ID
              await pool.query(
                'UPDATE users SET line_user_id = ? WHERE id = ?',
                [lineUserId, admin.id]
              );
              
              console.log(`✅ Registered LINE ID for admin: ${admin.name} (${admin.email})`);
            } else {
              console.log('❌ Email not found or not an admin account');
            }
          } catch (dbError) {
            console.error('❌ Database error:', dbError);
          }
        } else if (messageText === 'getgroupid' && sourceType === 'group') {
          // Show group ID when requested
          console.log(`💡 Group ID: ${groupId}`);
        } else {
          console.log('💡 Commands:');
          console.log('   - register YOUR_ADMIN_EMAIL');
          console.log('   - getgroupid (in group chat)');
        }
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      }
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('LINE Webhook error:', error);
    res.status(200).json({ success: true }); // Always return 200 to LINE
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // Handle specific error types
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format'
    });
  }
  
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Request entity too large'
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Server will not start.');
      process.exit(1);
    }

    // Start HTTP server with WebSocket
    const httpServer = createServer(app);
    
    // Initialize WebSocket
    const io = initializeSocket(httpServer);
    
    // ✅ ส่ง io instance ให้ socketScheduler
    socketScheduler.setIO(io);
    
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log('🚀 Pamoontoy Backend Server Started');
      console.log(`📡 Server running on: http://0.0.0.0:${PORT}`);
      console.log(`🔌 WebSocket running on: ws://0.0.0.0:${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
      console.log('📋 Available endpoints:');
      console.log('   GET  /health - Health check');
      console.log('   POST /api/auth/register - User registration');
      console.log('   POST /api/auth/login - User login');
      console.log('   GET  /api/products - Get products');
      console.log('   POST /api/bids - Place bid');
      console.log('   WS   /socket.io - Real-time updates');
      
      // ✅ Start auction jobs
      console.log('\n🔄 Starting background jobs...');
      startAuctionEndJob();
      startScheduler(); // Start scheduled products publisher (legacy)
      socketScheduler.start(); // Start Socket-based scheduler
      
      // ✅ Run immediately on startup
      console.log('🔍 Running initial checks...');
      autoExtendAuctions();
      checkEndedAuctions();
      console.log('   ... and more');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

export default app;

