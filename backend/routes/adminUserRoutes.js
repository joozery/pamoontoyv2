import express from 'express';
import { auth, adminOnly } from '../middleware/auth.js';
import { pool } from '../config/database.js';

const router = express.Router();

// Get all regular users (not admins) with order statistics
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.role,
        u.level,
        u.created_at as joinedAt,
        COUNT(DISTINCT o.id) as totalOrders,
        COALESCE(SUM(CASE 
          WHEN o.status IN ('completed', 'paid', 'confirmed', 'shipped', 'delivered') 
          THEN o.total_amount 
          ELSE 0 
        END), 0) as totalSpent,
        COUNT(DISTINCT CASE 
          WHEN b.is_winning = 1 
          THEN b.product_id 
          ELSE NULL 
        END) as wonAuctions,
        'active' as status
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      LEFT JOIN bids b ON u.id = b.user_id AND b.is_winning = 1
      WHERE u.role != ?
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `, ['admin']);
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// Get all admin users specifically
router.get('/admin-users', auth, adminOnly, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, phone, role, level, created_at FROM users WHERE role = ? ORDER BY created_at DESC',
      ['admin']
    );
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin users',
      error: error.message
    });
  }
});

// Create admin user
router.post('/users', auth, adminOnly, async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    // Check if user exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    // Hash password
    const bcrypt = (await import('bcryptjs')).default;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone, 'admin']
    );
    
    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: { id: result.insertId, name, email, phone, role: 'admin' }
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating admin user',
      error: error.message
    });
  }
});

// Update user
router.put('/users/:id', auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    
    // Check if user exists
    const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if email is already used by another user
    if (email) {
      const [emailCheck] = await pool.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
      );
      if (emailCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }
    
    // Update user (only fields that exist in the table)
    await pool.query(
      'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?',
      [name, email, phone, id]
    );
    
    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
});

// Delete user
router.delete('/users/:id', auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent self-deletion
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }
    
    // Delete any user (admin or regular)
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

export default router;

