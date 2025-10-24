import express from 'express';
import { auth } from '../middleware/auth.js';
import { pool } from '../config/database.js';

const router = express.Router();

// Get user's favorites
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [favorites] = await pool.query(`
      SELECT 
        f.*,
        p.id as product_exists,
        p.name,
        p.description,
        p.current_price,
        p.starting_price,
        p.buy_now_price,
        p.images,
        p.image_url,
        p.auction_start,
        p.auction_end,
        p.status,
        p.condition_status,
        p.seller_id,
        u.name as seller_name
      FROM favorites f
      LEFT JOIN products p ON f.product_id = p.id
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `, [userId]);
    
    // Filter out favorites where product no longer exists
    const validFavorites = favorites.filter(fav => fav.product_exists !== null);
    
    // Clean up invalid favorites (products that were deleted)
    const invalidFavorites = favorites.filter(fav => fav.product_exists === null);
    if (invalidFavorites.length > 0) {
      const invalidIds = invalidFavorites.map(fav => fav.product_id);
      await pool.query(
        `DELETE FROM favorites WHERE user_id = ? AND product_id IN (?)`,
        [userId, invalidIds]
      );
      console.log(`🧹 Cleaned up ${invalidFavorites.length} invalid favorites for user ${userId}`);
    }
    
    res.json({
      success: true,
      data: validFavorites
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching favorites',
      error: error.message
    });
  }
});

// Add to favorites
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id } = req.body;
    
    console.log('📝 Add favorite request:', { userId, product_id, body: req.body });
    
    // Check if already favorited
    const [existing] = await pool.query(
      'SELECT id FROM favorites WHERE user_id = ? AND product_id = ?',
      [userId, product_id]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Product already in favorites'
      });
    }
    
    // Add to favorites
    await pool.query(
      'INSERT INTO favorites (user_id, product_id) VALUES (?, ?)',
      [userId, product_id]
    );
    
    res.status(201).json({
      success: true,
      message: 'Added to favorites'
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding favorite',
      error: error.message
    });
  }
});

// Remove from favorites
router.delete('/:product_id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id } = req.params;
    
    await pool.query(
      'DELETE FROM favorites WHERE user_id = ? AND product_id = ?',
      [userId, product_id]
    );
    
    res.json({
      success: true,
      message: 'Removed from favorites'
    });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing favorite',
      error: error.message
    });
  }
});

export default router;

