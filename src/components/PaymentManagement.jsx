import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, CheckCircle, XCircle, Eye, CreditCard, Clock, Search, Filter } from 'lucide-react';
import apiService from '../services/api';
import Swal from 'sweetalert2';

const statusConfig = {
  pending: { label: 'รอชำระเงิน', color: 'bg-yellow-100 text-yellow-700', icon: Clock, needsConfirm: false },
  paid: { label: 'ยืนยันแล้ว', color: 'bg-green-100 text-green-700', icon: CheckCircle, needsConfirm: false },
  confirmed: { label: 'ยืนยันแล้ว', color: 'bg-green-100 text-green-700', icon: CheckCircle, needsConfirm: false },
  shipped: { label: 'จัดส่งแล้ว', color: 'bg-purple-100 text-purple-700', icon: Package, needsConfirm: false },
  delivered: { label: 'ส่งสำเร็จ', color: 'bg-green-200 text-green-800', icon: CheckCircle, needsConfirm: false },
  cancelled: { label: 'ยกเลิก', color: 'bg-red-100 text-red-700', icon: XCircle, needsConfirm: false },
};

const PaymentManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // Default to show all
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showSlipModal, setShowSlipModal] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, statusFilter, searchTerm]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await apiService.orders.getAllAdmin();
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถโหลดข้อมูลได้',
        icon: 'error',
        confirmButtonColor: '#000'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filter by status
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending-review') {
        // แสดงเฉพาะที่ยังไม่ได้ยืนยัน (มี payment_slip แต่ tracking_number ยังไม่มี)
        filtered = filtered.filter(order => 
          order.status === 'paid' && order.payment_slip && !order.tracking_number
        );
      } else if (statusFilter === 'confirmed') {
        // แสดงเฉพาะที่ยืนยันแล้ว (มี tracking_number หรือ status เป็น shipped/delivered)
        filtered = filtered.filter(order => 
          order.tracking_number || order.status === 'shipped' || order.status === 'delivered'
        );
      } else {
        filtered = filtered.filter(order => order.status === statusFilter);
      }
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const handleConfirmPayment = async (orderId) => {
    // ✅ ใช้ SweetAlert2 พร้อมช่องกรอกเลขพัสดุ
    const result = await Swal.fire({
      title: 'ยืนยันการชำระเงิน',
      html: `
        <div class="text-left space-y-4">
          <p class="text-sm text-gray-600 mb-4">กรอกเลขพัสดุเพื่อแจ้งลูกค้า (ถ้ามี)</p>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              เลขพัสดุ (ไม่จำเป็น)
            </label>
            <input 
              id="tracking-input" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="เช่น TH1234567890, EMS1234567890"
            />
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      focusConfirm: false,
      preConfirm: () => {
        const trackingNumber = document.getElementById('tracking-input').value;
        return { trackingNumber };
      }
    });

    if (result.isConfirmed) {
      try {
        const { trackingNumber } = result.value;
        
        // ✅ ส่งเลขพัสดุไปด้วย
        await apiService.orders.confirmPayment(orderId, {
          tracking_number: trackingNumber || null
        });
        
        Swal.fire({
          title: 'สำเร็จ!',
          html: trackingNumber 
            ? `ยืนยันการชำระเงินเรียบร้อยแล้ว<br><small class="text-gray-600">เลขพัสดุ: ${trackingNumber}</small>`
            : 'ยืนยันการชำระเงินเรียบร้อยแล้ว',
          icon: 'success',
          confirmButtonColor: '#000'
        });
        loadOrders();
      } catch (error) {
        console.error('Error confirming payment:', error);
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: error.response?.data?.message || 'ไม่สามารถยืนยันการชำระเงินได้',
          icon: 'error',
          confirmButtonColor: '#000'
        });
      }
    }
  };

  const handleViewSlip = (order) => {
    setSelectedOrder(order);
    setShowSlipModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-slate-900 to-slate-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-3xl font-bold text-white flex items-center gap-2">
                <CreditCard className="w-8 h-8" />
                จัดการการชำระเงิน
              </CardTitle>
              <p className="text-sm text-slate-300">ตรวจสอบและยืนยันการชำระเงิน</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาคำสั่งซื้อ, ลูกค้า, สินค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ทั้งหมด ({orders.length})
              </button>
              <button
                onClick={() => setStatusFilter('pending-review')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'pending-review'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                รอตรวจสอบ ({orders.filter(o => o.status === 'paid' && o.payment_slip && !o.tracking_number).length})
              </button>
              <button
                onClick={() => setStatusFilter('confirmed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'confirmed'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                ยืนยันแล้ว ({orders.filter(o => o.tracking_number || o.status === 'shipped' || o.status === 'delivered').length})
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="pt-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">ไม่พบข้อมูล</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">คำสั่งซื้อ</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">ลูกค้า</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">สินค้า</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">ยอดรวม</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">ช่องทาง</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">สถานะ</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">วันที่</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const status = statusConfig[order.status] || statusConfig.pending;
                    const StatusIcon = status.icon;
                    const totalAmount = parseFloat(order.total_amount) + parseFloat(order.shipping_fee || 0);

                    return (
                      <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="font-mono text-sm font-semibold">#{order.id}</div>
                          {order.order_number && (
                            <div className="text-xs text-gray-500">{order.order_number}</div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium">{order.customer_name || 'N/A'}</div>
                          <div className="text-xs text-gray-500">{order.customer_email}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm">{order.product_name}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-semibold">{formatCurrency(totalAmount)}</div>
                          {order.shipping_fee > 0 && (
                            <div className="text-xs text-gray-500">
                              (ค่าส่ง {formatCurrency(order.shipping_fee)})
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-xs">
                            {order.payment_method === 'promptpay' ? 'พร้อมเพย์' : 'โอนธนาคาร'}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {(() => {
                            // ✅ แสดงสถานะที่ชัดเจน
                            if (order.tracking_number) {
                              return (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                  <CheckCircle className="w-3 h-3" />
                                  ยืนยันแล้ว
                                </span>
                              );
                            } else if (order.status === 'paid' && order.payment_slip) {
                              return (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                  <CreditCard className="w-3 h-3" />
                                  ชำระแล้ว-รอตรวจสอบ
                                </span>
                              );
                            } else {
                              return (
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                  <StatusIcon className="w-3 h-3" />
                                  {status.label}
                                </span>
                              );
                            }
                          })()}
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-600">
                          {new Date(order.created_at).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            {order.payment_slip && (
                              <Button
                                onClick={() => handleViewSlip(order)}
                                variant="outline"
                                size="sm"
                                className="text-xs"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                ดูสลิป
                              </Button>
                            )}
                            {order.status === 'paid' && !order.tracking_number && (
                              <Button
                                onClick={() => handleConfirmPayment(order.id)}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white text-xs"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                ยืนยัน
                              </Button>
                            )}
                            {order.tracking_number && (
                              <div className="text-xs text-green-600 font-mono">
                                📦 {order.tracking_number}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Slip Modal */}
      {showSlipModal && selectedOrder && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowSlipModal(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">หลักฐานการโอนเงิน</h3>
                  <p className="text-sm text-gray-600">คำสั่งซื้อ #{selectedOrder.id}</p>
                </div>
                <button
                  onClick={() => setShowSlipModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Order Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ลูกค้า:</span>
                  <span className="font-medium">{selectedOrder.customer_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ยอดชำระ:</span>
                  <span className="font-semibold text-lg">
                    {formatCurrency(parseFloat(selectedOrder.total_amount) + parseFloat(selectedOrder.shipping_fee || 0))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ช่องทาง:</span>
                  <span>{selectedOrder.payment_method === 'promptpay' ? 'พร้อมเพย์' : 'โอนธนาคาร'}</span>
                </div>
                {selectedOrder.shipping_address && (
                  <div className="text-sm pt-2 border-t">
                    <span className="text-gray-600">ที่อยู่จัดส่ง:</span>
                    <p className="mt-1">{selectedOrder.shipping_address}</p>
                  </div>
                )}
              </div>

              {/* Payment Slip Image */}
              {selectedOrder.payment_slip && (
                <div className="border rounded-lg overflow-hidden">
                  <img
                    src={selectedOrder.payment_slip}
                    alt="Payment Slip"
                    className="w-full h-auto"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setShowSlipModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  ปิด
                </Button>
                {selectedOrder.status === 'paid' && (
                  <Button
                    onClick={() => {
                      handleConfirmPayment(selectedOrder.id);
                      setShowSlipModal(false);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    ยืนยันการชำระเงิน
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;
