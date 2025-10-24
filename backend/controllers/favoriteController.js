import { pool, getConnection } from '../config/database.js';

// Get user's favorites
export const getUserFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [favorites] = await pool.execute(`
      SELECT 
        f.id as favorite_id,
        f.created_at as favorited_at,
        p.id,
        p.name,
        p.description,
        p.starting_price,
        p.current_price,
        p.buy_now_price,
        p.image_url,
        p.images,
        p.condition_status,
        p.status,
        p.auction_start,
        p.auction_end,
        p.bid_count,
        p.view_count,
        p.category_id,
        u.name as seller_name
      FROM favorites f
      JOIN products p ON f.product_id = p.id
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `, [userId]);
    
    res.json({
      success: true,
      data: favorites
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching favorites',
      error: error.message
    });
  }
};

// Add to favorites
export const addFavorite = async (req, res) => {
  const connection = await getConnection();
  
  try {
    await connection.beginTransaction();
    
    const userId = req.user.id;
    const { product_id } = req.body;
    
    console.log('📝 Add favorite request:', { userId, product_id, body: req.body });
    
    if (!product_id) {
      await connection.rollback();
      connection.release();
      console.error('❌ Product ID is missing');
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    // Check if product exists
    const [products] = await connection.execute(
      'SELECT id FROM products WHERE id = ?',
      [product_id]
    );
    
    if (products.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check if already favorited
    const [existing] = await connection.execute(
      'SELECT id FROM favorites WHERE user_id = ? AND product_id = ?',
      [userId, product_id]
    );
    
    if (existing.length > 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'Product already in favorites'
      });
    }
    
    // Add to favorites
    await connection.execute(
      'INSERT INTO favorites (user_id, product_id) VALUES (?, ?)',
      [userId, product_id]
    );
    
    await connection.commit();
    connection.release();
    
    res.status(201).json({
      success: true,
      message: 'Added to favorites'
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Error adding favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding to favorites',
      error: error.message
    });
  }
};

// Remove from favorites
export const removeFavorite = async (req, res) => {
  const connection = await getConnection();
  
  try {
    await connection.beginTransaction();
    
    const userId = req.user.id;
    const { product_id } = req.params;
    
    // Check if exists
    const [existing] = await connection.execute(
      'SELECT id FROM favorites WHERE user_id = ? AND product_id = ?',
      [userId, product_id]
    );
    
    if (existing.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }
    
    // Remove from favorites
    await connection.execute(
      'DELETE FROM favorites WHERE user_id = ? AND product_id = ?',
      [userId, product_id]
    );
    
    await connection.commit();
    connection.release();
    
    res.json({
      success: true,
      message: 'Removed from favorites'
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Error removing favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing from favorites',
      error: error.message
    });
  }
};

// Check if product is favorited
export const checkFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id } = req.params;
    
    const [result] = await pool.execute(
      'SELECT id FROM favorites WHERE user_id = ? AND product_id = ?',
      [userId, product_id]
    );
    
    res.json({
      success: true,
      isFavorited: result.length > 0
    });
  } catch (error) {
    console.error('Error checking favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking favorite status',
      error: error.message
    });
  }
};

// Toggle favorite (add/remove)
export const toggleFavorite = async (req, res) => {
  const connection = await getConnection();
  
  try {
    await connection.beginTransaction();
    
    const userId = req.user.id;
    const { product_id } = req.body;
    
    if (!product_id) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    // Check if already favorited
    const [existing] = await connection.execute(
      'SELECT id FROM favorites WHERE user_id = ? AND product_id = ?',
      [userId, product_id]
    );
    
    if (existing.length > 0) {
      // Remove
      await connection.execute(
        'DELETE FROM favorites WHERE user_id = ? AND product_id = ?',
        [userId, product_id]
      );
      
      await connection.commit();
      connection.release();
      
      return res.json({
        success: true,
        action: 'removed',
        message: 'Removed from favorites'
      });
    } else {
      // Add
      await connection.execute(
        'INSERT INTO favorites (user_id, product_id) VALUES (?, ?)',
        [userId, product_id]
      );
      
      await connection.commit();
      connection.release();
      
      return res.json({
        success: true,
        action: 'added',
        message: 'Added to favorites'
      });
    }
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Error toggling favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling favorite',
      error: error.message
    });
  }
};





