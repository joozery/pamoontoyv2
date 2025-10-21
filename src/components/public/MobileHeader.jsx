import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, ShoppingBag, User, LogOut, Package, Heart, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import pamoonLogo from '@/assets/pamoontoy.png';

const MobileHeader = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [notificationCount, setNotificationCount] = useState(9);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUserName = localStorage.getItem('userName');
        setIsLoggedIn(!!storedUserName);
        setUserName(storedUserName || '');
    }, []);

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
        localStorage.removeItem('userName');
        setIsLoggedIn(false);
        setUserName('');
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
        <header className="sticky top-0 bg-white border-b border-gray-200 shadow-sm z-50 md:hidden">
            {/* Main Header Bar */}
            <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-3">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <motion.div
                            whileTap={{ scale: 0.95 }}
                            className="relative"
                        >
                            <img 
                                src={pamoonLogo} 
                                alt="PAMOON" 
                                className="h-10 w-10 object-contain" 
                            />
                        </motion.div>
                    </Link>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                        {/* Notification */}
                        <motion.button 
                            whileTap={{ scale: 0.9 }}
                            className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <Bell className="w-5 h-5" />
                            {notificationCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1"
                                >
                                    {notificationCount > 9 ? '9+' : notificationCount}
                                </motion.span>
                            )}
                        </motion.button>

                        {/* Shopping Bag */}
                        <motion.button 
                            whileTap={{ scale: 0.9 }}
                            className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ShoppingBag className="w-5 h-5" />
                        </motion.button>
                        
                        {/* User Menu */}
                        {isLoggedIn ? (
                            <div className="relative" ref={menuRef}>
                                <motion.button 
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center justify-center w-9 h-9 bg-gray-900 text-white rounded-full font-bold text-sm shadow-md hover:bg-black transition-colors"
                                >
                                    {userName.charAt(0).toUpperCase()}
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
                                                        {userName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-sm truncate">{userName}</p>
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
                                className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-full shadow-md hover:bg-black transition-colors"
                            >
                                เข้าสู่ระบบ
                            </Link>
                        )}
                    </div>
                </div>
                
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ค้นหาสินค้า, หมวดหมู่, หรือแบรนด์..." 
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all" 
                    />
                </form>
            </div>

            {/* Category Tabs */}
            <div className="bg-white border-t border-gray-100">
                <div className="flex overflow-x-auto scrollbar-hide px-4 space-x-4 py-3">
                    <Link 
                        to="/"
                        className="flex-shrink-0 px-4 py-1.5 text-sm font-medium text-gray-900 bg-gray-900 text-white rounded-full transition-colors"
                    >
                        ทั้งหมด
                    </Link>
                    <Link 
                        to="/"
                        className="flex-shrink-0 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        ของเล่น
                    </Link>
                    <Link 
                        to="/"
                        className="flex-shrink-0 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        ฟิกเกอร์
                    </Link>
                    <Link 
                        to="/"
                        className="flex-shrink-0 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        โมเดล
                    </Link>
                    <Link 
                        to="/"
                        className="flex-shrink-0 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        การ์ด
                    </Link>
                    <Link 
                        to="/"
                        className="flex-shrink-0 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        อื่นๆ
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default MobileHeader;

