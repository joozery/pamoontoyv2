import express from 'express';
import { auth, adminOnly } from '../middleware/auth.js';
import { pool } from '../config/database.js';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const [categories] = await pool.query(
      'SELECT * FROM categories ORDER BY name ASC'
    );
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

// Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [categories] = await pool.query(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );
    
    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      data: categories[0]
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category',
      error: error.message
    });
  }
});

// Create category (Admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description]
    );
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { id: result.insertId, name, description }
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message
    });
  }
});

// Update category (Admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    await pool.query(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [name, description, id]
    );
    
    res.json({
      success: true,
      message: 'Category updated successfully'
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating category',
      error: error.message
    });
  }
});

// Delete category (Admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message
    });
  }
});

export default router;



