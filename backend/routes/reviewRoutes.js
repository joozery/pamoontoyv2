import express from 'express';
import { 
  createReview, 
  getProductReviews, 
  getAllReviews,
  updateReviewStatus,
  deleteReview,
  getUserReviews,
  canReviewOrder
} from '../controllers/reviewController.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/products/:productId', getProductReviews); // Get reviews for a product

// Protected routes (require login)
router.post('/', auth, createReview); // Create a review
router.get('/user/my-reviews', auth, getUserReviews); // Get user's own reviews
router.get('/check/:orderId', auth, canReviewOrder); // Check if user can review an order

// Admin routes
router.get('/admin/all', auth, adminOnly, getAllReviews); // Get all reviews (admin)
router.put('/admin/:id', auth, adminOnly, updateReviewStatus); // Update review status (admin)
router.delete('/admin/:id', auth, adminOnly, deleteReview); // Delete review (admin)

export default router;

