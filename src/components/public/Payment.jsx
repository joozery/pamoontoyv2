import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import apiService from '../../services/api';
import { CreditCard, Upload, CheckCircle, ArrowLeft, Copy, QrCode, Smartphone, MapPin, ShoppingCart } from 'lucide-react';
import Swal from 'sweetalert2';
import generatePayload from 'promptpay-qr';
import { QRCodeCanvas } from 'qrcode.react';

export default function Payment() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [order, setOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('promptpay');
  const [slipFile, setSlipFile] = useState(null);
  const [slipPreview, setSlipPreview] = useState(null);
  const [notes, setNotes] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    address: '',
    district: '',
    province: '',
    postalCode: ''
  });
  const [isBulkPayment, setIsBulkPayment] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const qrRef = useRef();

  useEffect(() => {
    // Check if this is bulk payment
    if (location.state?.bulkPayment) {
      setIsBulkPayment(true);
      setSelectedOrderIds(location.state.orderIds || []);
      
      // Use setTimeout to ensure state is updated before calling fetchBulkOrders
      setTimeout(() => {
        fetchBulkOrders();
      }, 100);
    } else {
      fetchOrder();
    }
  }, [orderId, location.state]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await apiService.orders.getById(orderId);
      setOrder(response.data.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้',
        icon: 'error',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#000'
      });
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchBulkOrders = async () => {
    try {
      const orderIds = location.state?.orderIds || selectedOrderIds;
      setLoading(true);
      
      if (!orderIds || orderIds.length === 0) {
        console.error('No order IDs provided for bulk payment');
        throw new Error('No order IDs provided');
      }
      
      const orderPromises = orderIds.map(id => {
        return apiService.orders.getById(id);
      });
      
      const responses = await Promise.all(orderPromises);
      
      const orderData = responses.map(response => response.data.data);
      
      setOrders(orderData);
      
      // Set the first order as the main order for display
      if (orderData.length > 0) {
        setOrder(orderData[0]);
      }
      
    } catch (error) {
      console.error('Error fetching bulk orders:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้',
        icon: 'error',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#000'
      });
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          title: 'ไฟล์ใหญ่เกินไป',
          text: 'ไฟล์ต้องมีขนาดไม่เกิน 5MB',
          icon: 'warning',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#000'
        });
        return;
      }
      
      setSlipFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      Swal.fire({
        title: 'กรุณาใส่โค้ดส่วนลด',
        text: 'กรุณาใส่โค้ดส่วนลดที่ต้องการใช้',
        icon: 'warning',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#000'
      });
      return;
    }

    try {
      setApplyingDiscount(true);
      const response = await apiService.discounts.validate(discountCode);
      const discount = response.data.data;
      
      if (discount && discount.is_active) {
        const discountValue = discount.discount_type === 'percentage' 
          ? (totalAmount * discount.discount_value / 100)
          : discount.discount_value;
        
        setDiscountAmount(Math.min(discountValue, totalAmount));
        setDiscountApplied(true);
        
        Swal.fire({
          title: 'ใช้โค้ดส่วนลดสำเร็จ!',
          text: `ได้รับส่วนลด ${discount.discount_type === 'percentage' ? discount.discount_value + '%' : '฿' + discount.discount_value}`,
          icon: 'success',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#000'
        });
      } else {
        Swal.fire({
          title: 'โค้ดส่วนลดไม่ถูกต้อง',
          text: 'กรุณาตรวจสอบโค้ดส่วนลดอีกครั้ง',
          icon: 'error',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#000'
        });
      }
    } catch (error) {
      console.error('Error applying discount:', error);
      Swal.fire({
        title: 'โค้ดส่วนลดไม่ถูกต้อง',
        text: 'กรุณาตรวจสอบโค้ดส่วนลดอีกครั้ง',
        icon: 'error',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#000'
      });
    } finally {
      setApplyingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    setDiscountCode('');
    setDiscountAmount(0);
    setDiscountApplied(false);
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('images', file); // Changed from 'file' to 'images' to match backend

    try {
      const response = await apiService.upload.images(formData);
      return response.data.urls[0];
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw new Error('ไม่สามารถอัพโหลดรูปภาพได้');
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    Swal.fire({
      title: 'คัดลอกแล้ว!',
      text: `คัดลอก${label}เรียบร้อยแล้ว`,
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate shipping address
    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address || 
        !shippingAddress.district || !shippingAddress.province || !shippingAddress.postalCode) {
      Swal.fire({
        title: 'กรุณากรอกที่อยู่จัดส่ง',
        text: 'กรุณากรอกข้อมูลที่อยู่จัดส่งให้ครบถ้วน',
        icon: 'warning',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#000'
      });
      return;
    }

    if (!slipFile) {
      Swal.fire({
        title: 'กรุณาอัพโหลดสลิป',
        text: 'กรุณาอัพโหลดหลักฐานการโอนเงิน',
        icon: 'warning',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#000'
      });
      return;
    }

    try {
      setSubmitting(true);

      let slipUrl = null;
      if (slipFile) {
        slipUrl = await uploadToCloudinary(slipFile);
      }

      const fullAddress = `${shippingAddress.fullName}, ${shippingAddress.phone}, ${shippingAddress.address}, ${shippingAddress.district}, ${shippingAddress.province} ${shippingAddress.postalCode}`;
      
      if (isBulkPayment) {
        await apiService.orders.bulkPayment({
          orderIds: selectedOrderIds,
          paymentMethod,
          paymentSlip: slipUrl,
          notes,
          shippingAddress: fullAddress,
        });
      } else {
        await apiService.orders.submitPayment(orderId, {
          paymentMethod,
          paymentSlip: slipUrl,
          notes,
          shippingAddress: fullAddress,
        });
      }

      Swal.fire({
        title: 'ส่งหลักฐานสำเร็จ!',
        text: 'ส่งหลักฐานการชำระเงินสำเร็จ รอการตรวจสอบจากผู้ขาย',
        icon: 'success',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#000'
      }).then(() => {
        navigate('/orders');
      });
    } catch (error) {
      console.error('Error submitting payment:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถส่งหลักฐานการชำระเงินได้',
        icon: 'error',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#000'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  let images = [];
  if (order.product_images) {
    try {
      images = typeof order.product_images === 'string' ? JSON.parse(order.product_images) : order.product_images;
    } catch (e) {
      console.error('Error parsing product images:', e);
      images = [];
    }
  }
  const imageUrl = images[0] || order.product_image || 'https://placehold.co/300x300/1f2937/9ca3af?text=No+Image';
  const shippingFee = parseFloat(order.shipping_fee || order.shipping_cost || 0);
  const subtotal = isBulkPayment 
    ? orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0)
    : parseFloat(order.total_amount);
  
  const totalShipping = isBulkPayment
    ? orders.reduce((sum, order) => sum + parseFloat(order.shipping_fee || order.shipping_cost || 0), 0)
    : shippingFee;
  
  const totalAmount = subtotal + totalShipping;
  const finalAmount = totalAmount - discountAmount;

  // Generate PromptPay QR Code
  const promptPayNumber = '0839094516';
  const promptPayPayload = generatePayload(promptPayNumber, { amount: finalAmount });

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            กลับไปคำสั่งซื้อ
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {isBulkPayment ? 'ชำระเงินรวม' : 'ชำระเงิน'}
          </h1>
          <p className="text-gray-600">
            {isBulkPayment 
              ? `คำสั่งซื้อ ${selectedOrderIds.length} รายการ` 
              : `คำสั่งซื้อ #${order.id}`
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                {isBulkPayment ? 'รายละเอียดคำสั่งซื้อรวม' : 'รายละเอียดคำสั่งซื้อ'}
              </h2>
              
              {isBulkPayment ? (
                <div className="space-y-3">
                  {orders.map((orderItem, index) => {
                    let itemImages = [];
                    if (orderItem.product_images) {
                      try {
                        itemImages = typeof orderItem.product_images === 'string' ? JSON.parse(orderItem.product_images) : orderItem.product_images;
                      } catch (e) {
                        itemImages = [];
                      }
                    }
                    const itemImageUrl = itemImages[0] || orderItem.product_image || 'https://placehold.co/300x300/1f2937/9ca3af?text=No+Image';
                    
                    return (
                      <div key={orderItem.id} className="flex gap-4 p-3 bg-gray-700/50 rounded-lg">
                        <img
                          src={itemImageUrl}
                          alt={orderItem.product_name}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0 border border-gray-600"
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/300x300/1f2937/9ca3af?text=No+Image';
                          }}
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-white mb-1">{orderItem.product_name}</h3>
                          <p className="text-sm text-gray-400">ผู้ขาย: {orderItem.seller_name}</p>
                          <p className="text-lg font-bold text-white mt-1">
                            ฿{parseFloat(orderItem.total_amount).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex gap-4">
                  <img
                    src={imageUrl}
                    alt={order.product_name}
                    className="w-20 h-20 object-cover rounded-xl flex-shrink-0 border-2 border-gray-700"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/300x300/1f2937/9ca3af?text=No+Image';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-white mb-1">{order.product_name}</h3>
                    <p className="text-sm text-gray-400">ผู้ขาย: {order.seller_name}</p>
                    <p className="text-lg font-bold text-white mt-2">
                      ฿{parseFloat(order.total_amount).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-white">วิธีการชำระเงิน</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border-2 border-gray-700 rounded-xl cursor-pointer hover:border-gray-500 transition-colors bg-gray-800/50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="promptpay"
                    checked={paymentMethod === 'promptpay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-gray-900"
                  />
                  <Smartphone className="w-5 h-5 text-blue-400" />
                  <span className="font-medium text-white">พร้อมเพย์ (PromptPay)</span>
                </label>
                
                <label className="flex items-center gap-3 p-4 border-2 border-gray-700 rounded-xl cursor-pointer hover:border-gray-500 transition-colors bg-gray-800/50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-gray-900"
                  />
                  <CreditCard className="w-5 h-5 text-green-400" />
                  <span className="font-medium text-white">โอนเงินผ่านธนาคาร</span>
                </label>
              </div>

              {/* PromptPay Details */}
              {paymentMethod === 'promptpay' && (
                <div className="mt-4 p-6 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-700/50">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    สแกน QR Code เพื่อชำระเงิน
                  </h3>
                  
                  {/* QR Code */}
                  <div className="bg-white rounded-xl p-6 mb-4 flex flex-col items-center">
                    <QRCodeCanvas 
                      value={promptPayPayload}
                      size={256}
                      level="H"
                      includeMargin={true}
                      ref={qrRef}
                    />
                    <p className="text-xs text-gray-500 mt-2">สแกนเพื่อชำระเงิน ฿{totalAmount.toLocaleString()}</p>
                  </div>

                  <div className="space-y-3 text-sm bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">พร้อมเพย์:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-white">{promptPayNumber}</span>
                        <button
                          onClick={() => copyToClipboard(promptPayNumber, 'เบอร์พร้อมเพย์')}
                          className="p-1 hover:bg-gray-700 rounded transition-colors"
                        >
                          <Copy className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">ชื่อบัญชี:</span>
                      <span className="font-medium text-white">ณัฏฐนันท์ โชติณภาลัย</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">ราคาสินค้า:</span>
                      <span className="font-medium text-white">฿{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">ค่าจัดส่ง:</span>
                      <span className="font-medium text-white">฿{totalShipping.toLocaleString()}</span>
                    </div>
                    {discountApplied && (
                      <div className="flex justify-between text-green-400">
                        <span className="text-gray-300">ส่วนลด:</span>
                        <span className="font-medium">-฿{discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                      <span className="text-gray-300 font-semibold">ยอดที่ต้องชำระ:</span>
                      <span className="text-xl font-bold text-blue-400">
                        ฿{finalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Transfer Details */}
              {paymentMethod === 'bank_transfer' && (
                <div className="mt-4 p-6 bg-gradient-to-br from-green-900/30 to-teal-900/30 rounded-xl border border-green-700/50">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    บัญชีธนาคารสำหรับโอนเงิน
                  </h3>
                  <div className="space-y-3 text-sm bg-gray-900/50 rounded-xl p-4 border border-gray-700">
                    <div className="flex justify-between">
                      <span className="text-gray-300">ธนาคาร:</span>
                      <span className="font-medium text-white">กสิกรไทย (KBANK)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">ชื่อบัญชี:</span>
                      <span className="font-medium text-white">ณัฏฐนันท์ โชติณภาลัย</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">ชื่อบริษัท:</span>
                      <span className="font-medium text-white">WEP PAMOON</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">เลขบัญชี:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-white">1353189235</span>
                        <button
                          onClick={() => copyToClipboard('1353189235', 'เลขบัญชี')}
                          className="p-1 hover:bg-gray-700 rounded transition-colors"
                        >
                          <Copy className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">ราคาสินค้า:</span>
                      <span className="font-medium text-white">฿{parseFloat(order.total_amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">ค่าจัดส่ง:</span>
                      <span className="font-medium text-white">฿{shippingFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                      <span className="text-gray-300 font-semibold">ยอดที่ต้องชำระ:</span>
                      <span className="text-xl font-bold text-green-400">
                        ฿{totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Discount Code */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                โค้ดส่วนลด
              </h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="ใส่โค้ดส่วนลด"
                  className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-600 focus:border-transparent text-white placeholder-gray-500"
                  disabled={discountApplied}
                />
                {!discountApplied ? (
                  <button
                    onClick={handleApplyDiscount}
                    disabled={applyingDiscount}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                  >
                    {applyingDiscount ? 'กำลังตรวจสอบ...' : 'ใช้โค้ด'}
                  </button>
                ) : (
                  <button
                    onClick={handleRemoveDiscount}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                  >
                    ยกเลิก
                  </button>
                )}
              </div>
              {discountApplied && (
                <div className="mt-3 p-3 bg-green-900/30 border border-green-700/50 rounded-lg">
                  <p className="text-green-400 text-sm">
                    ✓ ใช้โค้ดส่วนลดสำเร็จ! ประหยัดได้ ฿{discountAmount.toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Shipping Address */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                ที่อยู่จัดส่ง
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ชื่อ-นามสกุล <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.fullName}
                    onChange={(e) => setShippingAddress({...shippingAddress, fullName: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-600 focus:border-transparent text-white placeholder-gray-500"
                    placeholder="กรอกชื่อ-นามสกุล"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    เบอร์โทรศัพท์ <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-600 focus:border-transparent text-white placeholder-gray-500"
                    placeholder="กรอกเบอร์โทร"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ที่อยู่ <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-600 focus:border-transparent text-white placeholder-gray-500"
                    placeholder="บ้านเลขที่, ถนน, ซอย, หมู่บ้าน"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    แขวง/ตำบล <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.district}
                    onChange={(e) => setShippingAddress({...shippingAddress, district: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-600 focus:border-transparent text-white placeholder-gray-500"
                    placeholder="แขวง/ตำบล"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    จังหวัด <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.province}
                    onChange={(e) => setShippingAddress({...shippingAddress, province: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-600 focus:border-transparent text-white placeholder-gray-500"
                    placeholder="จังหวัด"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    รหัสไปรษณีย์ <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-600 focus:border-transparent text-white placeholder-gray-500"
                    placeholder="รหัสไปรษณีย์"
                    maxLength="5"
                  />
                </div>
              </div>
            </div>

            {/* Upload Slip */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-white">อัพโหลดหลักฐานการโอนเงิน</h2>
              
              <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center hover:border-gray-500 transition-colors bg-gray-900/50">
                {slipPreview ? (
                  <div className="space-y-4">
                    <img
                      src={slipPreview}
                      alt="Payment slip"
                      className="max-h-64 mx-auto rounded-lg border-2 border-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSlipFile(null);
                        setSlipPreview(null);
                      }}
                      className="text-sm text-red-400 hover:text-red-300 transition-colors"
                    >
                      ลบรูปภาพ
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-300 mb-1">คลิกเพื่ออัพโหลดสลิป</p>
                    <p className="text-xs text-gray-500">รองรับไฟล์ JPG, PNG (สูงสุด 5MB)</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Notes */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  หมายเหตุ (ถ้ามี)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-600 focus:border-transparent text-white placeholder-gray-500"
                  placeholder="ระบุข้อมูลเพิ่มเติม (ถ้ามี)"
                />
              </div>
            </div>
          </div>

          {/* Sidebar - Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 sticky top-6 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-white">สรุปการชำระเงิน</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">ราคาสินค้า</span>
                  <span className="font-medium text-white">฿{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">ค่าจัดส่ง</span>
                  <span className="font-medium text-white">฿{totalShipping.toLocaleString()}</span>
                </div>
                {discountApplied && (
                  <div className="flex justify-between text-sm text-green-400">
                    <span className="text-gray-400">ส่วนลด</span>
                    <span className="font-medium">-฿{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-gray-700 pt-3 flex justify-between">
                  <span className="font-semibold text-white">ยอดรวมทั้งหมด</span>
                  <span className="text-xl font-bold text-white">
                    ฿{finalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || !slipFile}
                className={`w-full mt-6 px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  submitting || !slipFile
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-gray-200 shadow-lg hover:shadow-xl'
                }`}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                    กำลังส่ง...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    ยืนยันการชำระเงิน
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">
                กดยืนยันเมื่อโอนเงินเรียบร้อยแล้ว
                <br />
                ระบบจะตรวจสอบภายใน 24 ชั่วโมง
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}








