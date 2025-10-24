import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
  const events = req.body.events || [];
  
  events.forEach(event => {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📲 Event Type:', event.type);
    console.log('👤 User ID:', event.source.userId);
    console.log('💬 Message:', event.message?.text || 'No message');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });
  
  res.status(200).json({ success: true });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n🎯 Webhook server running on port ${PORT}`);
  console.log(`📡 Webhook URL: http://localhost:${PORT}/webhook\n`);
});
