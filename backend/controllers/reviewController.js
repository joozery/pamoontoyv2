import { pool } from '../config/database.js';

// Create review (User can review after payment)
export const createReview = async (req, res) => {
  try {
    const { order_id, product_id, rating, comment } = req.body;
    const user_id = req.user.id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if order exists and belongs to user
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [order_id, user_id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or unauthorized'
      });
    }

    // Check if review already exists for this order
    const [existingReviews] = await pool.query(
      'SELECT id FROM reviews WHERE order_id = ?',
      [order_id]
    );

    if (existingReviews.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this order'
      });
    }

    // Create review
    const [result] = await pool.query(
      `INSERT INTO reviews (order_id, product_id, user_id, rating, comment, status) 
       VALUES (?, ?, ?, ?, ?, 'approved')`,
      [order_id, product_id, user_id, rating, comment]
    );

    // Update product average rating
    await updateProductRating(product_id);

    res.json({
      success: true,
      message: 'Review created successfully',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating review',
      error: error.message
    });
  }
};

// Get reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const [reviews] = await pool.query(
      `SELECT 
        r.*,
        u.name as user_name,
        u.email as user_email,
        u.avatar_url
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ? AND r.status = 'approved'
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?`,
      [productId, parseInt(limit), parseInt(offset)]
    );

    // Get total count
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM reviews WHERE product_id = ? AND status = "approved"',
      [productId]
    );

    // Get rating summary
    const [ratingSummary] = await pool.query(
      `SELECT 
        AVG(rating) as average_rating,
        COUNT(*) as total_reviews,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
      FROM reviews
      WHERE product_id = ? AND status = 'approved'`,
      [productId]
    );

    res.json({
      success: true,
      data: reviews,
      summary: ratingSummary[0],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

// Get all reviews (Admin)
export const getAllReviews = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        r.*,
        u.name as user_name,
        u.email as user_email,
        p.name as product_name,
        o.order_number
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN products p ON r.product_id = p.id
      JOIN orders o ON r.order_id = o.id
    `;

    const params = [];

    if (status) {
      query += ' WHERE r.status = ?';
      params.push(status);
    }

    query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [reviews] = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM reviews';
    if (status) {
      countQuery += ' WHERE status = ?';
    }

    const [countResult] = await pool.query(
      countQuery,
      status ? [status] : []
    );

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

// Update review status (Admin)
export const updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    await pool.query(
      'UPDATE reviews SET status = ? WHERE id = ?',
      [status, id]
    );

    // Get product_id to update rating
    const [review] = await pool.query('SELECT product_id FROM reviews WHERE id = ?', [id]);
    if (review.length > 0) {
      await updateProductRating(review[0].product_id);
    }

    res.json({
      success: true,
      message: 'Review updated successfully'
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: error.message
    });
  }
};

// Delete review (Admin)
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    // Get product_id before deleting
    const [review] = await pool.query('SELECT product_id FROM reviews WHERE id = ?', [id]);

    await pool.query('DELETE FROM reviews WHERE id = ?', [id]);

    // Update product rating
    if (review.length > 0) {
      await updateProductRating(review[0].product_id);
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
};

// Helper function to update product average rating
async function updateProductRating(productId) {
  try {
    const [result] = await pool.query(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as review_count
       FROM reviews
       WHERE product_id = ? AND status = 'approved'`,
      [productId]
    );

    const avgRating = result[0].avg_rating || 0;
    const reviewCount = result[0].review_count || 0;

    // Update product table (if you have rating column)
    // await pool.query(
    //   'UPDATE products SET rating = ?, review_count = ? WHERE id = ?',
    //   [avgRating, reviewCount, productId]
    // );

    console.log(`Updated product ${productId} rating: ${avgRating} (${reviewCount} reviews)`);
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
}

// Get user's own reviews
export const getUserReviews = async (req, res) => {
  try {
    const user_id = req.user.id;

    const [reviews] = await pool.query(
      `SELECT 
        r.*,
        p.name as product_name,
        p.image_url as product_image,
        o.order_number
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      JOIN orders o ON r.order_id = o.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC`,
      [user_id]
    );

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

// Check if user can review an order
export const canReviewOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const user_id = req.user.id;

    // Check if order exists and belongs to user
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ? AND status IN ("paid", "shipped", "delivered")',
      [orderId, user_id]
    );

    if (orders.length === 0) {
      return res.json({
        success: true,
        canReview: false,
        reason: 'Order not found or not paid yet'
      });
    }

    // Check if review already exists
    const [reviews] = await pool.query(
      'SELECT id FROM reviews WHERE order_id = ?',
      [orderId]
    );

    if (reviews.length > 0) {
      return res.json({
        success: true,
        canReview: false,
        reason: 'Review already submitted',
        reviewId: reviews[0].id
      });
    }

    res.json({
      success: true,
      canReview: true
    });
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking review eligibility',
      error: error.message
    });
  }
};

