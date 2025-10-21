import React, { useState } from 'react';
import { Package, Clock, CheckCircle, XCircle, Truck, MapPin, Phone, ChevronRight, Filter, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const Orders = () => {
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const orders = [
        {
            id: 'ORD001',
            productName: 'ฟิกเกอร์ Iron Man Mark V',
            price: 6800,
            status: 'completed',
            date: '15 ตุลาคม 2024',
            deliveryDate: '18 ตุลาคม 2024',
            image: 'https://images.unsplash.com/photo-1559223669-e0065fa7f142',
            trackingNumber: 'TH1234567890'
        },
        {
            id: 'ORD002',
            productName: 'โมเดล Batman Limited Edition',
            price: 4800,
            status: 'shipping',
            date: '18 ตุลาคม 2024',
            estimatedDelivery: '22 ตุลาคม 2024',
            image: 'https://images.unsplash.com/photo-1559223669-e0065fa7f142',
            trackingNumber: 'TH0987654321'
        },
        {
            id: 'ORD003',
            productName: 'ของสะสม Transformers Vintage',
            price: 9500,
            status: 'pending',
            date: '20 ตุลาคม 2024',
            image: 'https://images.unsplash.com/photo-1559223669-e0065fa7f142'
        },
        {
            id: 'ORD004',
            productName: 'ชุด Lego Star Wars Millennium Falcon',
            price: 12000,
            status: 'shipping',
            date: '16 ตุลาคม 2024',
            estimatedDelivery: '21 ตุลาคม 2024',
            image: 'https://images.unsplash.com/photo-1559223669-e0065fa7f142',
            trackingNumber: 'TH5555666677'
        },
        {
            id: 'ORD005',
            productName: 'ฟิกเกอร์ Spider-Man Rare Edition',
            price: 5200,
            status: 'completed',
            date: '12 ตุลาคม 2024',
            deliveryDate: '15 ตุลาคม 2024',
            image: 'https://images.unsplash.com/photo-1559223669-e0065fa7f142',
            trackingNumber: 'TH9988776655'
        }
    ];

    const statusFilters = [
        { id: 'all', label: 'ทั้งหมด', count: orders.length },
        { id: 'pending', label: 'รอชำระเงิน', count: orders.filter(o => o.status === 'pending').length },
        { id: 'shipping', label: 'กำลังจัดส่ง', count: orders.filter(o => o.status === 'shipping').length },
        { id: 'completed', label: 'สำเร็จ', count: orders.filter(o => o.status === 'completed').length }
    ];

    const getStatusInfo = (status) => {
        switch (status) {
            case 'completed':
                return {
                    label: 'จัดส่งสำเร็จ',
                    color: 'bg-green-100 text-green-700 border-green-200',
                    icon: CheckCircle,
                    iconColor: 'text-green-500'
                };
            case 'shipping':
                return {
                    label: 'กำลังจัดส่ง',
                    color: 'bg-blue-100 text-blue-700 border-blue-200',
                    icon: Truck,
                    iconColor: 'text-blue-500'
                };
            case 'pending':
                return {
                    label: 'รอการชำระเงิน',
                    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                    icon: Clock,
                    iconColor: 'text-yellow-500'
                };
            case 'cancelled':
                return {
                    label: 'ยกเลิกแล้ว',
                    color: 'bg-red-100 text-red-700 border-red-200',
                    icon: XCircle,
                    iconColor: 'text-red-500'
                };
            default:
                return {
                    label: 'ไม่ทราบสถานะ',
                    color: 'bg-gray-100 text-gray-700 border-gray-200',
                    icon: Package,
                    iconColor: 'text-gray-500'
                };
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
        const matchesSearch = order.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            order.id.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-white py-6 md:py-12 pb-24 md:pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 md:mb-8"
                >
                    <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">คำสั่งซื้อของฉัน</h1>
                    <p className="text-sm md:text-base text-gray-600">ติดตามสถานะการสั่งซื้อและประมูลที่ชนะของคุณ</p>
                </motion.div>

                {/* Search & Filter */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6 mb-6"
                >
                    {/* Search Bar */}
                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="ค้นหาคำสั่งซื้อ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-sm md:text-base"
                        />
                    </div>

                    {/* Status Filters */}
                    <div className="flex flex-wrap gap-2 md:gap-3">
                        {statusFilters.map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => setSelectedStatus(filter.id)}
                                className={`px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-medium transition-all text-sm md:text-base ${
                                    selectedStatus === filter.id
                                        ? 'bg-gray-900 text-white shadow-lg hover:bg-black'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                                }`}
                            >
                                {filter.label} ({filter.count})
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center"
                    >
                        <Package className="w-16 h-16 md:w-20 md:h-20 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                            {searchTerm ? 'ไม่พบคำสั่งซื้อ' : 'ยังไม่มีคำสั่งซื้อ'}
                        </h3>
                        <p className="text-sm md:text-base text-gray-600">
                            {searchTerm ? 'ลองค้นหาด้วยคำอื่น' : 'เริ่มประมูลสินค้าที่คุณชอบตอนนี้!'}
                        </p>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order, index) => {
                            const statusInfo = getStatusInfo(order.status);
                            const StatusIcon = statusInfo.icon;

                            return (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all"
                                >
                                    {/* Order Header */}
                                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center space-x-3">
                                                <Package className="w-5 h-5 text-gray-900" />
                                                <span className="text-sm md:text-base font-semibold text-gray-900">
                                                    คำสั่งซื้อ #{order.id}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <span className="text-xs md:text-sm text-gray-500">
                                                    {order.date}
                                                </span>
                                                <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border ${statusInfo.color} text-xs md:text-sm font-medium`}>
                                                    <StatusIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                    <span>{statusInfo.label}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Content */}
                                    <div className="p-4 md:p-6">
                                        <div className="flex items-start space-x-4">
                                            {/* Product Image */}
                                            <div className="w-20 h-20 md:w-28 md:h-28 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border-2 border-gray-100">
                                                <img
                                                    src={order.image}
                                                    alt={order.productName}
                                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                                />
                                            </div>

                                            {/* Order Details */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base md:text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                                                    {order.productName}
                                                </h3>
                                                
                                                <div className="flex flex-wrap items-center gap-4 mb-4">
                                                    <div className="text-2xl md:text-3xl font-bold text-gray-900">
                                                        ฿{order.price.toLocaleString()}
                                                    </div>
                                                </div>

                                                {/* Tracking Info */}
                                                {order.trackingNumber && (
                                                    <div className="bg-gray-50 rounded-xl p-3 md:p-4 mb-4 border border-gray-200">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-xs md:text-sm font-medium text-gray-700">เลขพัสดุ</span>
                                                            <button className="text-xs md:text-sm text-gray-900 font-medium hover:text-gray-700">
                                                                คัดลอก
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Truck className="w-4 h-4 text-gray-900" />
                                                            <span className="text-sm md:text-base font-mono font-semibold text-gray-900">
                                                                {order.trackingNumber}
                                                            </span>
                                                        </div>
                                                        {order.estimatedDelivery && (
                                                            <p className="text-xs text-gray-600 mt-2">
                                                                คาดว่าจะถึง: {order.estimatedDelivery}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                <div className="flex flex-wrap gap-2 md:gap-3">
                                                    <button className="flex items-center space-x-2 px-4 md:px-6 py-2 md:py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all text-sm md:text-base">
                                                        <span>ดูรายละเอียด</span>
                                                        <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                    {order.status === 'shipping' && (
                                                        <button className="flex items-center space-x-2 px-4 md:px-6 py-2 md:py-2.5 border-2 border-gray-900 text-gray-900 rounded-xl font-medium hover:bg-gray-50 transition-all text-sm md:text-base">
                                                            <Truck className="w-4 h-4" />
                                                            <span>ติดตามพัสดุ</span>
                                                        </button>
                                                    )}
                                                    {order.status === 'completed' && (
                                                        <button className="flex items-center space-x-2 px-4 md:px-6 py-2 md:py-2.5 border-2 border-gray-900 text-gray-900 rounded-xl font-medium hover:bg-gray-50 transition-all text-sm md:text-base">
                                                            <CheckCircle className="w-4 h-4" />
                                                            <span>รีวิวสินค้า</span>
                                                        </button>
                                                    )}
                                                    {order.status === 'pending' && (
                                                        <button className="flex items-center space-x-2 px-4 md:px-6 py-2 md:py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all text-sm md:text-base">
                                                            <span>ชำระเงิน</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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
                        className="mt-6 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-xl p-6 md:p-8 text-white border border-gray-700"
                    >
                        <h3 className="text-lg md:text-xl font-bold mb-4">สรุปคำสั่งซื้อ</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <div className="text-2xl md:text-3xl font-bold">{orders.length}</div>
                                <div className="text-xs md:text-sm text-gray-300">คำสั่งซื้อทั้งหมด</div>
                            </div>
                            <div>
                                <div className="text-2xl md:text-3xl font-bold">
                                    {orders.filter(o => o.status === 'completed').length}
                                </div>
                                <div className="text-xs md:text-sm text-gray-300">จัดส่งสำเร็จ</div>
                            </div>
                            <div>
                                <div className="text-2xl md:text-3xl font-bold">
                                    {orders.filter(o => o.status === 'shipping').length}
                                </div>
                                <div className="text-xs md:text-sm text-gray-300">กำลังจัดส่ง</div>
                            </div>
                            <div>
                                <div className="text-2xl md:text-3xl font-bold">
                                    ฿{orders.reduce((sum, order) => sum + order.price, 0).toLocaleString()}
                                </div>
                                <div className="text-xs md:text-sm text-gray-300">มูลค่าทั้งหมด</div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Orders;
