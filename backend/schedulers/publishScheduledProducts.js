import { execute } from '../config/database.js';

export const startScheduler = () => {
  console.log('⏰ Starting legacy scheduler (backup)...');
  
  // Run every 1 minute (backup for socketScheduler)
  setInterval(async () => {
    try {
      const now = new Date();
      
      const query = `
        SELECT id, name 
        FROM products 
        WHERE status = 'scheduled' 
        AND scheduled_publish_at IS NOT NULL 
        AND scheduled_publish_at <= ?
      `;
      
      const [products] = await execute(query, [now]);
      
      if (products.length === 0) {
        console.log(`⏰ No products to publish at ${now.toISOString()}`);
        return;
      }

      console.log(`📦 Legacy scheduler: Found ${products.length} products to publish`);

      for (const product of products) {
        await execute(
          'UPDATE products SET status = ? WHERE id = ?',
          ['active', product.id]
        );
        console.log(`✅ Legacy: Published product ${product.id}`);
      }

    } catch (error) {
      console.error('❌ Legacy scheduler error:', error);
    }
  }, 60000); // 1 minute
};

export default startScheduler;
