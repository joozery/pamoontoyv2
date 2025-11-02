import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ShoppingBag, User, LogOut, Package, Heart, Menu, X, Gavel } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import pamoonLogo from '@/assets/pamoontoy.png';
import { useAuth } from '@/contexts/AuthContext';
import apiService from '@/services/api';

const MobileHeader = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const [searchParams] = useSearchParams();
    const selectedCategory = searchParams.get('category');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [favoriteCount, setFavoriteCount] = useState(0);
    const [orderCount, setOrderCount] = useState(0);
    const [bidsCount, setBidsCount] = useState(0);
    const [categories, setCategories] = useState([]);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    // Fetch categories on mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Fetch counts when user logs in
    useEffect(() => {
        if (isAuthenticated()) {
            fetchFavoriteCount();
            fetchPendingOrdersCount();
            fetchBidsCount();
        } else {
            setFavoriteCount(0);
            setOrderCount(0);
            setBidsCount(0);
        }

        // Listen for favorite changes
        const handleFavoriteChange = () => {
            if (isAuthenticated()) {
                fetchFavoriteCount();
            }
        };

        // Listen for order changes
        const handleOrderChange = () => {
            if (isAuthenticated()) {
                fetchPendingOrdersCount();
            }
        };

        // Listen for bid changes
        const handleBidChange = () => {
            if (isAuthenticated()) {
                fetchBidsCount();
            }
        };

        window.addEventListener('favoriteChanged', handleFavoriteChange);
        window.addEventListener('orderChanged', handleOrderChange);
        window.addEventListener('bidChanged', handleBidChange);
        
        return () => {
            window.removeEventListener('favoriteChanged', handleFavoriteChange);
            window.removeEventListener('orderChanged', handleOrderChange);
            window.removeEventListener('bidChanged', handleBidChange);
        };
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };

        if (showUserMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showUserMenu]);

    const fetchFavoriteCount = async () => {
        try {
            const response = await apiService.favorites.getAll();
            const favoritesData = response.data.data || [];
            
            // Filter out products that have ended (same logic as Favorites page)
            const now = new Date();
            const activeFavorites = favoritesData.filter(item => {
                // Keep items without auction_end
                if (!item.auction_end) return true;
                
                // Keep items that haven't ended yet
                const endTime = new Date(item.auction_end);
                return endTime > now;
            });
            
            setFavoriteCount(activeFavorites.length);
        } catch (error) {
            console.error('Failed to fetch favorites count:', error);
        }
    };

    const fetchPendingOrdersCount = async () => {
        try {
            const response = await apiService.orders.getAll();
            const orders = response.data.data || [];
            const pendingCount = orders.filter(order => order.status === 'pending').length;
            setOrderCount(pendingCount);
        } catch (error) {
            console.error('Failed to fetch orders count:', error);
        }
    };

    const fetchBidsCount = async () => {
        try {
            const response = await apiService.bids.getUserBids();
            const bids = response.data.data || [];
            // นับเฉพาะการประมูลที่ยังไม่สิ้นสุด (กำลังนำ + ถูกแซง)
            const activeBids = bids.filter(bid => {
                const now = new Date();
                const auctionEnd = new Date(bid.auction_end_time);
                return auctionEnd > now && bid.product_status === 'active';
            }).length;
            setBidsCount(activeBids);
        } catch (error) {
            console.error('Failed to fetch bids count:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await apiService.categories.getAll();
            setCategories(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
        navigate('/');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <header className="sticky top-0 bg-gradient-to-br from-gray-900 via-black to-gray-800 border-b border-gray-800 shadow-lg z-50 md:hidden">
            {/* Main Header Bar - All in one row */}
            <div className="px-3 py-2.5">
                <div className="flex items-center space-x-2">
                    {/* Logo */}
                    <Link to="/" className="flex-shrink-0">
                        <motion.div
                            whileTap={{ scale: 0.95 }}
                            className="relative"
                        >
                            <img 
                                src={pamoonLogo} 
                                alt="PAMOON" 
                                className="h-8 w-8 object-contain" 
                            />
                        </motion.div>
                    </Link>
                    
                    {/* Search Bar - Now inline with logo */}
                    <form onSubmit={handleSearch} className="flex-1 relative min-w-0">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="ค้นหาสินค้า..." 
                            className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-400 rounded-lg pl-8 pr-3 py-2 text-xs focus:ring-2 focus:ring-white focus:border-transparent transition-all" 
                        />
                    </form>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-0.5">
                        {/* Favorites */}
                        <Link to="/favorites">
                            <motion.button 
                                whileTap={{ scale: 0.9 }}
                                className="relative p-1.5 text-white hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <Heart className="w-4 h-4" />
                                {favoriteCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] font-bold min-w-[14px] h-[14px] px-0.5 flex items-center justify-center rounded-full">
                                        {favoriteCount > 9 ? '9+' : favoriteCount}
                                    </span>
                                )}
                            </motion.button>
                        </Link>

                        {/* Shopping Bag */}
                        <Link to="/orders">
                            <motion.button 
                                whileTap={{ scale: 0.9 }}
                                className="relative p-1.5 text-white hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                {orderCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 bg-yellow-500 text-black text-[8px] font-bold min-w-[14px] h-[14px] px-0.5 flex items-center justify-center rounded-full">
                                        {orderCount > 9 ? '9+' : orderCount}
                                    </span>
                                )}
                            </motion.button>
                        </Link>

                        {/* My Bids */}
                        <Link to="/my-bids" title="รายการที่กำลังประมูล">
                            <motion.button 
                                whileTap={{ scale: 0.9 }}
                                className="relative p-1.5 text-white hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <Gavel className="w-4 h-4" />
                                {bidsCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 bg-blue-500 text-white text-[8px] font-bold min-w-[14px] h-[14px] px-0.5 flex items-center justify-center rounded-full">
                                        {bidsCount > 9 ? '9+' : bidsCount}
                                    </span>
                                )}
                            </motion.button>
                        </Link>
                        
                        {/* User Menu */}
                        {isAuthenticated() ? (
                            <div className="relative" ref={menuRef}>
                                <motion.button 
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center justify-center w-7 h-7 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors overflow-hidden"
                                >
                                    {user?.avatar_url ? (
                                        <img 
                                            src={user.avatar_url} 
                                            alt={user?.name || 'User'} 
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div className={`w-full h-full flex items-center justify-center font-bold text-xs text-black ${user?.avatar_url ? 'hidden' : 'flex'}`}>
                                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                </motion.button>

                                {/* User Dropdown */}
                                <AnimatePresence>
                                    {showUserMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
                                        >
                                            {/* User Info */}
                                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 px-4 py-4 text-white">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-12 h-12 bg-white text-gray-900 rounded-full flex items-center justify-center font-bold text-lg overflow-hidden">
                                                        {user?.avatar_url ? (
                                                            <img 
                                                                src={user.avatar_url} 
                                                                alt={user?.name || 'User'} 
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextSibling.style.display = 'flex';
                                                                }}
                                                            />
                                                        ) : null}
                                                        <div className={`w-full h-full flex items-center justify-center font-bold text-lg text-gray-900 ${user?.avatar_url ? 'hidden' : 'flex'}`}>
                                                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-sm truncate">{user?.name || 'User'}</p>
                                                        <p className="text-xs text-gray-300">สมาชิก PAMOON</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Menu Items */}
                                            <div className="py-2">
                                                <Link
                                                    to="/profile"
                                                    onClick={() => setShowUserMenu(false)}
                                                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    <User className="w-4 h-4 mr-3 text-gray-600" />
                                                    <span className="text-sm font-medium">โปรไฟล์</span>
                                                </Link>
                                                <Link
                                                    to="/orders"
                                                    onClick={() => setShowUserMenu(false)}
                                                    className="flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="flex items-center">
                                                        <Package className="w-4 h-4 mr-3 text-gray-600" />
                                                        <span className="text-sm font-medium">คำสั่งซื้อ</span>
                                                    </div>
                                                    {orderCount > 0 && (
                                                        <span className="bg-yellow-500 text-black text-[10px] font-bold min-w-[18px] h-[18px] px-1.5 flex items-center justify-center rounded-full">
                                                            {orderCount > 9 ? '9+' : orderCount}
                                                        </span>
                                                    )}
                                                </Link>
                                                <Link
                                                    to="/favorites"
                                                    onClick={() => setShowUserMenu(false)}
                                                    className="flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="flex items-center">
                                                        <Heart className="w-4 h-4 mr-3 text-gray-600" />
                                                        <span className="text-sm font-medium">รายการโปรด</span>
                                                    </div>
                                                    {favoriteCount > 0 && (
                                                        <span className="bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1.5 flex items-center justify-center rounded-full">
                                                            {favoriteCount > 9 ? '9+' : favoriteCount}
                                                        </span>
                                                    )}
                                                </Link>
                                            </div>

                                            {/* Logout */}
                                            <div className="border-t border-gray-200">
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4 mr-3" />
                                                    <span className="text-sm font-medium">ออกจากระบบ</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="px-2 py-1 bg-white text-black text-xs font-semibold rounded-full shadow-md hover:bg-gray-100 transition-colors"
                            >
                                เข้าสู่ระบบ
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="bg-black border-t border-gray-800">
                <div className="flex overflow-x-auto scrollbar-hide px-3 space-x-3 py-2.5">
                    <Link 
                        to="/"
                        className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                            !selectedCategory 
                                ? 'bg-white text-black' 
                                : 'text-gray-300 hover:bg-gray-800'
                        }`}
                    >
                        ทั้งหมด
                    </Link>
                    {categories.map((category) => (
                        <Link 
                            key={category.id}
                            to={`/?category=${encodeURIComponent(category.name)}`}
                            className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                                selectedCategory === category.name
                                    ? 'bg-white text-black'
                                    : 'text-gray-300 hover:bg-gray-800'
                            }`}
                        >
                            {category.name}
                        </Link>
                    ))}
                </div>
            </div>
        </header>
    );
};

export default MobileHeader;

