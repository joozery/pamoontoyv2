import React, { useState, useEffect } from 'react';
import { Home, Search, Camera, Heart, User, ShoppingBag } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const NavItem = ({ icon: Icon, label, active = false, notificationCount, to }) => (
    <Link to={to} className="flex flex-col items-center justify-center flex-1 relative group">
        <motion.div
            whileTap={{ scale: 0.9 }}
            className="relative"
        >
            {/* Active Background Indicator */}
            {active && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gray-900 rounded-2xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            )}
            
            <div className={`relative p-2.5 rounded-2xl transition-all duration-200 ${
                active ? 'scale-110' : 'group-hover:bg-gray-100'
            }`}>
                <Icon className={`w-6 h-6 transition-colors ${
                    active ? 'text-white' : 'text-gray-600 group-hover:text-gray-900'
                }`} />
                
                {/* Notification Badge */}
                {notificationCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 shadow-lg"
                    >
                        {notificationCount > 9 ? '9+' : notificationCount}
                    </motion.span>
                )}
            </div>
        </motion.div>
        
        <span className={`text-[10px] mt-1 font-medium transition-all ${
            active ? 'text-gray-900 scale-105' : 'text-gray-500 group-hover:text-gray-900'
        }`}>
            {label}
        </span>
    </Link>
);

const BottomNavBar = () => {
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [favoriteCount, setFavoriteCount] = useState(5);
    const [orderCount, setOrderCount] = useState(0);

    useEffect(() => {
        // Check if user is logged in
        const userName = localStorage.getItem('userName');
        setIsLoggedIn(!!userName);
    }, []);

    const isActive = (path) => location.pathname === path;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-2xl md:hidden z-50">
            {/* Gradient Top Border */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            
            <div className="flex justify-around items-center h-[72px] max-w-md mx-auto px-2">
                <NavItem 
                    icon={Home} 
                    label="หน้าแรก" 
                    active={isActive('/')} 
                    to="/"
                />
                
                <NavItem 
                    icon={Search} 
                    label="ค้นหา" 
                    active={isActive('/search')} 
                    to="/search"
                />
                
                {/* Center Camera Button */}
                <Link to="/" className="flex flex-col items-center justify-center flex-1">
                    <motion.div
                        whileTap={{ scale: 0.9 }}
                        className="relative -mt-6"
                    >
                        <div className="w-14 h-14 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl shadow-2xl flex items-center justify-center relative overflow-hidden group">
                            {/* Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-active:opacity-100 transition-opacity"></div>
                            <Camera className="w-7 h-7 text-white relative z-10" />
                        </div>
                    </motion.div>
                    <span className="text-[10px] mt-1 font-medium text-gray-900">ลงขาย</span>
                </Link>
                
                <NavItem 
                    icon={Heart} 
                    label="รายการโปรด" 
                    active={isActive('/favorites')} 
                    notificationCount={favoriteCount}
                    to="/favorites"
                />
                
                <NavItem 
                    icon={isLoggedIn ? ShoppingBag : User} 
                    label={isLoggedIn ? "คำสั่งซื้อ" : "โปรไฟล์"} 
                    active={isActive('/profile') || isActive('/orders')} 
                    notificationCount={orderCount}
                    to={isLoggedIn ? "/orders" : "/profile"}
                />
            </div>

            {/* Safe Area for iPhone */}
            <div className="h-safe-area-inset-bottom bg-white"></div>
        </div>
    );
};

export default BottomNavBar;
