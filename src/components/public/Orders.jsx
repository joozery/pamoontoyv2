import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, Truck, ChevronRight, Search, ShoppingCart, CreditCard, CheckSquare, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '@/services/api';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import Swal from 'sweetalert2';

const Orders = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrders, setSelectedOrders] = useState([]);

    useEffect(() => {
        if (isAuthenticated()) {
            fetchOrders();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await apiService.orders.getAll();
            const ordersData = response.data.data || [];
            setOrders(ordersData);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถโหลดคำสั่งซื้อได้",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const statusFilters = [
        { id: 'all', label: 'ทั้งหมด', count: orders.length },
        { id: 'pending', label: 'รอชำระเงิน', count: orders.filter(o => o.status === 'pending').length },
        { id: 'paid', label: 'ชำระแล้ว', count: orders.filter(o => o.status === 'paid').length },
        { id: 'confirmed', label: 'ยืนยันแล้ว', count: orders.filter(o => o.status === 'confirmed' || o.tracking_number).length },
        { id: 'shipped', label: 'จัดส่งแล้ว', count: orders.filter(o => o.shipped_at).length },
    ];

    const getStatusBadge = (order) => {
        if (order.shipped_at) {
            return <Badge className="bg-purple-100 text-purple-800 border-purple-200 border">จัดส่งแล้ว</Badge>;
        }
        if (order.tracking_number) {
            return <Badge className="bg-green-100 text-green-800 border-green-200 border">ยืนยันแล้ว</Badge>;
        }
        
        switch (order.status) {
            case 'paid':
                return <Badge className="bg-blue-100 text-blue-800 border-blue-200 border">ชำระเงินแล้ว</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 border">รอการชำระเงิน</Badge>;
            case 'cancelled':
                return <Badge className="bg-red-100 text-red-800 border-red-200 border">ยกเลิกแล้ว</Badge>;
            default:
                return <Badge variant="secondary">ไม่ทราบสถานะ</Badge>;
        }
    };

    const getImageUrl = (order) => {
        if (order.product_image) return order.product_image;
        if (order.product_images) {
            try {
                const images = typeof order.product_images === 'string' ? JSON.parse(order.product_images) : order.product_images;
                if (Array.isArray(images) && images.length > 0) return images[0];
            } catch (e) {
                console.error('Error parsing images:', e);
            }
        }
        return 'https://placehold.co/400x400/e5e7eb/9ca3af?text=No+Image';
    };

    const filteredOrders = orders.filter(order => {
        const matchesStatus = selectedStatus === 'all' || 
            (selectedStatus === 'pending' && order.status === 'pending') ||
            (selectedStatus === 'paid' && order.status === 'paid') ||
            (selectedStatus === 'confirmed' && (order.status === 'confirmed' || order.tracking_number)) ||
            (selectedStatus === 'shipped' && order.shipped_at);
        
        const matchesSearch = (order.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                            order.id.toString().toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const pendingOrders = filteredOrders.filter(o => o.status === 'pending');
    const hasManyPendingOrders = pendingOrders.length > 1;

    // Auto-select all pending orders if there are multiple
    useEffect(() => {
        if (hasManyPendingOrders && selectedOrders.length === 0) {
            setSelectedOrders(pendingOrders.map(o => o.id));
        }
    }, [pendingOrders.length]);

    const toggleOrderSelection = (orderId) => {
        // Prevent individual selection if there are multiple pending orders
        if (hasManyPendingOrders) {
            return;
        }
        
        setSelectedOrders(prev => 
            prev.includes(orderId) 
                ? prev.filter(id => id !== orderId)
                : [...prev, orderId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedOrders.length === pendingOrders.length) {
            setSelectedOrders([]);
        } else {
            setSelectedOrders(pendingOrders.map(o => o.id));
        }
    };

    const handleBulkPayment = async () => {
        if (selectedOrders.length === 0) return;

        const selectedOrdersData = orders.filter(o => selectedOrders.includes(o.id));
        const totalAmount = selectedOrdersData.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

        const result = await Swal.fire({
            title: 'ยืนยันการชำระเงิน',
            html: `
                <div class="text-left">
                    <p class="mb-2">คุณต้องการชำระเงินสำหรับ <strong>${selectedOrders.length}</strong> รายการ</p>
                    <p class="text-2xl font-bold text-blue-600">รวม ฿${totalAmount.toLocaleString()}</p>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'ชำระเงิน',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            navigate('/payment/bulk', { 
                state: { 
                    bulkPayment: true,
                    orderIds: selectedOrders,
                    orders: selectedOrdersData
                } 
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">กำลังโหลดคำสั่งซื้อ...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-6 md:py-12 pb-40 md:pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">คำสั่งซื้อของฉัน</h1>
                    <p className="text-gray-600">ติดตามสถานะการสั่งซื้อและประมูลที่ชนะของคุณ</p>
                </motion.div>

                {/* Search & Filter Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            {/* Search Bar */}
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="ค้นหาคำสั่งซื้อ..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {/* Status Filters */}
                            <div className="flex flex-wrap gap-2">
                                {statusFilters.map((filter) => (
                                    <Button
                                        key={filter.id}
                                        variant={selectedStatus === filter.id ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedStatus(filter.id)}
                                    >
                                        {filter.label} ({filter.count})
                                    </Button>
                                ))}
                            </div>

                            {/* Select All (only show for pending orders) */}
                            {selectedStatus === 'pending' && pendingOrders.length > 0 && (
                                <div className="mt-4 pt-4 border-t">
                                    {hasManyPendingOrders ? (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <CreditCard className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <h4 className="font-semibold text-blue-900 mb-1">
                                                        ชำระเงินรวมทั้งหมด {pendingOrders.length} รายการ
                                                    </h4>
                                                    <p className="text-sm text-blue-700">
                                                        เมื่อมีคำสั่งซื้อรอชำระหลายรายการ จะต้องชำระเงินรวมทั้งหมด 
                                                        เพื่อรับส่วนลดค่าจัดส่ง 40 บาทสำหรับสินค้าที่ประมูลในวันเดียวกัน
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id="select-all"
                                                checked={selectedOrders.length === pendingOrders.length && pendingOrders.length > 0}
                                                onCheckedChange={toggleSelectAll}
                                            />
                                            <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                                                เลือกทั้งหมด ({pendingOrders.length} รายการ)
                                            </label>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                                    {searchTerm ? 'ไม่พบคำสั่งซื้อ' : 'ยังไม่มีคำสั่งซื้อ'}
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {searchTerm ? 'ลองค้นหาด้วยคำอื่น' : 'เริ่มประมูลสินค้าที่คุณชอบตอนนี้!'}
                                </p>
                                <Button onClick={() => navigate('/')}>
                                    เริ่มประมูล
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order, index) => {
                            const imageUrl = getImageUrl(order);
                            const isPending = order.status === 'pending';
                            const isSelected = selectedOrders.includes(order.id);

                            return (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className={`overflow-hidden hover:shadow-lg transition-shadow ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                                        {/* Order Header */}
                                        <CardHeader className="bg-gray-50 border-b">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {isPending && !hasManyPendingOrders && (
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={() => toggleOrderSelection(order.id)}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                        <Package className="w-5 h-5 text-gray-700" />
                                                        <span className="font-semibold text-gray-900">
                                                            คำสั่งซื้อ #{order.id}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm text-gray-500">
                                                        {new Date(order.created_at).toLocaleDateString('th-TH', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                    {getStatusBadge(order)}
                                                </div>
                                            </div>
                                        </CardHeader>

                                        {/* Order Content */}
                                        <CardContent className="p-6">
                                            <div className="flex gap-4">
                                                {/* Product Image */}
                                                <div 
                                                    className="w-24 h-24 md:w-32 md:h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                                                    onClick={() => navigate(`/order/${order.id}`)}
                                                >
                                                    <img
                                                        src={imageUrl}
                                                        alt={order.product_name}
                                                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                                        onError={(e) => {
                                                            e.target.src = 'https://placehold.co/400x400/e5e7eb/9ca3af?text=No+Image';
                                                        }}
                                                    />
                                                </div>

                                                {/* Order Details */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                                                        {order.product_name}
                                                    </h3>
                                                    
                                                    <div className="flex items-baseline gap-3 mb-4">
                                                        <div className="text-3xl font-bold text-gray-900">
                                                            ฿{parseFloat(order.total_amount || 0).toLocaleString()}
                                                        </div>
                                                        {order.shipping_cost > 0 && (
                                                            <div className="text-sm text-gray-500">
                                                                + ค่าจัดส่ง ฿{parseFloat(order.shipping_cost).toLocaleString()}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Tracking Info */}
                                                    {order.tracking_number && (
                                                        <div className="bg-gray-50 rounded-lg p-4 mb-4 border">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-sm font-medium text-gray-700">เลขพัสดุ</span>
                                                                <Button 
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        navigator.clipboard.writeText(order.tracking_number);
                                                                        toast({
                                                                            title: "คัดลอกแล้ว",
                                                                            description: "คัดลอกเลขพัสดุแล้ว"
                                                                        });
                                                                    }}
                                                                >
                                                                    คัดลอก
                                                                </Button>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Truck className="w-4 h-4 text-gray-700" />
                                                                <span className="font-mono font-semibold text-gray-900">
                                                                    {order.tracking_number}
                                                                </span>
                                                            </div>
                                                            {order.shipped_at && (
                                                                <p className="text-xs text-gray-600 mt-2">
                                                                    จัดส่งเมื่อ: {new Date(order.shipped_at).toLocaleDateString('th-TH')}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Action Buttons */}
                                                    <div className="flex flex-wrap gap-2">
                                                        <Button 
                                                            variant="default"
                                                            onClick={() => navigate(`/order/${order.id}`)}
                                                        >
                                                            ดูรายละเอียด
                                                            <ChevronRight className="w-4 h-4 ml-1" />
                                                        </Button>
                                                        {isPending && !hasManyPendingOrders && !isSelected && (
                                                            <Button 
                                                                variant="default"
                                                                className="bg-blue-600 hover:bg-blue-700"
                                                                onClick={() => navigate(`/payment/${order.id}`)}
                                                            >
                                                                <CreditCard className="w-4 h-4 mr-2" />
                                                                ชำระเงิน
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Summary Card */}
                {filteredOrders.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-6"
                    >
                        <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-0">
                            <CardHeader>
                                <CardTitle>สรุปคำสั่งซื้อ</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <div className="text-3xl font-bold">{orders.length}</div>
                                        <div className="text-sm text-gray-300">คำสั่งซื้อทั้งหมด</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold">
                                            {orders.filter(o => o.tracking_number || o.status === 'confirmed').length}
                                        </div>
                                        <div className="text-sm text-gray-300">ยืนยันแล้ว</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold">
                                            {orders.filter(o => o.shipped_at).length}
                                        </div>
                                        <div className="text-sm text-gray-300">จัดส่งแล้ว</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold">
                                            ฿{orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0).toLocaleString()}
                                        </div>
                                        <div className="text-sm text-gray-300">มูลค่าทั้งหมด</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>

            {/* Floating Action Bar for Bulk Payment */}
            <AnimatePresence>
                {selectedOrders.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-50"
                    >
                        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
                            {/* Mobile Layout */}
                            <div className="md:hidden space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CheckSquare className="w-5 h-5 text-blue-600" />
                                        <span className="font-semibold text-gray-900 text-sm">
                                            {hasManyPendingOrders ? 'ชำระทั้งหมด' : 'เลือกแล้ว'} {selectedOrders.length} รายการ
                                        </span>
                                    </div>
                                    <div className="text-xl font-bold text-blue-600">
                                        ฿{orders
                                            .filter(o => selectedOrders.includes(o.id))
                                            .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)
                                            .toLocaleString()}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {!hasManyPendingOrders && (
                                        <Button 
                                            variant="outline" 
                                            onClick={() => setSelectedOrders([])}
                                            className="flex-1"
                                            size="sm"
                                        >
                                            ยกเลิก
                                        </Button>
                                    )}
                                    <Button 
                                        className={`bg-blue-600 hover:bg-blue-700 ${hasManyPendingOrders ? 'w-full' : 'flex-1'}`}
                                        onClick={handleBulkPayment}
                                        size="sm"
                                    >
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        ชำระเงินทั้งหมด
                                    </Button>
                                </div>
                            </div>
                            
                            {/* Desktop Layout */}
                            <div className="hidden md:flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <CheckSquare className="w-5 h-5 text-blue-600" />
                                        <span className="font-semibold text-gray-900">
                                            {hasManyPendingOrders ? 'ชำระทั้งหมด' : 'เลือกแล้ว'} {selectedOrders.length} รายการ
                                        </span>
                                    </div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        ฿{orders
                                            .filter(o => selectedOrders.includes(o.id))
                                            .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)
                                            .toLocaleString()}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {!hasManyPendingOrders && (
                                        <Button 
                                            variant="outline" 
                                            onClick={() => setSelectedOrders([])}
                                        >
                                            ยกเลิก
                                        </Button>
                                    )}
                                    <Button 
                                        className="bg-blue-600 hover:bg-blue-700"
                                        onClick={handleBulkPayment}
                                    >
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        ชำระเงินทั้งหมด
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Orders;
