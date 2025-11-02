import { pool } from '../config/database.js';
import cron from 'node-cron';
import { emitAuctionExtended } from '../socket/auctionSocket.js';

// ✅ Auto-extend auctions that just ended (ขยายเวลาอัตโนมัติทันทีที่หมด)
export const autoExtendAuctions = async () => {
  try {
    console.log('⏰ Checking for auctions to auto-extend...');
    
    // หาสินค้าที่เพิ่งหมดเวลา (ภายใน 2 นาที) และมี bid อยู่
    const [endedAuctions] = await pool.query(`
      SELECT 
        p.id as product_id,
        p.name as product_name,
        p.auction_end,
        p.auction_start,
        p.bid_count,
        COUNT(b.id) as total_bids,
        MAX(b.bid_time) as last_bid_time
      FROM products p
      LEFT JOIN bids b ON p.id = b.product_id
      WHERE p.status = 'active'
        AND p.auction_end IS NOT NULL
        AND p.auction_end <= NOW()
        AND p.auction_end >= DATE_SUB(NOW(), INTERVAL 2 MINUTE)
      GROUP BY p.id
      HAVING total_bids > 0
    `);
    
    if (endedAuctions.length === 0) {
      console.log('✅ No auctions to extend');
      return;
    }
    
    console.log(`🔄 Found ${endedAuctions.length} auctions to check`);
    
    // ตรวจสอบแต่ละประมูล
    for (const auction of endedAuctions) {
      try {
        const now = new Date();
        const auctionEnd = new Date(auction.auction_end);
        const lastBidTime = auction.last_bid_time ? new Date(auction.last_bid_time) : null;
        
        // คำนวณว่า bid สุดท้ายเกิดขึ้นก่อนหมดเวลากี่นาที
        const minutesSinceLastBid = lastBidTime ? 
          (auctionEnd - lastBidTime) / (1000 * 60) : Infinity;
        
        console.log(`🔍 Product ${auction.product_id}: Last bid was ${minutesSinceLastBid.toFixed(1)} minutes before auction end`);
        
        // ✅ เงื่อนไข: ถ้า bid สุดท้ายเกิดก่อนหมดเวลา > 5 นาที → ไม่ต่อเวลา ปิดเลย
        if (minutesSinceLastBid > 5) {
          console.log(`❌ No bids in last 5 minutes for product ${auction.product_id} - Closing auction`);
          // ไม่ต่อเวลา ให้ job checkEndedAuctions สร้าง order ต่อ
          continue;
        }
        
        // ✅ ถ้า bid สุดท้ายอยู่ใน 5 นาทีสุดท้าย → ต่อเวลา +5 นาที
        const newAuctionEnd = new Date(Date.now() + 5 * 60 * 1000); // +5 minutes from now
        
        await pool.query(
          'UPDATE products SET auction_end = ? WHERE id = ?',
          [newAuctionEnd, auction.product_id]
        );
        
        console.log(`⏰ Extended auction for product ${auction.product_id} (${auction.product_name}) to ${newAuctionEnd.toISOString()}`);
        
        // ✅ Emit WebSocket event
        try {
          console.log(`📡 Attempting to emit auction_extended for product ${auction.product_id}`);
          emitAuctionExtended(auction.product_id, newAuctionEnd.toISOString());
          console.log(`✅ Successfully emitted auction_extended`);
        } catch (socketError) {
          console.error('❌ Error emitting socket event:', socketError);
        }
        
      } catch (error) {
        console.error(`❌ Error extending auction for product ${auction.product_id}:`, error);
      }
    }
    
  } catch (error) {
    console.error('❌ Error in autoExtendAuctions:', error);
  }
};

// ✅ Auto-create orders for ended auctions (ทันทีที่หมดเวลา)
export const checkEndedAuctions = async () => {
  try {
    console.log('🔍 Checking for ended auctions to close...');
    
    // หาสินค้าที่หมดเวลาประมูลแล้ว (เกิน 1 นาที เพื่อให้แน่ใจว่าไม่มีการต่อเวลา) แต่ยัง status = 'active'
    const [endedAuctions] = await pool.query(`
      SELECT 
        p.id as product_id,
        p.name as product_name,
        p.current_price,
        p.auction_end,
        b.user_id as winner_id,
        b.bid_amount as winning_bid,
        b.id as bid_id
      FROM products p
      LEFT JOIN bids b ON p.id = b.product_id AND b.is_winning = TRUE
      WHERE p.status = 'active'
        AND p.auction_end IS NOT NULL
        AND p.auction_end <= DATE_SUB(NOW(), INTERVAL 1 MINUTE)
        AND b.user_id IS NOT NULL
      ORDER BY p.auction_end ASC
    `);
    
    if (endedAuctions.length === 0) {
      console.log('✅ No ended auctions found');
      return;
    }
    
    console.log(`📦 Found ${endedAuctions.length} ended auctions`);
    
    // สร้าง Order สำหรับแต่ละประมูลที่สิ้นสุด
    for (const auction of endedAuctions) {
      try {
        // ตรวจสอบว่ามี Order อยู่แล้วหรือยัง
        const [existingOrders] = await pool.query(
          'SELECT id FROM orders WHERE product_id = ? AND user_id = ?',
          [auction.product_id, auction.winner_id]
        );
        
        if (existingOrders.length > 0) {
          console.log(`⏭️  Order already exists for product ${auction.product_id}`);
          continue;
        }
        
        // สร้าง Order Number
        const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
        
        // สร้าง Order
        const [result] = await pool.query(`
          INSERT INTO orders (
            order_number, 
            user_id, 
            product_id, 
            bid_id, 
            total_amount, 
            shipping_fee, 
            status, 
            shipping_address,
            created_at
          ) VALUES (?, ?, ?, ?, ?, ?, 'pending', 'ที่อยู่จะถูกกรอกภายหลัง', NOW())
        `, [
          orderNumber, 
          auction.winner_id, 
          auction.product_id, 
          auction.bid_id, 
          auction.winning_bid, 
          0 // shipping fee (จะกรอกทีหลัง)
        ]);
        
        // อัพเดทสถานะสินค้าเป็น 'sold'
        await pool.query(
          'UPDATE products SET status = ? WHERE id = ?',
          ['sold', auction.product_id]
        );
        
        console.log(`✅ Created order for product ${auction.product_id} (${auction.product_name}) - Winner: ${auction.winner_id}`);
        
      } catch (error) {
        console.error(`❌ Error creating order for product ${auction.product_id}:`, error);
      }
    }
    
  } catch (error) {
    console.error('❌ Error in checkEndedAuctions:', error);
  }
};

// ✅ Run jobs
export const startAuctionEndJob = () => {
  // 1. Auto-extend: เช็คทุก 1 นาที (ลด load)
  cron.schedule('*/1 * * * *', async () => {
    await autoExtendAuctions();
  });
  
  // 2. Create orders: เช็คทุก 1 นาที (เร็วขึ้นเพื่อสร้าง order เร็วขึ้น)
  cron.schedule('*/1 * * * *', async () => {
    await checkEndedAuctions();
  });
  
  console.log('✅ Auction jobs started:');
  console.log('   ⏰ Auto-extend: every 1 minute');
  console.log('   📦 Create orders: every 1 minute');
};

