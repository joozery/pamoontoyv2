import express from 'express';
import {
  placeBid,
  getProductBids,
  getUserBids,
  buyNow
} from '../controllers/bidController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Place a bid
router.post('/products/:productId/bid', auth, placeBid);

// Buy now
router.post('/products/:productId/buy-now', auth, buyNow);

// Get bids for a product
router.get('/products/:productId/bids', getProductBids);

// Get user's bids
router.get('/user/bids', auth, getUserBids);

export default router;




