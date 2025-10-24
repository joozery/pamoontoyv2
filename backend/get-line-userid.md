# วิธีหา LINE User ID

## วิธีที่ 1: ใช้ Webhook (แนะนำ)

### 1. เพิ่ม Webhook Route ใน server.js

เพิ่มโค้ดนี้ใน `/var/pamoontoyv2/backend/server.js`:

```javascript
// LINE Webhook
app.post('/webhook/line', (req, res) => {
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
```

### 2. Restart Backend
```bash
pm2 restart pamoontoy-api
```

### 3. ตั้งค่า Webhook URL ใน LINE Console

1. ไปที่ LINE Developers Console
2. เลือก Channel ของคุณ
3. ไปที่ Tab "Messaging API"
4. หา "Webhook settings"
5. ใส่ Webhook URL:
   ```
   https://api.pamoontoy.site/webhook/line
   ```
6. กด "Update"
7. เปิด "Use webhook" → **Enabled**
8. กด "Verify" เพื่อทดสอบ

### 4. ส่งข้อความทดสอบ

1. เปิดแอป LINE
2. ส่งข้อความไปหา Bot: "สวัสดี"
3. ดู Logs:
   ```bash
   pm2 logs pamoontoy-api --lines 50
   ```
4. หา User ID ที่ขึ้นมา เช่น:
   ```
   👤 User ID: U1234567890abcdef1234567890abcdef
   ```

---

## วิธีที่ 2: ใช้ LINE Bot Designer (ง่ายที่สุด!)

1. ไปที่ https://developers.line.biz/console/
2. เลือก Channel ของคุณ
3. ไปที่ Tab "Messaging API"
4. เลื่อนลงมาหา "Your user ID"
5. คัดลอก User ID

---

## วิธีที่ 3: ใช้ LINE Official Account Manager

1. ไปที่ https://manager.line.biz/
2. เลือก Account ของคุณ
3. ไปที่ "Settings" → "Response settings"
4. ดู "Your LINE ID" หรือ "User ID"

---

## 📝 เมื่อได้ User ID แล้ว

เอา User ID มาใส่ใน config.env:

```bash
nano /var/pamoontoyv2/backend/config.env
```

แก้บรรทัดนี้:
```env
LINE_ADMIN_USER_ID=U1234567890abcdef1234567890abcdef
```

Save และ Restart:
```bash
pm2 restart pamoontoy-api
```

---

## 🎯 ตัวอย่าง User ID ที่ถูกต้อง

```
U4af4980629... (เริ่มต้นด้วย U)
```

❌ **ไม่ใช่:**
- Basic ID (@xxx)
- Display name
- LINE ID (@xxx)



