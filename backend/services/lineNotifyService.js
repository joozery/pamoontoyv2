import axios from 'axios';
import { pool } from '../config/database.js';

class LineMessagingService {
  constructor() {
    // LINE Messaging API Configuration
    // Get from: https://developers.line.biz/console/
    this.channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || 'YOUR_LINE_CHANNEL_ACCESS_TOKEN';
    this.adminUserId = process.env.LINE_ADMIN_USER_ID || 'YOUR_LINE_ADMIN_USER_ID';
    this.groupId = process.env.LINE_GROUP_ID || null;
    this.apiUrl = 'https://api.line.me/v2/bot/message/push';
  }

  // Get all admin LINE User IDs from database
  async getAdminLineUserIds() {
    try {
      const [admins] = await pool.query(
        'SELECT line_user_id FROM users WHERE role = ? AND line_user_id IS NOT NULL',
        ['admin']
      );
      return admins.map(admin => admin.line_user_id);
    } catch (error) {
      console.error('Error fetching admin LINE IDs:', error);
      return [];
    }
  }

  async sendPaymentNotification(orderData) {
    try {
      // Main flex message
      const flexMessage = {
        type: 'flex',
        altText: `🔔 แจ้งเตือนการชำระเงิน - คำสั่งซื้อ #${orderData.orderId}`,
        contents: {
          type: 'bubble',
          size: 'giga',
          header: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '🔔 แจ้งเตือนการชำระเงิน',
                color: '#ffffff',
                size: 'xl',
                weight: 'bold'
              }
            ],
            backgroundColor: '#FF6B00',
            paddingAll: '20px'
          },
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'box',
                    layout: 'horizontal',
                    contents: [
                      {
                        type: 'text',
                        text: '📦 คำสั่งซื้อ',
                        color: '#666666',
                        size: 'sm',
                        flex: 0
                      },
                      {
                        type: 'text',
                        text: `#${orderData.orderId}`,
                        weight: 'bold',
                        size: 'md',
                        align: 'end',
                        color: '#000000'
                      }
                    ],
                    margin: 'md'
                  },
                  {
                    type: 'box',
                    layout: 'horizontal',
                    contents: [
                      {
                        type: 'text',
                        text: '👤 ลูกค้า',
                        color: '#666666',
                        size: 'sm',
                        flex: 0
                      },
                      {
                        type: 'text',
                        text: orderData.customerName,
                        weight: 'bold',
                        size: 'sm',
                        align: 'end',
                        wrap: true
                      }
                    ],
                    margin: 'md'
                  },
                  {
                    type: 'box',
                    layout: 'horizontal',
                    contents: [
                      {
                        type: 'text',
                        text: '📱 เบอร์โทร',
                        color: '#666666',
                        size: 'sm',
                        flex: 0
                      },
                      {
                        type: 'text',
                        text: orderData.customerPhone,
                        size: 'sm',
                        align: 'end'
                      }
                    ],
                    margin: 'md'
                  },
                  {
                    type: 'box',
                    layout: 'horizontal',
                    contents: [
                      {
                        type: 'text',
                        text: '💳 ช่องทาง',
                        color: '#666666',
                        size: 'sm',
                        flex: 0
                      },
                      {
                        type: 'text',
                        text: orderData.paymentMethod === 'promptpay' ? 'พร้อมเพย์' : 'โอนธนาคาร',
                        size: 'sm',
                        align: 'end'
                      }
                    ],
                    margin: 'md'
                  },
                  {
                    type: 'box',
                    layout: 'horizontal',
                    contents: [
                      {
                        type: 'text',
                        text: '💰 ยอดชำระ',
                        color: '#666666',
                        size: 'sm',
                        flex: 0
                      },
                      {
                        type: 'text',
                        text: `฿${orderData.totalAmount.toLocaleString()}`,
                        weight: 'bold',
                        size: 'lg',
                        align: 'end',
                        color: '#00B900'
                      }
                    ],
                    margin: 'md'
                  },
                  {
                    type: 'separator',
                    margin: 'lg'
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      {
                        type: 'text',
                        text: '📍 ที่อยู่จัดส่ง',
                        color: '#666666',
                        size: 'sm',
                        margin: 'md'
                      },
                      {
                        type: 'text',
                        text: orderData.shippingAddress,
                        size: 'xs',
                        wrap: true,
                        color: '#333333',
                        margin: 'sm'
                      }
                    ]
                  }
                ]
              }
            ],
            spacing: 'md',
            paddingAll: '20px'
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'button',
                action: {
                  type: 'uri',
                  label: '✅ ตรวจสอบสลิป',
                  uri: 'https://pamoontoy.site/admin/payments'
                },
                style: 'primary',
                color: '#FF6B00',
                height: 'sm'
              }
            ],
            spacing: 'sm',
            paddingAll: '20px'
          }
        }
      };

      // Payment slip image message
      const imageMessage = orderData.paymentSlip ? {
        type: 'image',
        originalContentUrl: orderData.paymentSlip,
        previewImageUrl: orderData.paymentSlip
      } : null;

      // Combine messages
      const messages = [flexMessage];
      if (imageMessage) {
        messages.push(imageMessage);
      }

      if (this.channelAccessToken === 'YOUR_LINE_CHANNEL_ACCESS_TOKEN') {
        console.log('⚠️  LINE Messaging API Token not configured. Skipping notification.');
        console.log('Messages that would be sent:', JSON.stringify(messages, null, 2));
        return { success: false, message: 'Token not configured' };
      }

      // Get all admin LINE User IDs
      const adminIds = await this.getAdminLineUserIds();
      
      // Fallback to env variable if no admins have LINE ID
      if (adminIds.length === 0) {
        adminIds.push(this.adminUserId);
      }

      // Add group ID if configured
      const recipients = [...adminIds];
      if (this.groupId) {
        recipients.push(this.groupId);
      }

      console.log(`📤 Sending LINE notification to ${adminIds.length} admin(s)${this.groupId ? ' + 1 group' : ''}...`);

      // Send to all admins and group
      const results = await Promise.allSettled(
        recipients.map(recipientId => 
          axios.post(
            this.apiUrl,
            {
              to: recipientId,
              messages: messages
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.channelAccessToken}`
              }
            }
          )
        )
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      console.log(`✅ LINE notifications sent: ${successful} successful, ${failed} failed`);
      
      if (failed > 0) {
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`❌ Failed to send to recipient #${index + 1}:`, result.reason?.response?.data || result.reason?.message);
          }
        });
      }

      return { success: successful > 0, sent: successful, failed: failed };
    } catch (error) {
      console.error('❌ LINE Messaging API Error:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  async sendPaymentConfirmation(orderData) {
    try {
      const message = {
        type: 'flex',
        altText: `✅ ยืนยันการชำระเงิน - คำสั่งซื้อ #${orderData.orderId}`,
        contents: {
          type: 'bubble',
          header: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '✅ ยืนยันการชำระเงิน',
                color: '#ffffff',
                size: 'xl',
                weight: 'bold'
              }
            ],
            backgroundColor: '#00B900',
            paddingAll: '20px'
          },
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: '📦 คำสั่งซื้อ',
                    color: '#666666',
                    size: 'sm',
                    flex: 0
                  },
                  {
                    type: 'text',
                    text: `#${orderData.orderId}`,
                    weight: 'bold',
                    size: 'md',
                    align: 'end'
                  }
                ]
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: '👤 ลูกค้า',
                    color: '#666666',
                    size: 'sm',
                    flex: 0
                  },
                  {
                    type: 'text',
                    text: orderData.customerName,
                    weight: 'bold',
                    size: 'sm',
                    align: 'end'
                  }
                ],
                margin: 'md'
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: '💰 ยอดชำระ',
                    color: '#666666',
                    size: 'sm',
                    flex: 0
                  },
                  {
                    type: 'text',
                    text: `฿${orderData.totalAmount.toLocaleString()}`,
                    weight: 'bold',
                    size: 'lg',
                    align: 'end',
                    color: '#00B900'
                  }
                ],
                margin: 'md'
              },
              {
                type: 'separator',
                margin: 'lg'
              },
              {
                type: 'text',
                text: '📦 สถานะ: ยืนยันแล้ว - พร้อมจัดส่ง',
                color: '#00B900',
                size: 'sm',
                weight: 'bold',
                align: 'center',
                margin: 'lg'
              }
            ],
            spacing: 'md',
            paddingAll: '20px'
          }
        }
      };

      if (this.channelAccessToken === 'YOUR_LINE_CHANNEL_ACCESS_TOKEN') {
        console.log('⚠️  LINE Messaging API Token not configured. Skipping notification.');
        return { success: false, message: 'Token not configured' };
      }

      const response = await axios.post(
        this.apiUrl,
        {
          to: this.adminUserId,
          messages: [message]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.channelAccessToken}`
          }
        }
      );

      console.log('✅ LINE Confirmation sent successfully');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ LINE Messaging API Error:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  async sendBulkPaymentNotification(bulkPaymentData) {
    try {
      const { orderNumbers, orderDetails, totalAmount, paymentMethod, customerName } = bulkPaymentData;
      
      // Main flex message for bulk payment
      const flexMessage = {
        type: 'flex',
        altText: `🔔 แจ้งเตือนการชำระเงินรวม - ${orderNumbers.length} คำสั่งซื้อ`,
        contents: {
          type: 'bubble',
          size: 'giga',
          header: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '🔔 แจ้งเตือนการชำระเงินรวม',
                color: '#ffffff',
                size: 'xl',
                weight: 'bold'
              }
            ],
            backgroundColor: '#FF6B00',
            paddingAll: '20px'
          },
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '📦 รายการคำสั่งซื้อ',
                weight: 'bold',
                size: 'lg',
                color: '#1F2937',
                margin: 'md'
              },
              {
                type: 'separator',
                margin: 'md'
              },
              ...(orderDetails || orderNumbers).map((order, index) => ({
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'box',
                    layout: 'horizontal',
                    contents: [
                      {
                        type: 'text',
                        text: `#${order.order_number || order}`,
                        size: 'sm',
                        color: '#1F2937',
                        weight: 'bold',
                        flex: 0
                      },
                      {
                        type: 'text',
                        text: `฿${parseFloat(order.total_amount || 0).toLocaleString()}`,
                        size: 'sm',
                        color: '#059669',
                        weight: 'bold',
                        flex: 1,
                        align: 'end'
                      }
                    ],
                    margin: 'xs'
                  },
                  ...(order.product_name ? [{
                    type: 'text',
                    text: order.product_name,
                    size: 'xs',
                    color: '#6B7280',
                    wrap: true,
                    margin: 'xs'
                  }] : [])
                ],
                margin: 'sm',
                paddingAll: '10px',
                backgroundColor: '#F9FAFB',
                cornerRadius: '8px'
              })),
              {
                type: 'separator',
                margin: 'md'
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: '👤 ลูกค้า:',
                    size: 'sm',
                    color: '#6B7280',
                    flex: 0
                  },
                  {
                    type: 'text',
                    text: customerName || 'ไม่ระบุ',
                    size: 'sm',
                    color: '#1F2937',
                    weight: 'bold',
                    flex: 1,
                    align: 'end'
                  }
                ],
                margin: 'sm'
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: '💳 วิธีการชำระ:',
                    size: 'sm',
                    color: '#6B7280',
                    flex: 0
                  },
                  {
                    type: 'text',
                    text: paymentMethod === 'promptpay' ? 'พร้อมเพย์' : 
                          paymentMethod === 'bank_transfer' ? 'โอนเงิน' : paymentMethod,
                    size: 'sm',
                    color: '#1F2937',
                    weight: 'bold',
                    flex: 1,
                    align: 'end'
                  }
                ],
                margin: 'sm'
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: '💰 ยอดรวม:',
                    size: 'sm',
                    color: '#6B7280',
                    flex: 0
                  },
                  {
                    type: 'text',
                    text: `฿${totalAmount.toLocaleString()}`,
                    size: 'sm',
                    color: '#059669',
                    weight: 'bold',
                    flex: 1,
                    align: 'end'
                  }
                ],
                margin: 'sm'
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: '📊 จำนวนคำสั่งซื้อ:',
                    size: 'sm',
                    color: '#6B7280',
                    flex: 0
                  },
                  {
                    type: 'text',
                    text: `${orderNumbers.length} รายการ`,
                    size: 'sm',
                    color: '#1F2937',
                    weight: 'bold',
                    flex: 1,
                    align: 'end'
                  }
                ],
                margin: 'sm'
              }
            ],
            paddingAll: '20px'
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '⏰ กรุณาตรวจสอบและยืนยันการชำระเงิน',
                size: 'xs',
                color: '#6B7280',
                align: 'center',
                wrap: true
              }
            ],
            paddingAll: '15px'
          }
        }
      };

      if (this.channelAccessToken === 'YOUR_LINE_CHANNEL_ACCESS_TOKEN') {
        console.log('⚠️  LINE Messaging API Token not configured. Skipping bulk payment notification.');
        return { success: false, message: 'Token not configured' };
      }

      const response = await axios.post(
        this.apiUrl,
        {
          to: this.adminUserId,
          messages: [flexMessage]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.channelAccessToken}`
          }
        }
      );

      console.log('✅ LINE Bulk Payment Notification sent successfully');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ LINE Bulk Payment Notification Error:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }
}

export default new LineMessagingService();
