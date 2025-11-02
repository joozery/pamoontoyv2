import { execute, getConnection, pool } from '../config/database.js';
import { upload } from '../config/cloudinary.js';

// Get all products with pagination and filters
const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params = [];

    // ✅ ถ้าไม่ได้ระบุ status ให้แสดงเฉพาะ active products
    if (!status) {
      whereClause += ' AND p.status = ?';
      params.push('active');
    }

    if (category) {
      whereClause += ' AND p.category_id = ?';
      params.push(category);
    }

    // ✅ ถ้า status = 'all' ให้แสดงทุก status (สำหรับ admin)
    if (status && status !== 'all') {
      whereClause += ' AND p.status = ?';
      params.push(status);
    }

    if (search) {
      whereClause += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const query = `
      SELECT 
        p.*,
        u.name as seller_name,
        u.level as seller_rating,
        u.total_orders as seller_total_sales,
        u.avatar_url as seller_avatar,
        pi.cloudinary_url as primary_image
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
      ${whereClause}
      ORDER BY p.${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    const queryParams = [...params, parseInt(limit), offset];

    const [products] = await pool.query(query, queryParams);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      ${whereClause}
    `;
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: parseInt(page) < Math.ceil(total / limit),
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// Get single product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await pool.query(`
      SELECT 
        p.*,
        u.name as seller_name,
        u.level as seller_rating,
        u.total_orders as seller_total_sales,
        u.avatar_url as seller_avatar
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE p.id = ?
    `, [id]);

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get product images from both sources
    const [productImages] = await pool.query(`
      SELECT * FROM product_images
      WHERE product_id = ?
      ORDER BY sort_order, created_at
    `, [id]);

    // Parse images from products.images field (JSON)
    let imagesArray = [];
    if (products[0].images) {
      if (typeof products[0].images === 'string') {
        try {
          imagesArray = JSON.parse(products[0].images);
        } catch (e) {
          console.log('Failed to parse images JSON:', e);
        }
      } else if (Array.isArray(products[0].images)) {
        imagesArray = products[0].images;
      }
    }

    // If no images from JSON, use product_images table
    if (imagesArray.length === 0 && productImages.length > 0) {
      imagesArray = productImages.map(img => img.cloudinary_url || img.image_url);
    }

    // If still no images, use image_url
    if (imagesArray.length === 0 && products[0].image_url) {
      imagesArray = [products[0].image_url];
    }

    console.log('🔍 API Debug:', {
      productId: id,
      rawImages: products[0].images,
      parsedImages: imagesArray,
      productImagesTable: productImages,
      imageUrl: products[0].image_url,
      finalImages: imagesArray
    });

    // Get recent bids
    const [bids] = await pool.query(`
      SELECT 
        b.*,
        u.name as bidder_name
      FROM bids b
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.product_id = ?
      ORDER BY b.bid_amount DESC
      LIMIT 10
    `, [id]);

    const product = {
      ...products[0],
      images: imagesArray,
      recent_bids: bids
    };

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

// Create new product
const createProduct = async (req, res) => {
  const connection = await getConnection();
  
  try {
    await connection.beginTransaction();

    // Log incoming request for debugging
    console.log('📝 Create product request body:', JSON.stringify(req.body, null, 2));
    
    // Support both camelCase and snake_case
    const name = req.body.name;
    const description = req.body.description;
    const starting_price = req.body.starting_price || req.body.startPrice || req.body.start_price;
    const current_price = req.body.current_price || req.body.currentPrice;
    const buy_now_price = req.body.buy_now_price || req.body.buyNowPrice || req.body.price;
    const category_id = req.body.category_id || req.body.categoryId || null;
    const condition_status = req.body.condition_status || req.body.conditionStatus || req.body.condition;
    const status = req.body.status;
    const seller_id = req.body.seller_id || req.body.sellerId;
    
    // ✅ แปลงเวลาจาก client → MySQL datetime format
    let auction_start = req.body.auction_start || req.body.auctionStart || req.body.auction?.startTime;
    let auction_end = req.body.auction_end || req.body.auctionEnd || req.body.auction?.endTime;
    
    // ฟังก์ชันแปลง ISO string → MySQL datetime format (YYYY-MM-DD HH:MM:SS)
    const toMySQLDateTime = (dateString) => {
      if (!dateString) return null;
      const date = new Date(dateString);
      return date.toISOString().slice(0, 19).replace('T', ' ');
    };
    
    // ถ้ามีค่ามา ให้แปลงเป็น MySQL datetime
    if (auction_start) {
      auction_start = toMySQLDateTime(auction_start);
    }
    if (auction_end) {
      auction_end = toMySQLDateTime(auction_end);
    }
    
    const brand = req.body.brand || null;
    const shipping_cost = req.body.shipping_cost || req.body.shippingCost || null;
    const location = req.body.location || null;
    const min_bid_increment = req.body.min_bid_increment || req.body.minBidIncrement || 20;

    console.log('✅ Parsed values:', {
      name,
      description,
      starting_price,
      current_price,
      buy_now_price,
      min_bid_increment,
      category_id,
      condition_status,
      status,
      seller_id,
      auction_start,
      auction_end,
      brand,
      shipping_cost,
      location
    });

    // Validate required fields
    if (!name) {
      console.log('❌ Validation failed: name is missing');
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'Product name is required'
      });
    }

    // Get images from request body (already uploaded to Cloudinary)
    const images = req.body.images || [];
    const image_url = images.length > 0 ? images[0] : null;
    const images_json = images.length > 0 ? JSON.stringify(images) : null;

    // Insert product
    const [result] = await connection.execute(`
      INSERT INTO products (
        name, description, starting_price, current_price, buy_now_price, min_bid_increment,
        category_id, brand, shipping_cost, location,
        condition_status, status, seller_id, auction_start, auction_end,
        image_url, images, scheduled_publish_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name,
      description || '',
      parseFloat(starting_price) || 0,
      parseFloat(current_price) || parseFloat(starting_price) || 0,
      buy_now_price ? parseFloat(buy_now_price) : null,
      parseFloat(min_bid_increment) || 20,
      category_id || null,
      brand,
      shipping_cost ? parseFloat(shipping_cost) : 0,
      location,
      condition_status || 'new',
      status || 'active',
      seller_id || req.user.id,
      // ✅ ส่ง MySQL datetime format
      auction_start || toMySQLDateTime(new Date()),
      auction_end || toMySQLDateTime(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      image_url,
      images_json,
      req.body.scheduled_publish_at ? toMySQLDateTime(req.body.scheduled_publish_at) : null
    ]);

    const productId = result.insertId;

    console.log(`✅ Product created with ID: ${productId}, Images: ${images.length}`);

    // Handle uploaded files
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        await connection.execute(`
          INSERT INTO product_images (
            product_id, cloudinary_public_id, cloudinary_url, file_type,
            file_size, width, height, duration, is_primary, sort_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          productId,
          file.public_id,
          file.secure_url,
          file.resource_type === 'image' ? 'image' : 'video',
          file.bytes,
          file.width,
          file.height,
          file.duration || null,
          i === 0, // First image is primary
          i
        ]);
      }
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { id: productId }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Update product
const updateProduct = async (req, res) => {
  const connection = await getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const updateData = req.body;

    // ✅ ฟังก์ชันแปลง ISO string → MySQL datetime format
    const toMySQLDateTime = (dateString) => {
      if (!dateString) return null;
      const date = new Date(dateString);
      return date.toISOString().slice(0, 19).replace('T', ' ');
    };

    // Build dynamic update query
    const fields = [];
    const values = [];

    // Whitelist of allowed columns that exist in the database
    const allowedColumns = [
      'name', 'description', 'starting_price', 'current_price', 'buy_now_price', 'min_bid_increment',
      'reserve_price', 'category_id', 'brand', 'shipping_cost', 'location',
      'condition_status', 'status', 'auction_start', 'auction_end', 'images', 'image_url', 'scheduled_publish_at'
    ];

    Object.keys(updateData).forEach(key => {
      if (key !== 'id' && updateData[key] !== undefined && allowedColumns.includes(key)) {
        if (key === 'tags') {
          fields.push(`${key} = ?`);
          values.push(JSON.stringify(updateData[key]));
        } else if (key === 'images') {
          // Convert array to JSON string
          fields.push(`${key} = ?`);
          values.push(JSON.stringify(updateData[key]));
        } else if (key === 'auction_start' || key === 'auction_end') {
          // ✅ แปลง datetime เป็น MySQL format
          fields.push(`${key} = ?`);
          values.push(toMySQLDateTime(updateData[key]));
        } else {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(id);

    await connection.execute(`
      UPDATE products 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, values);

    // Handle new uploaded files
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        await connection.execute(`
          INSERT INTO product_images (
            product_id, cloudinary_public_id, cloudinary_url, file_type,
            file_size, width, height, duration, is_primary, sort_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          id,
          file.public_id,
          file.secure_url,
          file.resource_type === 'image' ? 'image' : 'video',
          file.bytes,
          file.width,
          file.height,
          file.duration || null,
          false, // New images are not primary by default
          i
        ]);
      }
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Product updated successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Get product images to delete from Cloudinary
    const [images] = await pool.query(`
      SELECT cloudinary_public_id FROM product_images WHERE product_id = ?
    `, [id]);

    // Delete from database (CASCADE will handle product_images)
    await pool.query('DELETE FROM products WHERE id = ?', [id]);

    // TODO: Delete images from Cloudinary
    // This would require additional Cloudinary API calls

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

// Upload images for product
const uploadProductImages = async (req, res) => {
  try {
    const { productId } = req.params;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const connection = await getConnection();
    
    try {
      await connection.beginTransaction();

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        await connection.execute(`
          INSERT INTO product_images (
            product_id, cloudinary_public_id, cloudinary_url, file_type,
            file_size, width, height, duration, is_primary, sort_order
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          productId,
          file.public_id,
          file.secure_url,
          file.resource_type === 'image' ? 'image' : 'video',
          file.bytes,
          file.width,
          file.height,
          file.duration || null,
          false,
          i
        ]);
      }

      await connection.commit();

      res.json({
        success: true,
        message: 'Images uploaded successfully',
        data: req.files.map(file => ({
          public_id: file.public_id,
          url: file.secure_url,
          type: file.resource_type
        }))
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading images',
      error: error.message
    });
  }
};

// Get user's view history
const getUserViewHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get recently viewed products from localStorage or database
    // For now, we'll return recent products as view history
    const [products] = await pool.query(`
      SELECT 
        p.*,
        u.name as seller_name,
        u.level as seller_rating,
        u.total_orders as seller_total_sales,
        u.avatar_url as seller_avatar
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      WHERE p.status = 'active'
      ORDER BY p.created_at DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error fetching view history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching view history',
      error: error.message
    });
  }
};

export {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  getUserViewHistory
};
