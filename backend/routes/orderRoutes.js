import express from 'express';
import { 
  getUserOrders, 
  getOrderById, 
  submitPayment, 
  cancelOrder,
  getAllAdmin,
  confirmPayment,
  updateShipping,
  bulkPayment
} from '../controllers/orderController.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.get('/', auth, getUserOrders);
router.get('/:id', auth, getOrderById);
router.post('/:id/payment', auth, submitPayment);
router.post('/bulk-payment', auth, bulkPayment);
router.put('/:id/cancel', auth, cancelOrder);

// Admin routes
router.get('/admin/all', auth, adminOnly, getAllAdmin);
router.put('/admin/:id/confirm', auth, adminOnly, confirmPayment);
router.put('/admin/:id/shipping', auth, adminOnly, updateShipping);

export default router;
