import express from 'express';
import { auth, adminOnly } from '../middleware/auth.js';
import { pool } from '../config/database.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    // Get total users
    const [userCount] = await pool.query('SELECT COUNT(*) as total FROM users WHERE role != ?', ['admin']);
    
    // Get total products
    const [productCount] = await pool.query('SELECT COUNT(*) as total FROM products');
    
    // Get active products
    const [activeProductCount] = await pool.query('SELECT COUNT(*) as total FROM products WHERE status = ?', ['active']);
    
    // Get total bids
    const [bidCount] = await pool.query('SELECT COUNT(*) as total FROM bids');
    
    // Get total orders
    const [orderCount] = await pool.query('SELECT COUNT(*) as total FROM orders');
    
    // Get pending orders
    const [pendingOrderCount] = await pool.query('SELECT COUNT(*) as total FROM orders WHERE status = ?', ['pending']);
    
    // Get completed orders
    const [completedOrderCount] = await pool.query('SELECT COUNT(*) as total FROM orders WHERE status IN (?, ?, ?, ?)', ['completed', 'shipped', 'delivered', 'paid']);
    
    // Get total revenue
    const [revenueResult] = await pool.query(`
      SELECT SUM(total_amount) as total_revenue 
      FROM orders 
      WHERE status IN ('completed', 'shipped', 'delivered', 'paid')
    `);
    
    // Get recent users (last 7 days)
    const [recentUsers] = await pool.query(`
      SELECT COUNT(*) as total 
      FROM users 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND role != ?
    `, ['admin']);
    
    // Get recent products (last 7 days)
    const [recentProducts] = await pool.query(`
      SELECT COUNT(*) as total 
      FROM products 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);
    
    // Get recent orders (last 7 days)
    const [recentOrders] = await pool.query(`
      SELECT COUNT(*) as total 
      FROM orders 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    res.json({
      success: true,
      data: {
        users: {
          total: userCount[0].total,
          recent: recentUsers[0].total
        },
        products: {
          total: productCount[0].total,
          active: activeProductCount[0].total,
          recent: recentProducts[0].total
        },
        bids: {
          total: bidCount[0].total
        },
        orders: {
          total: orderCount[0].total,
          pending: pendingOrderCount[0].total,
          completed: completedOrderCount[0].total,
          recent: recentOrders[0].total
        },
        revenue: {
          total: revenueResult[0].total_revenue || 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
});

// Get recent activities
router.get('/activities', auth, adminOnly, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Get recent users
    const [recentUsers] = await pool.query(`
      SELECT id, name, email, created_at, 'user' as type
      FROM users 
      WHERE role != 'admin'
      ORDER BY created_at DESC 
      LIMIT ?
    `, [parseInt(limit)]);
    
    // Get recent products
    const [recentProducts] = await pool.query(`
      SELECT p.id, p.name, p.current_price, p.status, p.created_at, 'product' as type
      FROM products p
      ORDER BY p.created_at DESC 
      LIMIT ?
    `, [parseInt(limit)]);
    
    // Get recent orders
    const [recentOrders] = await pool.query(`
      SELECT o.id, o.order_number, o.total_amount, o.status, o.created_at, 'order' as type
      FROM orders o
      ORDER BY o.created_at DESC 
      LIMIT ?
    `, [parseInt(limit)]);
    
    // Get recent bids
    const [recentBids] = await pool.query(`
      SELECT b.id, b.bid_amount, b.bid_time, p.name as product_name, u.name as bidder_name, 'bid' as type
      FROM bids b
      LEFT JOIN products p ON b.product_id = p.id
      LEFT JOIN users u ON b.user_id = u.id
      ORDER BY b.bid_time DESC 
      LIMIT ?
    `, [parseInt(limit)]);
    
    // Combine and sort all activities
    const activities = [
      ...recentUsers.map(user => ({ ...user, activity: 'registered' })),
      ...recentProducts.map(product => ({ ...product, activity: 'product_created' })),
      ...recentOrders.map(order => ({ ...order, activity: 'order_created' })),
      ...recentBids.map(bid => ({ ...bid, activity: 'bid_placed' }))
    ].sort((a, b) => new Date(b.created_at || b.bid_time) - new Date(a.created_at || a.bid_time))
     .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activities',
      error: error.message
    });
  }
});

