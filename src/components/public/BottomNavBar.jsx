import React, { useState, useEffect } from 'react';
import { Home, Search, Camera, Heart, User, ShoppingBag, Gavel } from 'lucide-react';
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
                    className="absolute inset-0 bg-white rounded-2xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            )}
            
            <div className={`relative p-2.5 rounded-2xl transition-all duration-200 ${
                active ? 'scale-110' : 'group-hover:bg-gray-800'
            }`}>
                <Icon className={`w-6 h-6 transition-colors ${
                    active ? 'text-black' : 'text-gray-400 group-hover:text-white'
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
            active ? 'text-white scale-105' : 'text-gray-400 group-hover:text-white'
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
    const isProductDetail = location.pathname.startsWith('/product/');

    const handleAuctionClick = () => {
        if (isProductDetail) {
            // Check if handleBid function is available globally
            if (window.handleBid && typeof window.handleBid === 'function') {
                window.handleBid(); // Call the handleBid function directly
            } else {
                // Fallback: trigger bid button click
                const bidButton = document.querySelector('[data-bid-button]');
                if (bidButton) {
                    bidButton.click();
                } else {
                    // Last fallback: scroll to bid section
                    const bidSection = document.querySelector('[data-bid-section]');
                    if (bidSection) {
                        bidSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            }
        } else {
            // Navigate to home for general auction
            window.location.href = '/';
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-gray-800 shadow-2xl md:hidden z-50">
            {/* Gradient Top Border */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
            
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
                
                {/* Center Auction Button */}
                <button 
                    onClick={handleAuctionClick}
                    className="flex flex-col items-center justify-center flex-1"
                >
                    <motion.div
                        whileTap={{ scale: 0.9 }}
                        className="relative -mt-6"
                    >
                        <div className={`w-14 h-14 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.5)] flex items-center justify-center relative overflow-hidden group transition-all ${
                            isProductDetail 
                                ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                                : 'bg-gradient-to-br from-white to-gray-200'
                        }`}>
                            {/* Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-active:opacity-100 transition-opacity"></div>
                            {isProductDetail ? (
                                <Gavel className="w-7 h-7 text-white relative z-10" />
                            ) : (
                                <Camera className="w-7 h-7 text-black relative z-10" />
                            )}
                        </div>
                    </motion.div>
                    <span className="text-[10px] mt-1 font-medium text-white drop-shadow-sm">
                        {isProductDetail ? 'เสนอประมูล' : 'ประมูล'}
                    </span>
                </button>
                
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
            <div className="h-safe-area-inset-bottom bg-black"></div>
        </div>
    );
};

export default BottomNavBar;
