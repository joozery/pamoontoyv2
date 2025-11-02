import { execute, getConnection, pool } from '../config/database.js';
import { emitNewBid } from '../socket/auctionSocket.js';

// Place a bid
const placeBid = async (req, res) => {
  const connection = await getConnection();
  
  try {
    await connection.beginTransaction();

    const { productId } = req.params;
    const { bidAmount, amount } = req.body;
    const finalBidAmount = bidAmount || amount; // Support both field names
    const userId = req.user.id; // From auth middleware
    
    console.log('📝 Place bid request:', { productId, bidAmount, amount, finalBidAmount, userId });

    // Get product details
    const [products] = await pool.query(`
      SELECT * FROM products WHERE id = ? AND status = 'active'
    `, [productId]);

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or not available for bidding'
      });
    }

    const product = products[0];

    // Check if auction is still active
    const now = new Date();
    
    // ✅ แปลง auction_end เป็น JavaScript Date (รองรับทุก format)
    let auctionEnd = null;
    if (product.auction_end) {
      try {
        // ถ้าเป็น Date object อยู่แล้ว
        if (product.auction_end instanceof Date) {
          auctionEnd = product.auction_end;
        } else {
          // แปลงเป็น string และ parse
          const auctionEndStr = product.auction_end.toString();
          
          // รองรับทั้ง ISO string และ MySQL datetime format
          const parsedStr = auctionEndStr.includes('T') 
            ? auctionEndStr  // ISO: 2025-10-24T07:25:00.000Z
            : auctionEndStr.replace(' ', 'T');  // MySQL: 2025-10-24 07:25:00
          
          auctionEnd = new Date(parsedStr);
        }
        
        // ตรวจสอบว่าเป็น valid date หรือไม่
        if (isNaN(auctionEnd.getTime())) {
          console.error('❌ Invalid auction_end:', {
            raw: product.auction_end,
            type: typeof product.auction_end,
            parsed: auctionEnd
          });
          auctionEnd = null;
        } else {
          // Debug log
          console.log('✅ Auction End Parse:', {
            raw: product.auction_end,
            type: typeof product.auction_end,
            parsed: auctionEnd.toISOString(),
            timestamp: auctionEnd.getTime()
          });
        }
      } catch (error) {
        console.error('❌ Error parsing auction_end:', error, product.auction_end);
        auctionEnd = null;
      }
    }
    
    // ✅ ไม่ต้องเช็คว่าหมดเวลาหรือยัง เพราะจะขยายเวลาอัตโนมัติ
    // เช็คแค่ว่า auction ยังเป็น 'active' อยู่หรือไม่
    if (product.status !== 'active') {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'Product is not available for bidding'
      });
    }

    // Get current highest bid
    const [currentBids] = await pool.query(`
      SELECT * FROM bids 
      WHERE product_id = ? 
      ORDER BY bid_amount DESC 
      LIMIT 1
    `, [productId]);

    const currentHighestBid = currentBids[0];

    // Check if bid amount is provided
    if (!finalBidAmount) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'Bid amount is required'
      });
    }

    // Validate bid amount
    const minBidAmount = currentHighestBid 
      ? parseFloat(currentHighestBid.bid_amount) + parseFloat(product.min_bid_increment || 20)
      : parseFloat(product.starting_price || product.start_price || 0);

    if (parseFloat(finalBidAmount) < minBidAmount) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: `Minimum bid amount is ${minBidAmount}`
      });
    }

    // Check if user is not bidding on their own product
    if (product.seller_id === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot bid on your own product'
      });
    }

    // Insert new bid
    await connection.execute(`
      INSERT INTO bids (product_id, user_id, bid_amount, is_winning)
      VALUES (?, ?, ?, TRUE)
    `, [productId, userId, finalBidAmount]);

    // Update previous winning bid to false
    if (currentHighestBid) {
      await connection.execute(`
        UPDATE bids SET is_winning = FALSE WHERE id = ?
      `, [currentHighestBid.id]);
    }

    // ✅ Auto-Extend: หมดเวลา → ต่ออัตโนมัติ 5 นาที (ต่อได้ไม่จำกัดถ้ามีคนบิด)
    let newAuctionEnd = auctionEnd;
    let timeExtended = false;
    
    console.log('📊 Auto-Extend Pre-Check:', {
      productId,
      hasAuctionEnd: !!auctionEnd,
      auctionEndRaw: product.auction_end,
      auctionEndParsed: auctionEnd ? auctionEnd.toISOString() : null
    });
    
    if (auctionEnd) {
      const fiveMinutesInMs = 5 * 60 * 1000; // 5 minutes
      const timeRemaining = auctionEnd - now; // milliseconds
      
      // 🔍 Debug: ตรวจสอบเวลา
      console.log('🕐 Rolling Extension Check:', {
        productId,
        now: now.toISOString(),
        auctionEnd: auctionEnd.toISOString(),
        timeRemainingMs: timeRemaining,
        timeRemainingSec: Math.floor(timeRemaining / 1000),
        willReset: timeRemaining < fiveMinutesInMs
      });
      
      // ✅ Rolling Extension: ถ้าเหลือเวลาน้อยกว่า 5 นาที → reset เป็น 5 นาทีใหม่เลย!
      if (timeRemaining < fiveMinutesInMs) {
        // Reset เป็น 5 นาทีเต็มจากตอนนี้
        newAuctionEnd = new Date(now.getTime() + fiveMinutesInMs);
        timeExtended = true;
        
        console.log('⏰ Rolling Extension: Reset to 5 minutes from now', {
          productId,
          oldEnd: auctionEnd.toISOString(),
          newEnd: newAuctionEnd.toISOString(),
          reason: timeRemaining < 0 
            ? 'Already ended' 
            : `Less than 5 min (${Math.floor(timeRemaining/1000)}s remaining)`
        });
        
        // Update auction_end time
        await connection.execute(`
          UPDATE products 
          SET current_price = ?, 
              bid_count = bid_count + 1,
              auction_end = ?
          WHERE id = ?
        `, [finalBidAmount, newAuctionEnd, productId]);
      } else {
        // เหลือเวลามากกว่า 5 นาที → อัพเดทราคาปกติ (ไม่ reset)
        console.log('✅ Bid placed, auction has plenty of time', {
          productId,
          timeRemaining: Math.floor(timeRemaining / 1000) + ' seconds'
        });
        
        await connection.execute(`
          UPDATE products 
          SET current_price = ?, bid_count = bid_count + 1
          WHERE id = ?
        `, [finalBidAmount, productId]);
      }
    } else {
      // No auction_end set, just update normally
      await connection.execute(`
        UPDATE products 
        SET current_price = ?, bid_count = bid_count + 1
        WHERE id = ?
      `, [finalBidAmount, productId]);
    }

    await connection.commit();

    // ✅ Emit WebSocket event ให้ทุกคนที่ดูสินค้านี้อยู่
    try {
      emitNewBid(productId, {
        productId,
        currentPrice: finalBidAmount,
        bidCount: product.bid_count + 1,
        bidderId: userId,
        timeExtended,
        newAuctionEnd: timeExtended ? newAuctionEnd.toISOString() : null
      });
    } catch (socketError) {
      console.error('Error emitting WebSocket event:', socketError);
      // ไม่ throw error เพราะ bid สำเร็จแล้ว
    }

    res.json({
      success: true,
      message: timeExtended ? 'Bid placed successfully. Auction time extended by 5 minutes!' : 'Bid placed successfully',
      data: {
        bidAmount: finalBidAmount,
        isWinning: true,
        timeExtended,
        newAuctionEnd: timeExtended ? newAuctionEnd.toISOString() : null
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error placing bid:', error);
    res.status(500).json({
      success: false,
      message: 'Error placing bid',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Get bids for a product
const getProductBids = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    const [bids] = await pool.query(`
      SELECT 
        b.*,
        u.name as bidder_name,
        u.avatar_url as bidder_avatar
      FROM bids b
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.product_id = ?
      ORDER BY b.bid_amount DESC, b.bid_time DESC
      LIMIT ? OFFSET ?
    `, [productId, parseInt(limit), offset]);

    // Get total count
    const [countResult] = await pool.query(`
      SELECT COUNT(*) as total FROM bids WHERE product_id = ?
    `, [productId]);

    const total = countResult[0].total;

    res.json({
      success: true,
      data: bids,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error getting bids:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bids',
      error: error.message
    });
  }
};

// Get user's bids
const getUserBids = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    const [bids] = await pool.query(`
      SELECT 
        b.*,
        p.name as product_name,
        p.current_price,
        p.auction_end as auction_end_time,
        p.status as product_status,
        COALESCE(pi.cloudinary_url, p.image_url) as product_image
      FROM (
        SELECT 
          b1.*,
          ROW_NUMBER() OVER (PARTITION BY b1.product_id ORDER BY b1.bid_time DESC) as rn
        FROM bids b1
        WHERE b1.user_id = ?
      ) b
      LEFT JOIN products p ON b.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
      WHERE b.rn = 1
      ORDER BY b.bid_time DESC
      LIMIT ? OFFSET ?
    `, [userId, parseInt(limit), offset]);

    // Get total count (unique products only)
    const [countResult] = await pool.query(`
      SELECT COUNT(DISTINCT product_id) as total FROM bids WHERE user_id = ?
    `, [userId]);

    const total = countResult[0].total;

    res.json({
      success: true,
      data: bids,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error getting user bids:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user bids',
      error: error.message
    });
  }
};

// Buy now (immediate purchase)
const buyNow = async (req, res) => {
  const connection = await getConnection();
  
  try {
    await connection.beginTransaction();

    const { productId } = req.params;
    const userId = req.user.id;

    // Get product details
    const [products] = await pool.query(`
      SELECT * FROM products WHERE id = ? AND status = 'active'
    `, [productId]);

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or not available'
      });
    }

    const product = products[0];

    // Check if product has buy now price
    if (!product.buy_now_price) {
      return res.status(400).json({
        success: false,
        message: 'This product does not have a buy now option'
      });
    }

    // Check if user is not buying their own product
    if (product.seller_id === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot buy your own product'
      });
    }

    // Update product status to sold
    await connection.execute(`
      UPDATE products 
      SET status = 'sold', current_price = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [product.buy_now_price, productId]);

    // Create a "bid" record for the buy now purchase
    const [bidResult] = await connection.execute(`
      INSERT INTO bids (product_id, user_id, bid_amount, is_winning)
      VALUES (?, ?, ?, TRUE)
    `, [productId, userId, product.buy_now_price]);

    // Create order automatically
    // Generate unique order number
    const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    const [orderResult] = await connection.execute(`
      INSERT INTO orders (
        order_number, user_id, product_id, bid_id, total_amount, shipping_fee, status, shipping_address
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', 'ที่อยู่จะถูกกรอกภายหลัง')
    `, [orderNumber, userId, productId, bidResult.insertId, product.buy_now_price, product.shipping_cost || 0]);

    await connection.commit();

    res.json({
      success: true,
      message: 'Product purchased successfully',
      data: {
        productId,
        orderId: orderResult.insertId,
        price: product.buy_now_price,
        purchaseTime: new Date()
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error buying product:', error);
    res.status(500).json({
      success: false,
      message: 'Error purchasing product',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

export {
  placeBid,
  getProductBids,
  getUserBids,
  buyNow
};