// Get sales chart data
router.get('/sales-chart', auth, adminOnly, async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let dateFormat, interval;
    switch (period) {
      case '7d':
        dateFormat = '%Y-%m-%d';
        interval = '1 DAY';
        break;
      case '30d':
        dateFormat = '%Y-%m-%d';
        interval = '1 DAY';
        break;
      case '12m':
        dateFormat = '%Y-%m';
        interval = '1 MONTH';
        break;
      default:
        dateFormat = '%Y-%m-%d';
        interval = '1 DAY';
    }
    
    const intervalDays = period === '7d' ? 7 : period === '30d' ? 30 : 365;
    const [salesData] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, ?) as date,
        COUNT(*) as orders,
        SUM(total_amount) as revenue
      FROM orders 
      WHERE status IN ('completed', 'shipped', 'delivered', 'paid')
        AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE_FORMAT(created_at, ?)
      ORDER BY date ASC
    `, [dateFormat, intervalDays, dateFormat]);

    res.json({
      success: true,
      data: salesData
    });
  } catch (error) {
    console.error('Error fetching sales chart:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales chart data',
      error: error.message
    });
  }
});

// Get top products
router.get('/top-products', auth, adminOnly, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const [topProducts] = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.current_price,
        p.bid_count,
        p.view_count,
        p.status,
        pi.cloudinary_url as image_url
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
      ORDER BY p.bid_count DESC, p.view_count DESC
      LIMIT ?
    `, [parseInt(limit)]);

    res.json({
      success: true,
      data: topProducts
    });
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching top products',
      error: error.message
    });
  }
});

// Get latest orders
router.get('/latest-orders', auth, adminOnly, async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const [orders] = await pool.query(`
      SELECT 
        o.id,
        o.order_number,
        o.total_amount,
        o.status,
        o.created_at,
        u.name as customer_name,
        p.name as product_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN products p ON o.product_id = p.id
      ORDER BY o.created_at DESC
      LIMIT ?
    `, [parseInt(limit)]);

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching latest orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching latest orders',
      error: error.message
    });
  }
});

// Get popular products (by revenue)
router.get('/popular-products', auth, adminOnly, async (req, res) => {
  try {
    const { limit = 4 } = req.query;
    
    const [products] = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.current_price,
        p.bid_count,
        p.view_count,
        p.status,
        pi.cloudinary_url as image_url,
        COALESCE(SUM(o.total_amount), 0) as total_revenue,
        COUNT(o.id) as order_count
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
      LEFT JOIN orders o ON p.id = o.product_id AND o.status IN ('completed', 'shipped', 'delivered', 'paid')
      GROUP BY p.id, p.name, p.current_price, p.bid_count, p.view_count, p.status, pi.cloudinary_url
      ORDER BY total_revenue DESC, order_count DESC
      LIMIT ?
    `, [parseInt(limit)]);

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error fetching popular products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular products',
      error: error.message
    });
  }
});

// Get quick stats
router.get('/quick-stats', auth, adminOnly, async (req, res) => {
  try {
    // Get total reviews (if reviews table exists)
    const [reviewCount] = await pool.query(`
      SELECT COUNT(*) as total FROM reviews
    `).catch(() => [{ total: 0 }]);
    
    // Get average rating
    const [avgRating] = await pool.query(`
      SELECT AVG(rating) as average FROM reviews
    `).catch(() => [{ average: 0 }]);
    
    // Calculate growth rate (users this month vs last month)
    const [currentMonthUsers] = await pool.query(`
      SELECT COUNT(*) as count FROM users 
      WHERE created_at >= DATE_FORMAT(NOW(), '%Y-%m-01') AND role != 'admin'
    `);
    
    const [lastMonthUsers] = await pool.query(`
      SELECT COUNT(*) as count FROM users 
      WHERE created_at >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')
      AND created_at < DATE_FORMAT(NOW(), '%Y-%m-01') AND role != 'admin'
    `);
    
    const currentCount = currentMonthUsers[0].count;
    const lastCount = lastMonthUsers[0].count;
    const growthRate = lastCount > 0 ? ((currentCount - lastCount) / lastCount) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalReviews: reviewCount[0].total,
        averageRating: avgRating[0].average || 0,
        growthRate: Math.round(growthRate * 10) / 10
      }
    });
  } catch (error) {
    console.error('Error fetching quick stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quick stats',
      error: error.message
    });
  }
});

export default router;
