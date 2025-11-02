import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ShoppingBag, User, LogOut, Package, Heart, Gavel } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import pamoonLogo from '@/assets/pamoontoy.png';
import { useAuth } from '@/contexts/AuthContext';
import apiService from '@/services/api';

const DesktopHeader = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [bidsCount, setBidsCount] = useState(0);
  const [categories, setCategories] = useState([]);
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
              <Link to="/how-to-bid" className="relative px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors group">
                <span className="relative z-10">วิธีการประมูล</span>
                <span className="absolute inset-0 bg-white/10 rounded-lg scale-0 group-hover:scale-100 transition-transform"></span>
              </Link>
              <Link to="/contact" className="relative px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors group">
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
            
            {/* Favorites */}
            <Link to="/favorites" className="relative p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all group" title="รายการโปรด">
              <Heart className="h-5 w-5" />
              {favoriteCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full">
                  {favoriteCount > 9 ? '9+' : favoriteCount}
                </span>
              )}
            </Link>
            
            {/* Orders */}
            <Link to="/orders" className="relative p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all group" title="คำสั่งซื้อ">
              <ShoppingBag className="h-5 w-5" />
              {orderCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-[10px] font-bold min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full">
                  {orderCount > 9 ? '9+' : orderCount}
                </span>
              )}
            </Link>
            
            {/* My Bids */}
            <Link to="/my-bids" className="relative p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all group" title="รายการที่กำลังประมูล">
              <Gavel className="h-5 w-5" />
              {bidsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] font-bold min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full">
                  {bidsCount > 9 ? '9+' : bidsCount}
                </span>
              )}
            </Link>
            
            {/* User Menu */}
            {isAuthenticated() ? (
              <div className="relative user-menu-container">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-sm font-medium text-black bg-white rounded-full pl-2 pr-4 py-2 hover:bg-gray-200 hover:shadow-lg hover:scale-105 transition-all"
                >
                  <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold overflow-hidden">
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
                    <div className={`w-full h-full flex items-center justify-center font-bold text-white ${user?.avatar_url ? 'hidden' : 'flex'}`}>
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
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
                        className="flex items-center justify-between px-4 py-3 text-sm text-gray-300 hover:bg-white/10 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <div className="flex items-center space-x-3">
                          <Package className="h-4 w-4 text-white" />
                          <span>คำสั่งซื้อ</span>
                        </div>
                        {orderCount > 0 && (
                          <span className="bg-yellow-500 text-black text-[10px] font-bold min-w-[18px] h-[18px] px-1.5 flex items-center justify-center rounded-full">
                            {orderCount > 9 ? '9+' : orderCount}
                          </span>
                        )}
                      </Link>
                      <Link 
                        to="/favorites"
                        className="flex items-center justify-between px-4 py-3 text-sm text-gray-300 hover:bg-white/10 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <div className="flex items-center space-x-3">
                          <Heart className="h-4 w-4 text-white" />
                          <span>รายการโปรด</span>
                        </div>
                        {favoriteCount > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1.5 flex items-center justify-center rounded-full">
                            {favoriteCount > 9 ? '9+' : favoriteCount}
                          </span>
                        )}
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
              className={`flex-shrink-0 px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
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
                className={`flex-shrink-0 px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
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
      </div>
    </header>
  );
};

export default DesktopHeader;



