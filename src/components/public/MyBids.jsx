import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Trophy, TrendingUp, Package, Gavel, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import apiService from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const MyBids = () => {
    const { isAuthenticated } = useAuth();
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        if (isAuthenticated()) {
            fetchBids();
        }
    }, [isAuthenticated]);

    const fetchBids = async () => {
        try {
            setLoading(true);
            const response = await apiService.bids.getUserBids();
            const bidsData = response.data.data || [];
            
            // Debug: Log the data to see what we're getting
            
            setBids(bidsData);
        } catch (error) {
            console.error('Error fetching bids:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTimeRemaining = (auctionEnd) => {
        if (!auctionEnd) return 'ไม่ระบุ';
        const now = new Date();
        const end = new Date(auctionEnd);
        const diff = end - now;
        
        if (diff <= 0) return 'สิ้นสุดแล้ว';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) return `${days} วัน ${hours} ชม.`;
        if (hours > 0) return `${hours} ชม. ${minutes} นาที`;
        return `${minutes} นาที`;
    };

    const getBidStatus = (bid) => {
        const now = new Date();
        const auctionEnd = new Date(bid.auction_end_time);
        
        if (bid.product_status === 'sold') {
            return bid.is_winning ? 'won' : 'lost';
        }
        
        if (auctionEnd <= now) {
            return bid.is_winning ? 'won' : 'lost';
        }
        
        return bid.is_winning ? 'leading' : 'outbid';
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'leading':
                return { 
                    label: 'กำลังนำ', 
                    color: 'text-green-600 bg-green-50', 
                    icon: TrendingUp 
                };
            case 'won':
                return { 
                    label: 'ชนะการประมูล', 
                    color: 'text-yellow-600 bg-yellow-50', 
                    icon: Trophy 
                };
            case 'outbid':
                return { 
                    label: 'ถูกแซง', 
                    color: 'text-red-600 bg-red-50', 
                    icon: Clock 
                };
            case 'lost':
                return { 
                    label: 'แพ้การประมูล', 
                    color: 'text-gray-600 bg-gray-50', 
                    icon: Package 
                };
            default:
                return { 
                    label: 'ไม่ทราบ', 
                    color: 'text-gray-600 bg-gray-50', 
                    icon: Clock 
                };
        }
    };

    const filteredBids = bids.filter(bid => {
        const status = getBidStatus(bid);
        switch (activeTab) {
            case 'active':
                return status === 'leading' || status === 'outbid';
            case 'won':
                return status === 'won';
            case 'lost':
                return status === 'lost';
            default:
                return true;
        }
    });

    if (!isAuthenticated()) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">กรุณาเข้าสู่ระบบ</h1>
                    <p className="text-gray-600 mb-6">คุณต้องเข้าสู่ระบบเพื่อดูรายการประมูล</p>
                    <Link to="/login" className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-black transition-colors">
                        เข้าสู่ระบบ
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8 pb-24">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Link 
                        to="/" 
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        กลับหน้าหลัก
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <Gavel className="w-8 h-8 text-gray-900" />
                        รายการประมูลของฉัน
                    </h1>
                    <p className="text-gray-600">ติดตามสถานะการประมูลของคุณ</p>
                </div>

                {/* Tabs */}
                <div className="mb-6">
                    <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg w-fit">
                        {[
                            { id: 'all', label: 'ทั้งหมด', count: bids.length },
                            { id: 'active', label: 'กำลังประมูล', count: bids.filter(bid => {
                                const status = getBidStatus(bid);
                                return status === 'leading' || status === 'outbid';
                            }).length },
                            { id: 'won', label: 'ชนะ', count: bids.filter(bid => getBidStatus(bid) === 'won').length },
                            { id: 'lost', label: 'แพ้', count: bids.filter(bid => getBidStatus(bid) === 'lost').length }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                {tab.label} ({tab.count})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-4 text-gray-600">กำลังโหลด...</p>
                    </div>
                ) : filteredBids.length === 0 ? (
                    <div className="text-center py-12">
                        <Gavel className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {activeTab === 'all' ? 'ยังไม่มีรายการประมูล' : `ไม่มีรายการ${activeTab === 'active' ? 'กำลังประมูล' : activeTab === 'won' ? 'ที่ชนะ' : 'ที่แพ้'}`}
                        </h3>
                        <p className="text-gray-600 mb-6">เริ่มประมูลสินค้าที่คุณสนใจได้เลย</p>
                        <Link 
                            to="/" 
                            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-black transition-colors"
                        >
                            ดูสินค้า
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredBids.map((bid, index) => {
                            const status = getBidStatus(bid);
                            const statusInfo = getStatusInfo(status);
                            const StatusIcon = statusInfo.icon;

                            return (
                                <motion.div
                                    key={bid.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                                >
                                    <div className="p-4">
                                        <div className="flex gap-4">
                                            {/* Product Image */}
                                            <div className="flex-shrink-0 relative">
                                                <img
                                                    src={bid.product_image || 'https://placehold.co/120x120/e5e7eb/9ca3af?text=No+Image'}
                                                    alt={bid.product_name}
                                                    className="w-24 h-24 object-cover rounded-lg"
                                                    onError={(e) => {
                                                        e.target.src = 'https://placehold.co/120x120/e5e7eb/9ca3af?text=No+Image';
                                                    }}
                                                    onLoad={() => {
                                                    }}
                                                />
                                                {/* Status Badge */}
                                                <div className={`absolute bottom-1 left-1 px-2 py-1 rounded text-xs font-semibold text-white ${status === 'leading' ? 'bg-green-600' : status === 'won' ? 'bg-yellow-600' : status === 'outbid' ? 'bg-red-600' : 'bg-gray-600'}`}>
                                                    {statusInfo.label}
                                                </div>
                                            </div>
                                            
                                            {/* Product Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                                                    {bid.product_name}
                                                </h3>
                                                
                                                <div className="mb-3">
                                                    <p className="text-lg font-bold text-gray-900">
                                                        ฿{parseFloat(bid.current_price).toLocaleString()}
                                                    </p>
                                                </div>
                                                
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        <span>{getTimeRemaining(bid.auction_end_time)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <TrendingUp className="w-4 h-4" />
                                                        <span>{bid.bid_count || 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Action Button */}
                                            <div className="flex-shrink-0">
                                                <Link 
                                                    to={`/product/${bid.product_id}`}
                                                    className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors text-sm font-medium"
                                                >
                                                    ดูสินค้า
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBids;
