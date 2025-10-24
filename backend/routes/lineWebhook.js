import express from 'express';

const router = express.Router();

// LINE Webhook endpoint to get User ID
router.post('/webhook', async (req, res) => {
  try {
    const events = req.body.events;
    
    events.forEach(event => {
      console.log('📲 LINE Event:', event.type);
      console.log('👤 User ID:', event.source.userId);
      console.log('💬 Message:', event.message?.text || 'No message');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false });
  }
});

export default router;



