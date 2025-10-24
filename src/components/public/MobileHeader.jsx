import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User, LogOut, Package, Heart, Menu, X, Gavel } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import pamoonLogo from '@/assets/pamoontoy.png';
import { useAuth } from '@/contexts/AuthContext';

const MobileHeader = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [notificationCount, setNotificationCount] = useState(9);
    const menuRef = useRef(null);
    const navigate = useNavigate();

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
                        {/* Shopping Bag */}
                        <Link to="/orders">
                            <motion.button 
                                whileTap={{ scale: 0.9 }}
                                className="relative p-1.5 text-white hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <ShoppingBag className="w-4 h-4" />
                            </motion.button>
                        </Link>

                        {/* My Bids */}
                        <Link to="/my-bids" title="รายการที่กำลังประมูล">
                            <motion.button 
                                whileTap={{ scale: 0.9 }}
                                className="relative p-1.5 text-white hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <Gavel className="w-4 h-4" />
                            </motion.button>
                        </Link>
                        
                        {/* User Menu */}
                        {isAuthenticated() ? (
                            <div className="relative" ref={menuRef}>
                                <motion.button 
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center justify-center w-7 h-7 bg-white text-black rounded-full font-bold text-xs shadow-md hover:bg-gray-100 transition-colors"
                                >
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
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
                                                    <div className="w-12 h-12 bg-white text-gray-900 rounded-full flex items-center justify-center font-bold text-lg">
                                                        {user?.name?.charAt(0).toUpperCase() || 'U'}
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
                                                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    <Package className="w-4 h-4 mr-3 text-gray-600" />
                                                    <span className="text-sm font-medium">คำสั่งซื้อ</span>
                                                </Link>
                                                <Link
                                                    to="/favorites"
                                                    onClick={() => setShowUserMenu(false)}
                                                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    <Heart className="w-4 h-4 mr-3 text-gray-600" />
                                                    <span className="text-sm font-medium">รายการโปรด</span>
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
                        className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-white text-black rounded-full transition-colors"
                    >
                        ทั้งหมด
                    </Link>
                    <Link 
                        to="/"
                        className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-800 rounded-full transition-colors"
                    >
                        ของเล่น
                    </Link>
                    <Link 
                        to="/"
                        className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-800 rounded-full transition-colors"
                    >
                        ฟิกเกอร์
                    </Link>
                    <Link 
                        to="/"
                        className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-800 rounded-full transition-colors"
                    >
                        โมเดล
                    </Link>
                    <Link 
                        to="/"
                        className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-800 rounded-full transition-colors"
                    >
                        การ์ด
                    </Link>
                    <Link 
                        to="/"
                        className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-800 rounded-full transition-colors"
                    >
                        อื่นๆ
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default MobileHeader;

