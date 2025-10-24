import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  getUserViewHistory
} from '../controllers/productController.js';
import { upload } from '../config/cloudinary.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all products
router.get('/', getAllProducts);

// Get single product
router.get('/:id', getProductById);

// Get user's view history
router.get('/user/view-history', auth, getUserViewHistory);

// Create new product (with file upload)
router.post('/', auth, upload.array('images', 10), createProduct);

// Update product
router.put('/:id', auth, updateProduct);

// Upload additional images for product
router.post('/:productId/images', auth, upload.array('images', 10), uploadProductImages);

// Delete product
router.delete('/:id', auth, deleteProduct);

export default router;




