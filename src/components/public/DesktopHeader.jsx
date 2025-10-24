import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User, LogOut, Package, Heart, Gavel } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import pamoonLogo from '@/assets/pamoontoy.png';
import { useAuth } from '@/contexts/AuthContext';

const DesktopHeader = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    toast({
      title: "ออกจากระบบสำเร็จ",
      description: "แล้วพบกันใหม่! 👋",
    });
    navigate('/');
  };

  return (
    <header className="hidden md:block sticky top-0 z-20 w-full bg-gradient-to-r from-black via-gray-900 to-black backdrop-blur-xl border-b border-gray-800/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Nav */}
          <div className="flex items-center space-x-12">
            <Link to="/" className="flex items-center group">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <img src={pamoonLogo} alt="PAMOON" className="relative h-14 w-14 object-contain transform group-hover:scale-110 transition-transform" />
              </div>
            </Link>
            <nav className="hidden lg:flex items-center space-x-1">
              <Link to="/" className="relative px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors group">
                <span className="relative z-10">สินค้าทั้งหมด</span>
                <span className="absolute inset-0 bg-white/10 rounded-lg scale-0 group-hover:scale-100 transition-transform"></span>
              </Link>
              <Link to="/" className="relative px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors group">
                <span className="relative z-10">วิธีการประมูล</span>
                <span className="absolute inset-0 bg-white/10 rounded-lg scale-0 group-hover:scale-100 transition-transform"></span>
              </Link>
              <Link to="/" className="relative px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors group">
                <span className="relative z-10">ติดต่อเรา</span>
                <span className="absolute inset-0 bg-white/10 rounded-lg scale-0 group-hover:scale-100 transition-transform"></span>
              </Link>
            </nav>
          </div>
          
          {/* Search & Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="ค้นหาสินค้า..." 
                className="w-64 bg-white/10 border border-white/10 text-white placeholder-gray-400 rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:bg-white/20 transition-all"
              />
            </div>
            
            {/* Action Buttons */}
            <button className="relative p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all">
              <Search className="h-5 w-5 lg:hidden" />
            </button>
            <Link to="/orders" className="relative p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all group">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full scale-0 group-hover:scale-100 transition-transform">3</span>
            </Link>
            <Link to="/my-bids" className="relative p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all group" title="รายการที่กำลังประมูล">
              <Gavel className="h-5 w-5" />
            </Link>
            
            {/* User Menu */}
            {isAuthenticated() ? (
              <div className="relative user-menu-container">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-sm font-medium text-black bg-white rounded-full pl-2 pr-4 py-2 hover:bg-gray-200 hover:shadow-lg hover:scale-105 transition-all"
                >
                  <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span>{user?.name || 'User'}</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-56 bg-gray-900 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700 overflow-hidden z-50">
                    <div className="bg-white px-4 py-4 text-black">
                      <p className="text-sm font-bold">{user?.name || 'User'}</p>
                      <p className="text-xs opacity-70">สมาชิก PAMOON</p>
                    </div>
                    <div className="py-2">
                      <Link 
                        to="/profile"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/10 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="h-4 w-4 text-white" />
                        <span>โปรไฟล์</span>
                      </Link>
                      <Link 
                        to="/orders"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/10 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Package className="h-4 w-4 text-white" />
                        <span>คำสั่งซื้อ</span>
                      </Link>
                      <Link 
                        to="/favorites"
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/10 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Heart className="h-4 w-4 text-white" />
                        <span>รายการโปรด</span>
                      </Link>
                      <hr className="my-2 border-gray-700" />
                      <button 
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-red-400 hover:bg-red-950/30 transition-colors w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>ออกจากระบบ</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="relative group">
                <div className="px-6 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition-all shadow-md">
                  <span className="text-sm font-semibold">
                    เข้าสู่ระบบ
                  </span>
                </div>
              </Link>
            )}
          </div>
        </div>
        
        {/* Category Tabs - Desktop */}
        <div className="border-t border-gray-800">
          <div className="flex items-center space-x-2 overflow-x-auto py-3 scrollbar-hide">
            <Link 
              to="/"
              className="flex-shrink-0 px-4 py-1.5 text-sm font-medium bg-white text-black rounded-full transition-colors"
            >
              ทั้งหมด
            </Link>
            <Link 
              to="/"
              className="flex-shrink-0 px-4 py-1.5 text-sm font-medium text-gray-300 hover:bg-gray-800 rounded-full transition-colors"
            >
              ของเล่น
            </Link>
            <Link 
              to="/"
              className="flex-shrink-0 px-4 py-1.5 text-sm font-medium text-gray-300 hover:bg-gray-800 rounded-full transition-colors"
            >
              ฟิกเกอร์
            </Link>
            <Link 
              to="/"
              className="flex-shrink-0 px-4 py-1.5 text-sm font-medium text-gray-300 hover:bg-gray-800 rounded-full transition-colors"
            >
              โมเดล
            </Link>
            <Link 
              to="/"
              className="flex-shrink-0 px-4 py-1.5 text-sm font-medium text-gray-300 hover:bg-gray-800 rounded-full transition-colors"
            >
              การ์ด
            </Link>
            <Link 
              to="/"
              className="flex-shrink-0 px-4 py-1.5 text-sm font-medium text-gray-300 hover:bg-gray-800 rounded-full transition-colors"
            >
              อื่นๆ
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DesktopHeader;



