# Pamoontoy Backend API

Backend API สำหรับระบบประมูลสินค้า Pamoontoy

## Features

- 🔐 User Authentication (JWT)
- 📦 Product Management
- 🖼️ Image/Video Upload (Cloudinary)
- 💰 Bidding System
- 🛒 Buy Now Feature
- 📊 Database (MySQL)

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
สร้างไฟล์ `config.env`:
```env
# Database Configuration
DB_HOST=145.223.21.117
DB_USER=debian-sys-maint
DB_PASSWORD=Str0ngP@ssw0rd!
DB_NAME=pamoontoy_db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### 3. Setup Database
```bash
node setup-database.js
```

### 4. Start Server
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (with file upload)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/:productId/images` - Upload additional images

### Bidding
- `POST /api/bids/products/:productId/bid` - Place bid
- `POST /api/bids/products/:productId/buy-now` - Buy now
- `GET /api/bids/products/:productId/bids` - Get product bids
- `GET /api/bids/user/bids` - Get user's bids

## File Upload

### Supported Formats
- **Images**: JPG, JPEG, PNG, GIF
- **Videos**: MP4, MOV, AVI, WEBM
- **Max Size**: 10MB per file
- **Max Files**: 10 files per request

### Cloudinary Integration
- Automatic image optimization
- Responsive image generation
- Video thumbnail generation
- Secure file storage

## Database Schema

### Products Table
- Basic product information
- Pricing (start, current, buy now)
- Auction settings
- Seller information

### Product Images Table
- Cloudinary integration
- File metadata
- Primary image flag
- Sort order

### Bids Table
- Bid tracking
- User association
- Winning bid status
- Timestamps

### Users Table
- User profiles
- Contact information
- Seller status
- Ratings and sales

## Error Handling

API ใช้ standardized error format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Security Features

- JWT Authentication
- Password Hashing (bcrypt)
- Rate Limiting
- CORS Protection
- Helmet Security Headers
- Input Validation

## Development

### File Structure
```
backend/
├── config/
│   ├── database.js
│   └── cloudinary.js
├── controllers/
│   ├── productController.js
│   └── bidController.js
├── middleware/
│   └── auth.js
├── routes/
│   ├── authRoutes.js
│   ├── productRoutes.js
│   └── bidRoutes.js
├── database/
│   └── schema.sql
├── server.js
├── setup-database.js
└── package.json
```

### Testing
```bash
# Test database connection
node -e "require('./config/database').testConnection()"

# Test Cloudinary connection
node -e "require('./config/cloudinary').cloudinary.api.ping()"
```



