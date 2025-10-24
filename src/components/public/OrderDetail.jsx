import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import { ArrowLeft, Package, Clock, CheckCircle, Truck, XCircle, MapPin, Phone, Mail, Copy, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';

const statusConfig = {
  pending: { label: 'รอชำระเงิน', icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
  paid: { label: 'ชำระเงินแล้ว', icon: CheckCircle, color: 'text-blue-600 bg-blue-50' },
  confirmed: { label: 'ยืนยันแล้ว', icon: CheckCircle, color: 'text-green-600 bg-green-50' },
  shipped: { label: 'จัดส่งแล้ว', icon: Truck, color: 'text-purple-600 bg-purple-50' },
  delivered: { label: 'ได้รับสินค้า', icon: Package, color: 'text-green-700 bg-green-100' },
  cancelled: { label: 'ยกเลิกแล้ว', icon: XCircle, color: 'text-red-600 bg-red-50' },
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await apiService.orders.getById(id);
      setOrder(response.data.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      alert('ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to strip HTML tags
  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const StatusIcon = statusConfig[order.status]?.icon || Package;
  let images = [];
  if (order.product_images) {
    try {
      images = typeof order.product_images === 'string' ? JSON.parse(order.product_images) : order.product_images;
    } catch (e) {
      console.error('Error parsing product images:', e);
      images = [];
    }
  }
  const imageUrl = images[0] || order.product_image || 'https://placehold.co/300x300/e5e7eb/9ca3af?text=No+Image';
  const totalAmount = parseFloat(order.total_amount) + parseFloat(order.shipping_fee || order.shipping_cost || 0);

  return (
    <div className="min-h-screen bg-gray-50 py-3 md:py-6 px-3 md:px-4 lg:px-8 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-4 md:mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/orders')}
            className="mb-3 md:mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับไปคำสั่งซื้อ
          </Button>
          
          <Card className="border-none shadow-md">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <CardTitle className="text-lg md:text-2xl">
                    คำสั่งซื้อ #{order.id}
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm mt-1">
                    {new Date(order.created_at).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </CardDescription>
                </div>
                <Badge 
                  variant={order.tracking_number ? "default" : order.status === 'paid' ? "secondary" : "outline"}
                  className={`${order.tracking_number ? 'bg-green-600' : order.status === 'paid' ? 'bg-blue-600' : ''} h-8 px-3 text-xs md:text-sm whitespace-nowrap`}
                >
                  <StatusIcon className="w-3 h-3 md:w-4 md:h-4 mr-1.5" />
                  {order.tracking_number ? 'ยืนยันแล้ว' : statusConfig[order.status]?.label}
                </Badge>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-3 md:space-y-4">
            {/* Tracking Number - Show First if Available */}
            {order.tracking_number && (
              <Card className="border-green-200 bg-green-50/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-green-600" />
                    <CardTitle className="text-base md:text-lg text-green-900">ข้อมูลการจัดส่ง</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-white rounded-lg p-3 md:p-4 border border-green-200">
                    <p className="text-xs text-gray-600 font-medium mb-2">เลขพัสดุ</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-bold text-green-700 text-sm md:text-xl tracking-wide flex-1 break-all">
                        {order.tracking_number}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-shrink-0 h-8 text-xs border-green-600 text-green-600 hover:bg-green-50"
                        onClick={() => {
                          navigator.clipboard.writeText(order.tracking_number);
                          toast({
                            title: "คัดลอกแล้ว",
                            description: "คัดลอกเลขพัสดุแล้ว"
                          });
                        }}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        คัดลอก
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      📦 สามารถติดตามพัสดุได้ที่เว็บไซต์ขนส่ง
                    </p>
                  </div>
                  
                  {order.shipped_at && (
                    <div className="text-xs md:text-sm text-gray-600">
                      <span className="font-medium">จัดส่งเมื่อ:</span> {new Date(order.shipped_at).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                  
                  <div className="bg-green-100 border border-green-200 rounded-lg p-3 text-xs md:text-sm text-green-800">
                    ✅ ร้านค้าได้จัดส่งสินค้าแล้ว กรุณารอรับพัสดุตามที่อยู่ที่ระบุไว้
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Product Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">รายละเอียดสินค้า</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <img
                    src={imageUrl}
                    alt={order.product_name}
                    className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity border"
                    onClick={() => navigate(`/product/${order.product_id}`)}
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/300x300/e5e7eb/9ca3af?text=No+Image';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="font-semibold text-sm md:text-base mb-1 cursor-pointer hover:text-blue-600 transition-colors line-clamp-2"
                      onClick={() => navigate(`/product/${order.product_id}`)}
                    >
                      {order.product_name}
                    </h3>
                    {order.product_description && (
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {stripHtml(order.product_description)}
                      </p>
                    )}
                    {order.condition_status && (
                      <Badge variant="secondary" className="text-xs">
                        สภาพ: {order.condition_status === 'new' ? 'ใหม่' : 'มือสอง'}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">ข้อมูลผู้ขาย</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {order.seller_name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{order.seller_name}</p>
                    <p className="text-xs text-gray-500">ผู้ขาย</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs md:text-sm">
                    <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="truncate">{order.seller_email}</span>
                  </div>
                  {order.seller_phone && (
                    <div className="flex items-center gap-2 text-xs md:text-sm">
                      <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span>{order.seller_phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Slip */}
            {order.payment_slip && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base md:text-lg">หลักฐานการชำระเงิน</CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={order.payment_slip}
                    alt="Payment slip"
                    className="w-full max-w-xs rounded-lg border"
                  />
                  {order.paid_at && (
                    <p className="text-xs text-gray-500 mt-3">
                      ชำระเมื่อ: {new Date(order.paid_at).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {order.notes && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base md:text-lg">หมายเหตุ</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 leading-relaxed">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-base md:text-lg">สรุปคำสั่งซื้อ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ราคาสินค้า</span>
                  <span className="font-semibold">฿{parseFloat(order.total_amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ค่าจัดส่ง</span>
                  <span className="font-semibold">฿{parseFloat(order.shipping_cost || 0).toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg">
                  <span className="font-semibold text-sm md:text-base">ยอดรวมทั้งหมด</span>
                  <span className="text-lg md:text-xl font-bold text-blue-600">
                    ฿{totalAmount.toLocaleString()}
                  </span>
                </div>

                {/* Timeline */}
                <Separator className="my-4" />
                <div>
                  <h3 className="font-semibold text-sm mb-3">สถานะการสั่งซื้อ</h3>
                  <div className="space-y-3">
                    {/* Created */}
                    <div className="flex gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${order.created_at ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {order.created_at ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-xs">สร้างคำสั่งซื้อ</p>
                        {order.created_at && (
                          <p className="text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleDateString('th-TH', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Paid */}
                    <div className="flex gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${order.paid_at ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        {order.paid_at ? (
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-xs">ชำระเงิน</p>
                        {order.paid_at && (
                          <p className="text-xs text-gray-500">
                            {new Date(order.paid_at).toLocaleDateString('th-TH', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Confirmed */}
                    <div className="flex gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${order.tracking_number ? 'bg-purple-100' : 'bg-gray-100'}`}>
                        {order.tracking_number ? (
                          <CheckCircle className="w-4 h-4 text-purple-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-xs">ยืนยันการชำระเงิน</p>
                        {order.updated_at && order.tracking_number && (
                          <p className="text-xs text-gray-500">
                            {new Date(order.updated_at).toLocaleDateString('th-TH', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Shipped */}
                    <div className="flex gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${order.shipped_at ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {order.shipped_at ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-xs">จัดส่งสินค้า</p>
                        {order.shipped_at && (
                          <p className="text-xs text-gray-500">
                            {new Date(order.shipped_at).toLocaleDateString('th-TH', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Delivered */}
                    <div className="flex gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${order.delivered_at ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {order.delivered_at ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-xs">ได้รับสินค้า</p>
                        {order.delivered_at && (
                          <p className="text-xs text-gray-500">
                            {new Date(order.delivered_at).toLocaleDateString('th-TH', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                {order.status === 'pending' && (
                  <Button
                    onClick={() => navigate(`/payment/${order.id}`)}
                    className="w-full mt-4"
                    size="lg"
                  >
                    ชำระเงินตอนนี้
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

