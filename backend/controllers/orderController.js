import { execute, getConnection, pool } from '../config/database.js';
import lineNotifyService from '../services/lineNotifyService.js';

// Get user's orders
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [orders] = await pool.query(`
      SELECT 
        o.*,
        p.name as product_name,
        p.image_url as product_image,
        p.images as product_images,
        u.name as seller_name,
        u.email as seller_email
      FROM orders o
      JOIN products p ON o.product_id = p.id
      JOIN users u ON p.seller_id = u.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `, [userId]);
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const [orders] = await pool.query(`
      SELECT 
        o.*,
        p.name as product_name,
        p.description as product_description,
        p.image_url as product_image,
        p.images as product_images,
        p.condition_status,
        u.name as seller_name,
        u.email as seller_email,
        u.phone as seller_phone
      FROM orders o
      JOIN products p ON o.product_id = p.id
      JOIN users u ON p.seller_id = u.id
      WHERE o.id = ? AND o.user_id = ?
    `, [id, userId]);
    
    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: orders[0]
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// Create order (when auction ends or buy now)
export const createOrder = async (req, res) => {
  const connection = await getConnection();
  
  try {
    await connection.beginTransaction();
    
    const userId = req.user.id;
    const { productId, bidId, amount, shippingCost = 0 } = req.body;
    
    // Check if product exists
    const [products] = await connection.execute(
      'SELECT * FROM products WHERE id = ?',
      [productId]
    );
    
    if (products.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const product = products[0];
    
    // Check if order already exists for this product
    const [existingOrders] = await connection.execute(
      'SELECT id FROM orders WHERE product_id = ? AND user_id = ?',
      [productId, userId]
    );
    
    if (existingOrders.length > 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'Order already exists for this product'
      });
    }
    
    // Create order
    // Generate unique order number
    const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    const [result] = await connection.execute(`
      INSERT INTO orders (
        order_number, user_id, product_id, bid_id, total_amount, shipping_fee, status, shipping_address
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending', 'ที่อยู่จะถูกกรอกภายหลัง')
    `, [orderNumber, userId, productId, bidId || null, amount, shippingCost]);
    
    // Update product status
    await connection.execute(
      'UPDATE products SET status = ? WHERE id = ?',
      ['sold', productId]
    );
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderId: result.insertId
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Submit payment
export const submitPayment = async (req, res) => {
  const connection = await getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const userId = req.user.id;
    const { paymentMethod, paymentSlip, notes, shippingAddress } = req.body;
    
    // Verify order belongs to user and get full details
    const [orders] = await connection.execute(`
      SELECT o.*, p.name as product_name, u.name as customer_name, u.phone as customer_phone, u.email as customer_email
      FROM orders o
      JOIN products p ON o.product_id = p.id
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ? AND o.user_id = ?
    `, [id, userId]);
    
    if (orders.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    const order = orders[0];
    
    if (order.status !== 'pending') {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'Order is not pending payment'
      });
    }
    
    // Update order with payment info and shipping address
    await connection.execute(`
      UPDATE orders 
      SET status = 'paid',
          payment_method = ?,
          payment_slip = ?,
          notes = ?,
          shipping_address = ?,
          paid_at = NOW()
      WHERE id = ?
    `, [paymentMethod, paymentSlip, notes, shippingAddress, id]);
    
    await connection.commit();
    
    // Send LINE Notify with payment slip image
    const totalAmount = parseFloat(order.total_amount) + parseFloat(order.shipping_fee || 0);
    lineNotifyService.sendPaymentNotification({
      orderId: id,
      customerName: order.customer_name || 'ไม่ระบุ',
      customerPhone: order.customer_phone || 'ไม่ระบุ',
      totalAmount: totalAmount,
      paymentMethod: paymentMethod,
      shippingAddress: shippingAddress || 'ไม่ระบุ',
      paymentSlip: paymentSlip // Add payment slip URL
    }).catch(err => console.error('LINE Notify failed:', err));
    
    res.json({
      success: true,
      message: 'Payment submitted successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error submitting payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting payment',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  const connection = await getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const userId = req.user.id;
    
    // Verify order belongs to user
    const [orders] = await connection.execute(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (orders.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    const order = orders[0];
    
    if (order.status !== 'pending') {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'Only pending orders can be cancelled'
      });
    }
    
    // Update order status
    await connection.execute(
      'UPDATE orders SET status = ?, cancelled_at = NOW() WHERE id = ?',
      ['cancelled', id]
    );
    
    // Reactivate product
    await connection.execute(
      'UPDATE products SET status = ? WHERE id = ?',
      ['active', order.product_id]
    );
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Admin: Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        o.*,
        p.name as product_name,
        p.image_url as product_image,
        u.name as buyer_name,
        u.email as buyer_email,
        seller.name as seller_name
      FROM orders o
      JOIN products p ON o.product_id = p.id
      JOIN users u ON o.user_id = u.id
      JOIN users seller ON p.seller_id = seller.id
    `;
    
    const params = [];
    
    if (status) {
      query += ' WHERE o.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [orders] = await pool.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM orders';
    if (status) {
      countQuery += ' WHERE status = ?';
    }
    
    const [countResult] = await pool.query(
      countQuery,
      status ? [status] : []
    );
    
    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Admin: Get all orders
export const getAllAdmin = async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT 
        o.*,
        p.name as product_name,
        p.image_url as product_image,
        p.images as product_images,
        u.name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone
      FROM orders o
      JOIN products p ON o.product_id = p.id
      JOIN users u ON o.user_id = u.id
      ORDER BY 
        CASE 
          WHEN o.status = 'paid' THEN 1
          WHEN o.status = 'pending' THEN 2
          WHEN o.status = 'confirmed' THEN 3
          ELSE 4
        END,
        o.created_at DESC
    `);
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Admin: Confirm payment
export const confirmPayment = async (req, res) => {
  const connection = await getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const { tracking_number } = req.body; // รับเลขพัสดุ
    
    const [orders] = await connection.execute(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    );
    
    if (orders.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // ✅ อัพเดทสถานะและเลขพัสดุ (ใช้ 'paid' แทน 'confirmed')
    await connection.execute(
      'UPDATE orders SET status = ?, tracking_number = ?, updated_at = NOW() WHERE id = ?',
      ['paid', tracking_number || null, id]
    );
    
    await connection.commit();
    
    // ส่ง LINE notification ถ้ามีเลขพัสดุ
    if (tracking_number) {
      try {
        const order = orders[0];
        // Get product and user details
        const [productDetails] = await connection.execute(
          'SELECT p.name, u.name as customer_name FROM products p JOIN orders o ON p.id = o.product_id JOIN users u ON o.user_id = u.id WHERE o.id = ?',
          [id]
        );
        
        // TODO: Send LINE notification with tracking number
        console.log('📦 Tracking number updated:', {
          orderId: order.order_number,
          trackingNumber: tracking_number,
          customer: productDetails[0]?.customer_name
        });
      } catch (notifyError) {
        console.error('Error sending notification:', notifyError);
      }
    }
    
    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: {
        tracking_number
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming payment',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Admin: Update shipping
export const updateShipping = async (req, res) => {
  const connection = await getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const { trackingNumber } = req.body;
    
    const [orders] = await connection.execute(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    );
    
    if (orders.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    await connection.execute(
      'UPDATE orders SET status = ?, tracking_number = ?, shipped_at = NOW() WHERE id = ?',
      ['shipped', trackingNumber, id]
    );
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Shipping info updated successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating shipping:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating shipping',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

// Bulk payment for multiple orders
export const bulkPayment = async (req, res) => {
  const connection = await getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { orderIds, paymentMethod, paymentSlip, notes, shippingAddress } = req.body;
    const userId = req.user.id;
    
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order IDs are required'
      });
    }
    
    // Validate all orders belong to the user and are pending
    const [orders] = await connection.query(`
      SELECT id, order_number, total_amount, shipping_fee, status
      FROM orders 
      WHERE id IN (${orderIds.map(() => '?').join(',')}) 
      AND user_id = ? AND status = 'pending'
    `, [...orderIds, userId]);
    
    if (orders.length !== orderIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some orders are invalid or not pending'
      });
    }
    
    // Update all orders with payment information
    const updatePromises = orderIds.map(orderId => 
      connection.query(`
        UPDATE orders 
        SET 
          status = 'paid',
          payment_method = ?,
          payment_slip = ?,
          shipping_address = ?,
          updated_at = NOW()
        WHERE id = ?
      `, [paymentMethod, paymentSlip, JSON.stringify(shippingAddress), orderId])
    );
    
    await Promise.all(updatePromises);
    
    await connection.commit();
    
    // Send LINE notification
    try {
      const totalAmount = orders.reduce((sum, order) => 
        sum + parseFloat(order.total_amount) + parseFloat(order.shipping_fee || 0), 0
      );
      
      // Get detailed order information
      const [orderDetails] = await connection.query(`
        SELECT 
          o.*,
          p.name as product_name,
          p.description as product_description,
          p.image_url as product_image,
          u.name as seller_name
        FROM orders o
        JOIN products p ON o.product_id = p.id
        JOIN users u ON p.seller_id = u.id
        WHERE o.id IN (${orderIds.map(() => '?').join(',')})
        ORDER BY o.created_at DESC
      `, orderIds);
      
      await lineNotifyService.sendBulkPaymentNotification({
        orderNumbers: orders.map(o => o.order_number),
        orderDetails: orderDetails,
        totalAmount,
        paymentMethod,
        customerName: req.user.name || req.user.email
      });
    } catch (notifyError) {
      console.error('Error sending LINE notification:', notifyError);
    }
    
    res.json({
      success: true,
      message: 'Bulk payment submitted successfully',
      data: {
        orderIds,
        totalOrders: orders.length,
        totalAmount: orders.reduce((sum, order) => 
          sum + parseFloat(order.total_amount) + parseFloat(order.shipping_fee || 0), 0
        )
      }
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Error processing bulk payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing bulk payment',
      error: error.message
    });
  } finally {
    connection.release();
  }
};





