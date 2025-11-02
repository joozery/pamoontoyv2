import { execute } from '../config/database.js';

class SocketScheduler {
  constructor() {
    this.scheduledProducts = new Map(); // productId -> { scheduledTime, productData }
    this.checkInterval = null;
    this.isRunning = false;
    this.io = null; // Will be set by server.js
  }

  start() {
    if (this.isRunning) return;
    
    console.log('🚀 Starting Socket-based Scheduler...');
    this.isRunning = true;
    
    // ตรวจสอบทุก 10 วินาที (แม่นยำกว่า 1 นาที)
    this.checkInterval = setInterval(() => {
      this.checkScheduledProducts();
    }, 10000); // 10 seconds

    // ตรวจสอบทันทีเมื่อเริ่มต้น
    this.checkScheduledProducts();
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('⏹️ Socket-based Scheduler stopped');
  }

  async checkScheduledProducts() {
    try {
      const now = new Date();
      
      // หาสินค้าที่ถึงเวลาโพสต์
      const query = `
        SELECT id, name, status, scheduled_publish_at, auction_start, auction_end
        FROM products 
        WHERE status = 'scheduled' 
        AND scheduled_publish_at IS NOT NULL 
        AND scheduled_publish_at <= ?
        ORDER BY scheduled_publish_at ASC
      `;
      
      const [products] = await execute(query, [now]);
      
      if (products.length === 0) {
        return;
      }

      console.log(`📦 Found ${products.length} products ready to publish`);

      // อัปเดต status เป็น active
      for (const product of products) {
        await this.publishProduct(product);
      }

    } catch (error) {
      console.error('❌ Error checking scheduled products:', error);
    }
  }

  async publishProduct(product) {
    try {
      // อัปเดต status เป็น active
      await execute(
        'UPDATE products SET status = ? WHERE id = ?',
        ['active', product.id]
      );

      console.log(`✅ Published product: ${product.name} (ID: ${product.id})`);

      // ส่ง notification ผ่าน Socket.IO
      if (this.io) {
        this.io.emit('product_published', {
          productId: product.id,
          productName: product.name,
          publishedAt: new Date().toISOString(),
          message: `สินค้า "${product.name}" ได้ถูกโพสต์แล้ว`
        });
      }

      // อัปเดต frontend ทันที
      if (this.io) {
        this.io.emit('products_updated', {
          type: 'product_published',
          productId: product.id
        });
      }

    } catch (error) {
      console.error(`❌ Error publishing product ${product.id}:`, error);
    }
  }

  // ฟังก์ชันสำหรับเพิ่มสินค้าใหม่ที่ต้อง schedule
  scheduleProduct(productId, scheduledTime, productData) {
    this.scheduledProducts.set(productId, {
      scheduledTime: new Date(scheduledTime),
      productData
    });
    
    console.log(`📅 Scheduled product ${productId} for ${scheduledTime}`);
  }

  // ฟังก์ชันสำหรับยกเลิกการ schedule
  unscheduleProduct(productId) {
    this.scheduledProducts.delete(productId);
    console.log(`❌ Unscheduled product ${productId}`);
  }

  // ฟังก์ชันสำหรับตั้งค่า io instance
  setIO(ioInstance) {
    this.io = ioInstance;
    console.log('✅ Socket.IO instance set for SocketScheduler');
  }
}

// สร้าง instance เดียว
const socketScheduler = new SocketScheduler();

export { socketScheduler };
export default socketScheduler;
