import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, Clock, TrendingUp, Filter, Grid, List, Star, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '@/services/api';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Favorites = () => {
    const { isAuthenticated } = useAuth();
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [sortBy, setSortBy] = useState('recent'); // 'recent', 'price-low', 'price-high', 'ending-soon'
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated()) {
            fetchFavorites();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            const response = await apiService.favorites.getAll();
            const favoritesData = response.data.data || [];
            setFavorites(favoritesData);
        } catch (error) {
            console.error('Error fetching favorites:', error);
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถโหลดรายการโปรดได้",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (productId) => {
        try {
            await apiService.favorites.remove(productId);
            setFavorites(favorites.filter(item => item.product_id !== productId));
            toast({
                title: "ลบออกจากรายการโปรด",
                description: "ลบสินค้าออกจากรายการโปรดแล้ว"
            });
        } catch (error) {
            console.error('Error removing favorite:', error);
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถลบรายการโปรดได้",
                variant: "destructive"
            });
        }
    };

    const sortOptions = [
        { value: 'recent', label: 'เพิ่มล่าสุด' },
        { value: 'price-low', label: 'ราคา: ต่ำ - สูง' },
        { value: 'price-high', label: 'ราคา: สูง - ต่ำ' },
        { value: 'ending-soon', label: 'ใกล้ปิดการประมูล' }
    ];

    const getSortedFavorites = () => {
        let sorted = [...favorites];
        switch (sortBy) {
            case 'price-low':
                return sorted.sort((a, b) => (a.current_price || a.starting_price) - (b.current_price || b.starting_price));
            case 'price-high':
                return sorted.sort((a, b) => (b.current_price || b.starting_price) - (a.current_price || a.starting_price));
            case 'ending-soon':
                return sorted.sort((a, b) => new Date(a.auction_end) - new Date(b.auction_end));
            default:
                return sorted;
        }
    };

    const CountdownTimer = ({ endTime }) => {
        const [timeLeft, setTimeLeft] = useState('');

        React.useEffect(() => {
            const timer = setInterval(() => {
                const now = new Date().getTime();
                const end = new Date(endTime).getTime();
                const distance = end - now;

                if (distance < 0) {
                    setTimeLeft('สิ้นสุดแล้ว');
                    clearInterval(timer);
                } else {
                    const hours = Math.floor(distance / (1000 * 60 * 60));
                    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                    setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                }
            }, 1000);

            return () => clearInterval(timer);
        }, [endTime]);

        return (
            <div className="flex items-center space-x-1 text-xs md:text-sm font-semibold">
                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>{timeLeft}</span>
            </div>
        );
    };

    const sortedFavorites = getSortedFavorites();

    // Helper function to get image URL
    const getImageUrl = (item) => {
        if (item.image_url) return item.image_url;
        if (item.primary_image) return item.primary_image;
        if (item.images) {
            try {
                const images = typeof item.images === 'string' ? JSON.parse(item.images) : item.images;
                if (Array.isArray(images) && images.length > 0) return images[0];
            } catch (e) {
                console.error('Error parsing images:', e);
            }
        }
        return 'https://placehold.co/400x400/e5e7eb/9ca3af?text=No+Image';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-white py-6 md:py-12 pb-24 md:pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 md:mb-8"
                >
                    <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">รายการโปรด</h1>
                    <p className="text-sm md:text-base text-gray-600">
                        สินค้าที่คุณสนใจและติดตาม ({favorites.length} รายการ)
                    </p>
                </motion.div>

                {/* Controls */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6 mb-6"
                >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Sort Dropdown */}
                        <div className="flex items-center space-x-3">
                            <Filter className="w-5 h-5 text-gray-400" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-sm md:text-base font-medium text-gray-700"
                            >
                                {sortOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* View Toggle */}
                        <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 md:p-2.5 rounded-lg transition-all ${
                                    viewMode === 'grid'
                                        ? 'bg-gray-900 text-white shadow-lg'
                                        : 'text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 md:p-2.5 rounded-lg transition-all ${
                                    viewMode === 'list'
                                        ? 'bg-gray-900 text-white shadow-lg'
                                        : 'text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Favorites List */}
                {favorites.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center"
                    >
                        <Heart className="w-16 h-16 md:w-20 md:h-20 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">ยังไม่มีรายการโปรด</h3>
                        <p className="text-sm md:text-base text-gray-600">กดหัวใจที่สินค้าที่คุณชอบเพื่อเพิ่มในรายการโปรด</p>
                    </motion.div>
                ) : (
                    <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6' : 'space-y-4'}>
                        <AnimatePresence mode="popLayout">
                            {sortedFavorites.map((item, index) => {
                                const currentPrice = parseFloat(item.current_price || item.starting_price || 0);
                                const imageUrl = getImageUrl(item);
                                
                                return (
                                    <motion.div
                                        key={item.product_id || item.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all group ${
                                            viewMode === 'list' ? 'flex' : ''
                                        }`}
                                    >
                                        <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                                            <img
                                                src={imageUrl}
                                                alt={item.product_name || item.name}
                                                className={`w-full object-cover group-hover:scale-110 transition-transform duration-300 ${
                                                    viewMode === 'list' ? 'h-full' : 'h-40 md:h-56'
                                                }`}
                                                onError={(e) => {
                                                    e.target.src = 'https://placehold.co/400x400/e5e7eb/9ca3af?text=No+Image';
                                                }}
                                            />
                                            {/* Remove Button */}
                                            <button
                                                onClick={() => handleRemove(item.product_id || item.id)}
                                                className="absolute top-3 right-3 w-9 h-9 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-all group/btn"
                                            >
                                                <Heart className="w-5 h-5 text-red-500 fill-red-500 group-hover/btn:scale-110 transition-transform" />
                                            </button>
                                            {/* Condition Badge */}
                                            {item.condition_status && (
                                                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 md:px-3 py-1 rounded-full text-xs font-semibold text-gray-700">
                                                    {item.condition_status === 'new' ? 'ใหม่' : item.condition_status === 'used' ? 'มือสอง' : item.condition_status}
                                                </div>
                                            )}
                                        </div>

                                        <div className={`p-3 md:p-5 flex flex-col ${viewMode === 'list' ? 'flex-1' : ''}`}>
                                            {/* Product Name */}
                                            <h3 className="text-sm md:text-lg font-bold text-gray-900 line-clamp-2 mb-2 min-h-[40px] md:min-h-[56px]">
                                                {item.product_name || item.name}
                                            </h3>

                                            {/* Price */}
                                            <div className="mb-3">
                                                <div className="flex items-baseline space-x-2">
                                                    <span className="text-xl md:text-2xl font-bold text-gray-900">
                                                        ฿{currentPrice.toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {item.product_status === 'active' ? 'ราคาปัจจุบัน' : 'ราคาเริ่มต้น'}
                                                </p>
                                            </div>

                                            {/* Stats */}
                                            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                                                <div className="flex items-center space-x-1 text-gray-900">
                                                    <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                    <span className="text-xs md:text-sm font-semibold">{item.bid_count || 0} ผู้ประมูล</span>
                                                </div>
                                                {item.auction_end && (
                                                    <div className="text-gray-900 font-medium">
                                                        <CountdownTimer endTime={item.auction_end} />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center space-x-2 mt-auto">
                                                <Link 
                                                    to={`/product/${item.product_id || item.id}`}
                                                    className="flex-1 bg-gray-900 hover:bg-black text-white py-2 md:py-2.5 px-3 md:px-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-1.5 md:space-x-2 text-xs md:text-sm font-semibold"
                                                >
                                                    <ShoppingCart className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                    <span>ดูสินค้า</span>
                                                </Link>
                                                <button
                                                    onClick={() => handleRemove(item.product_id || item.id)}
                                                    className="w-9 h-9 md:w-10 md:h-10 border-2 border-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-50 hover:border-gray-900 transition-all group/del"
                                                >
                                                    <Trash2 className="w-4 h-4 text-gray-600 group-hover/del:text-gray-900 transition-colors" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}

                {/* Summary Card */}
                {favorites.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-6 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-xl p-6 md:p-8 text-white border border-gray-700"
                    >
                        <h3 className="text-lg md:text-xl font-bold mb-4">สรุปรายการโปรด</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <div className="text-2xl md:text-3xl font-bold">{favorites.length}</div>
                                <div className="text-xs md:text-sm text-gray-300">รายการทั้งหมด</div>
                            </div>
                            <div>
                                <div className="text-2xl md:text-3xl font-bold">
                                    ฿{Math.min(...favorites.map(f => parseFloat(f.current_price || f.starting_price || 0))).toLocaleString()}
                                </div>
                                <div className="text-xs md:text-sm text-gray-300">ราคาต่ำสุด</div>
                            </div>
                            <div>
                                <div className="text-2xl md:text-3xl font-bold">
                                    ฿{Math.max(...favorites.map(f => parseFloat(f.current_price || f.starting_price || 0))).toLocaleString()}
                                </div>
                                <div className="text-xs md:text-sm text-gray-300">ราคาสูงสุด</div>
                            </div>
                            <div>
                                <div className="text-2xl md:text-3xl font-bold">
                                    ฿{Math.round(favorites.reduce((sum, f) => sum + parseFloat(f.current_price || f.starting_price || 0), 0) / favorites.length).toLocaleString()}
                                </div>
                                <div className="text-xs md:text-sm text-gray-300">ราคาเฉลี่ย</div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Favorites;
