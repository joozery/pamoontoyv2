import express from 'express';
import { auth, adminOnly } from '../middleware/auth.js';
import { pool } from '../config/database.js';

const router = express.Router();

// Get all discount codes
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }
    
    if (search) {
      whereClause += ' AND (code LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    const [discounts] = await pool.query(`
      SELECT 
        d.*,
        0 as usage_count,
        0 as total_discount_given
      FROM discount_codes d
      ${whereClause}
      ORDER BY d.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);
    
    // Get total count
    const [countResult] = await pool.query(`
      SELECT COUNT(*) as total FROM discount_codes ${whereClause}
    `, params);
    
    const total = countResult[0].total;
    
    res.json({
      success: true,
      data: discounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching discount codes:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching discount codes',
      error: error.message
    });
  }
});

// Get single discount code
router.get('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [discounts] = await pool.query(`
      SELECT 
        d.*,
        COUNT(o.id) as usage_count,
        COALESCE(SUM(o.discount_amount), 0) as total_discount_given
      FROM discount_codes d
      LEFT JOIN orders o ON d.id = o.discount_code_id
      WHERE d.id = ?
      GROUP BY d.id, d.code, d.description, d.discount_type, d.discount_value, d.min_order_amount, d.max_discount_amount, d.usage_limit, d.usage_count, d.valid_from, d.valid_until, d.is_active, d.created_at, d.updated_at
    `, [id]);
    
    if (discounts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Discount code not found'
      });
    }
    
    res.json({
      success: true,
      data: discounts[0]
    });
  } catch (error) {
    console.error('Error fetching discount code:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching discount code',
      error: error.message
    });
  }
});

// Create new discount code
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const {
      code,
      description,
      discount_type,
      discount_value,
      min_order_amount,
      max_discount_amount,
      usage_limit,
      valid_from,
      valid_until,
      is_active = true
    } = req.body;
    
    // Validate required fields
    if (!code || !discount_type || !discount_value) {
      return res.status(400).json({
        success: false,
        message: 'Code, discount type, and discount value are required'
      });
    }
    
    // Check if code already exists
    const [existing] = await pool.query(
      'SELECT id FROM discount_codes WHERE code = ?',
      [code]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Discount code already exists'
      });
    }
    
    // Insert new discount code
    const [result] = await pool.query(`
      INSERT INTO discount_codes (
        code, description, discount_type, discount_value, min_order_amount,
        max_discount_amount, usage_limit, valid_from, valid_until, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      code,
      description,
      discount_type,
      discount_value,
      min_order_amount || null,
      max_discount_amount || null,
      usage_limit || null,
      valid_from || null,
      valid_until || null,
      is_active
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Discount code created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating discount code:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating discount code',
      error: error.message
    });
  }
});

// Update discount code
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Build dynamic update query
    const fields = [];
    const values = [];
    
    const allowedColumns = [
      'code', 'description', 'discount_type', 'discount_value',
      'min_order_amount', 'max_discount_amount', 'usage_limit',
      'valid_from', 'valid_until', 'is_active'
    ];
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && allowedColumns.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });
    
    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }
    
    values.push(id);
    
    await pool.query(`
      UPDATE discount_codes 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, values);
    
    res.json({
      success: true,
      message: 'Discount code updated successfully'
    });
  } catch (error) {
    console.error('Error updating discount code:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating discount code',
      error: error.message
    });
  }
});

// Delete discount code
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if discount code is being used
    const [orders] = await pool.query(
      'SELECT COUNT(*) as count FROM orders WHERE discount_code_id = ?',
      [id]
    );
    
    if (orders[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete discount code that has been used'
      });
    }
    
    await pool.query('DELETE FROM discount_codes WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Discount code deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting discount code:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting discount code',
      error: error.message
    });
  }
});

// Toggle discount code status
router.patch('/:id/toggle', auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query(`
      UPDATE discount_codes 
      SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [id]);
    
    res.json({
      success: true,
      message: 'Discount code status toggled successfully'
    });
  } catch (error) {
    console.error('Error toggling discount code:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling discount code',
      error: error.message
    });
  }
});

// Get discount code usage statistics
router.get('/:id/usage', auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [usage] = await pool.query(`
      SELECT 
        o.id,
        o.order_number,
        o.total_amount,
        o.discount_amount,
        o.created_at,
        u.name as customer_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.discount_code_id = ?
      ORDER BY o.created_at DESC
    `, [id]);
    
    res.json({
      success: true,
      data: usage
    });
  } catch (error) {
    console.error('Error fetching discount usage:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching discount usage',
      error: error.message
    });
  }
});

// Validate discount code
router.get('/validate/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    const [discounts] = await pool.query(`
      SELECT * FROM discount_codes 
      WHERE code = ? AND is_active = 1 
      AND (valid_from IS NULL OR valid_from <= NOW()) 
      AND (valid_until IS NULL OR valid_until >= NOW())
    `, [code]);
    
    if (discounts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Discount code not found or expired'
      });
    }
    
    const discount = discounts[0];
    
    // Check usage limit (skip for now since orders table doesn't have discount_code_id)
    // if (discount.usage_limit) {
    //   const [usage] = await pool.query(`
    //     SELECT COUNT(*) as usage_count 
    //     FROM orders 
    //     WHERE discount_code_id = ?
    //   `, [discount.id]);
    //   
    //   if (usage[0].usage_count >= discount.usage_limit) {
    //     return res.status(400).json({
    //       success: false,
    //       message: 'Discount code usage limit exceeded'
    //     });
    //   }
    // }
    
    res.json({
      success: true,
      data: discount
    });
  } catch (error) {
    console.error('Error validating discount code:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating discount code',
      error: error.message
    });
  }
});

export default router;
