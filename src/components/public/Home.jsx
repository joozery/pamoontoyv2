
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { Heart, Clock, Gavel } from 'lucide-react';
import { Link } from 'react-router-dom';
import SplitText from '../SplitText';
import LiquidEther from '@/components/LiquidEther';
import { useProducts } from '@/hooks/useProducts';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const CountdownTimer = ({ endTime, auctionStart, auctionEnd }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [auctionStatus, setAuctionStatus] = useState('waiting'); // waiting, active, ended
  const [isClosingSoon, setIsClosingSoon] = useState(false); // ปิดในวันนี้หรือใกล้ปิด (< 24 ชม.)

  useEffect(() => {
    const calculateTimeLeft = () => {
      try {
        // ✅ ตรวจสอบว่ามีค่า auctionStart และ auctionEnd หรือไม่
        if (!auctionStart || !auctionEnd) {
          setAuctionStatus('ended');
          return 'ไม่มีข้อมูลเวลา';
        }
        
        // ตรวจสอบว่าเป็น string หรือไม่
        if (typeof auctionStart !== 'string' || typeof auctionEnd !== 'string') {
          setAuctionStatus('ended');
          return 'รูปแบบเวลาไม่ถูกต้อง';
        }
        
        // ✅ ใช้ dayjs แบบง่ายๆ โดยไม่ต้อง setDefault
        // ดึงเวลาปัจจุบัน (browser time)
        const now = dayjs();
        
        // Parse เวลาจาก API (ซึ่งเป็น UTC ISO string อยู่แล้ว)
        const startTime = dayjs(auctionStart);
        const endTime = dayjs(auctionEnd);
        
        // ตรวจสอบว่าเป็นเวลาที่ถูกต้องหรือไม่
        if (!startTime.isValid() || !endTime.isValid()) {
          console.error('Invalid date:', { auctionStart, auctionEnd });
          setAuctionStatus('ended');
          return 'ข้อมูลเวลาไม่ถูกต้อง';
        }
      
      // ตรวจสอบสถานะประมูล
      if (now.isBefore(startTime)) {
        // ยังไม่เปิดประมูล
        setAuctionStatus('waiting');
        const diffSeconds = startTime.diff(now, 'second');
        
        if (diffSeconds <= 0) {
          return 'เปิดแล้ว';
        }
        
        const hours = Math.floor(diffSeconds / 3600);
        const minutes = Math.floor((diffSeconds % 3600) / 60);
        const seconds = diffSeconds % 60;
        
        if (hours >= 24) {
          const days = Math.floor(hours / 24);
          const remainingHours = hours % 24;
          return `เปิด ${days}วัน ${remainingHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else if (hours > 0) {
          return `เปิด ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
          return `เปิด ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
      } else if (now.isAfter(startTime) && now.isBefore(endTime)) {
        // กำลังประมูล
        setAuctionStatus('active');
        const diffSeconds = endTime.diff(now, 'second');
        
        if (diffSeconds <= 0) {
          return 'สิ้นสุดแล้ว';
        }
        
        const hours = Math.floor(diffSeconds / 3600);
        const minutes = Math.floor((diffSeconds % 3600) / 60);
        const seconds = diffSeconds % 60;
        
        // ✅ ตรวจสอบว่าปิดในวันนี้หรือใกล้ปิด (< 24 ชั่วโมง)
        if (hours < 24) {
          setIsClosingSoon(true);  // สีแดง
        } else {
          setIsClosingSoon(false); // สีฟ้า
        }
        
        if (hours >= 24) {
          const days = Math.floor(hours / 24);
          const remainingHours = hours % 24;
          return `${days}วัน ${remainingHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else if (hours > 0) {
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
          return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
      } else {
        // สิ้นสุดแล้ว
        setAuctionStatus('ended');
        return 'สิ้นสุดแล้ว';
      }
      } catch (error) {
        // จัดการ error ที่เกิดขึ้นทั้งหมด
        console.error('CountdownTimer Error:', error, {
          auctionStart,
          auctionEnd
        });
        setAuctionStatus('ended');
        return 'เกิดข้อผิดพลาด';
      }
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, auctionStart, auctionEnd]);

  const getStatusColor = () => {
    switch (auctionStatus) {
      case 'waiting':
        return 'text-blue-600 bg-blue-50';
      case 'active':
        // ✅ ถ้าปิดในวันนี้หรือใกล้ปิด (< 24 ชม.) → สีแดง, ถ้าไม่ → สีฟ้า
        return isClosingSoon ? 'text-red-600 bg-red-50' : 'text-blue-600 bg-blue-50';
      case 'ended':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-red-600 bg-red-50';
    }
  };

  const getStatusIcon = () => {
    switch (auctionStatus) {
      case 'waiting':
        return <Clock className="w-2 h-2" />;
      case 'active':
        return <Gavel className="w-2 h-2" />;
      case 'ended':
        return <Clock className="w-2 h-2" />;
      default:
        return <Clock className="w-2 h-2" />;
    }
  };

  return (
    <div className={`flex items-center space-x-0.5 px-1 py-0.5 rounded-sm ${getStatusColor()}`}>
      {getStatusIcon()}
      <span className="text-[8px] font-semibold">{timeLeft}</span>
    </div>
  );
};

const ProductCard = ({ product, isHorizontalScroll = false, favoriteIds = [], userBidIds = [] }) => {
  const { isAuthenticated, user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasUserBid, setHasUserBid] = useState(false);

  useEffect(() => {
    // Check if product is in favorites list (from parent component)
    setIsFavorite(favoriteIds.includes(product.id));
    
    // Check if user has bid on this product
    setHasUserBid(userBidIds.includes(product.id));
  }, [favoriteIds, product.id, userBidIds]);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated()) {
      toast({
        title: "กรุณาเข้าสู่ระบบ",
        description: "คุณต้องเข้าสู่ระบบก่อนใช้งานรายการโปรด",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isFavorite) {
        // Remove from favorites
        await apiService.favorites.remove(product.id);
        setIsFavorite(false);
        toast({
          title: "ลบออกจากรายการโปรด",
          description: "ลบสินค้าออกจากรายการโปรดแล้ว"
        });
      } else {
        // Add to favorites
        await apiService.favorites.add(product.id);
        setIsFavorite(true);
        toast({
          title: "เพิ่มในรายการโปรด",
          description: "เพิ่มสินค้าในรายการโปรดแล้ว"
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.response?.data?.message || error.message || "ไม่สามารถอัปเดตรายการโปรดได้",
        variant: "destructive"
      });
    }
  };

  // Check if product is sold or ended
  const isSold = product.status === 'sold';
  const isEnded = product.status === 'active' && product.auction_end && new Date(product.auction_end) <= new Date();
  const isInactive = isSold || isEnded;

  return (
    <Link 
      to={`/product/${product.id}`}
      className={`flex-shrink-0 bg-white overflow-hidden rounded-lg shadow hover:shadow-md transition-all duration-300 ${isHorizontalScroll ? 'w-24' : 'w-full'} block group ${isInactive ? 'opacity-60 grayscale' : ''}`}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          src={(() => {
            if (product.image_url) return product.image_url;
            if (product.primary_image) return product.primary_image;
            if (product.images) {
              try {
                const parsed = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
                if (Array.isArray(parsed) && parsed[0]) return parsed[0];
              } catch (e) {
                console.error('Error parsing images:', e);
              }
            }
            return 'https://placehold.co/300x300/e5e7eb/9ca3af?text=No+Image';
          })()}
          onError={(e) => {
            e.target.src = 'https://placehold.co/300x300/e5e7eb/9ca3af?text=No+Image';
          }}
        />
        {/* User's Bid Badge - Only show if user has bid on this product */}
        {isAuthenticated() && hasUserBid && product.status === 'active' && product.auction_end && new Date(product.auction_end) > new Date() && (
          <div className="absolute top-1 left-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-1.5 py-0.5 rounded-full text-[7px] font-bold flex items-center space-x-0.5 z-10">
            <Gavel className="w-2 h-2" />
            <span>คุณประมูล</span>
          </div>
        )}
        
        {/* Ended Auction Badge */}
        {isEnded && (
          <div className="absolute top-1 left-1 bg-gray-600 text-white px-1.5 py-0.5 rounded-full text-[7px] font-bold flex items-center space-x-0.5 z-10">
            <Clock className="w-2 h-2" />
            <span>สิ้นสุดแล้ว</span>
          </div>
        )}
        
        {/* Sold Badge */}
        {isSold && (
          <div className="absolute top-1 left-1 bg-green-600 text-white px-1.5 py-0.5 rounded-full text-[7px] font-bold flex items-center space-x-0.5 z-10">
            <span>ขายแล้ว</span>
          </div>
        )}
        
        <button 
          onClick={handleFavoriteClick}
          className="absolute top-1 right-1 bg-white/80 text-gray-600 p-1 rounded-full backdrop-blur-sm hover:bg-white hover:text-red-500 transition-all duration-300 z-10 hover:scale-110"
        >
          <Heart className={`w-3 h-3 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
      </div>
      <div className="p-2 bg-white">
        <p className="text-gray-700 text-[9px] truncate font-medium leading-tight">{product.name}</p>
        
        {/* Price and Auction Status */}
        <div className="mt-0.5">
          {product.status === 'active' && product.auction_start && product.auction_end ? (
            (() => {
              const now = new Date();
              const startTime = new Date(product.auction_start);
              const endTime = new Date(product.auction_end);
              
              if (now < startTime) {
                // ยังไม่เปิดประมูล
                return (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[10px] text-gray-900">
                        ฿{parseFloat(product.current_price || product.starting_price || 0).toLocaleString()}
                      </p>
                      <p className="text-[8px] text-gray-500">ราคาเริ่มต้น</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] text-blue-600 font-semibold">รอเปิดประมูล</p>
                      <p className="text-[7px] text-gray-500">เริ่ม {startTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                );
              } else if (now >= startTime && now < endTime) {
                // กำลังประมูล
                return (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[10px] text-gray-900">
                        ฿{parseFloat(product.current_price || product.starting_price || 0).toLocaleString()}
                      </p>
                      <p className="text-[8px] text-gray-500">ราคาปัจจุบัน</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] text-orange-600 font-semibold">ประมูล</p>
                      <p className="text-[7px] text-gray-500">+{product.bid_count || 0} ครั้ง</p>
                    </div>
                  </div>
                );
              } else {
                // สิ้นสุดแล้ว
                return (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[10px] text-gray-600">
                        ฿{parseFloat(product.current_price || product.starting_price || 0).toLocaleString()}
                      </p>
                      <p className="text-[8px] text-gray-500">ราคาสุดท้าย</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] text-gray-600 font-semibold">สิ้นสุดแล้ว</p>
                      <p className="text-[7px] text-gray-500">{product.bid_count || 0} ครั้ง</p>
                    </div>
                  </div>
                );
              }
            })()
          ) : product.status === 'active' && product.auction_end && new Date(product.auction_end) > new Date() ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-[10px] text-gray-900">
                  ฿{parseFloat(product.current_price || product.starting_price || 0).toLocaleString()}
                </p>
                <p className="text-[8px] text-gray-500">ราคาปัจจุบัน</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] text-orange-600 font-semibold">ประมูล</p>
                <p className="text-[7px] text-gray-500">+{product.bid_count || 0} ครั้ง</p>
              </div>
            </div>
          ) : isSold ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-[10px] text-green-600">
                  ฿{parseFloat(product.current_price || product.starting_price || 0).toLocaleString()}
                </p>
                <p className="text-[8px] text-green-500">ราคาขาย</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] text-green-600 font-semibold">ขายแล้ว</p>
                <p className="text-[7px] text-gray-500">{product.bid_count || 0} ครั้ง</p>
              </div>
            </div>
          ) : isEnded ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-[10px] text-gray-600">
                  ฿{parseFloat(product.current_price || product.starting_price || 0).toLocaleString()}
                </p>
                <p className="text-[8px] text-gray-500">ราคาสุดท้าย</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] text-gray-600 font-semibold">สิ้นสุด</p>
                <p className="text-[7px] text-gray-500">{product.bid_count || 0} ครั้ง</p>
              </div>
            </div>
          ) : (
            <p className="font-bold text-[10px] text-gray-900">
              ฿{parseFloat(product.current_price || product.starting_price || product.price || 0).toLocaleString()}
            </p>
          )}
        </div>
        
        {product.auction_end && !isInactive && (
          <div className="mt-0.5">
            <CountdownTimer 
              endTime={product.auction_end} 
              auctionStart={product.auction_start}
              auctionEnd={product.auction_end}
            />
          </div>
        )}
        
        {/* Show final status for sold/ended items */}
        {isInactive && (
          <div className="mt-0.5">
            {isSold ? (
              <div className="flex items-center space-x-0.5 text-green-600 bg-green-50 px-1 py-0.5 rounded-sm">
                <span className="text-[8px] font-semibold">ขายแล้ว</span>
              </div>
            ) : isEnded ? (
              <div className="flex items-center space-x-0.5 text-gray-600 bg-gray-50 px-1 py-0.5 rounded-sm">
                <Clock className="w-2 h-2" />
                <span className="text-[8px] font-semibold">สิ้นสุดแล้ว</span>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </Link>
  );
};

const Home = () => {
    const [viewHistory, setViewHistory] = useState([]);
    const [viewHistoryLoading, setViewHistoryLoading] = useState(false);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [favoriteIds, setFavoriteIds] = useState([]);
    const [userBidIds, setUserBidIds] = useState([]);
    const [hiddenProductIds, setHiddenProductIds] = useState(new Set()); // สินค้าที่ต้องซ่อน
    const { products, loading, error, fetchProducts } = useProducts();
    const { isAuthenticated } = useAuth();

    // Initialize displayed products
    useEffect(() => {
        if (products.length > 0) {
            setDisplayedProducts(products);
        }
    }, [products]);

    // Load more products
    const loadMoreProducts = async () => {
        if (loadingMore || !hasMore) return;
        
        try {
            setLoadingMore(true);
            const nextPage = currentPage + 1;
            const response = await apiService.products.getAll({ page: nextPage, limit: 20 });
            const newProducts = response.data.data;
            
            if (newProducts.length === 0) {
                setHasMore(false);
            } else {
                setDisplayedProducts(prev => [...prev, ...newProducts]);
                setCurrentPage(nextPage);
                setHasMore(response.data.pagination?.hasNextPage || false);
            }
        } catch (error) {
            console.error('Error loading more products:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    // Infinite scroll handler
    const handleScroll = useCallback(() => {
        if (loadingMore || !hasMore) return;
        
        const scrollTop = document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        
        // Load more when user is 200px from bottom
        if (scrollTop + clientHeight >= scrollHeight - 200) {
            loadMoreProducts();
        }
    }, [loadingMore, hasMore, loadMoreProducts]);

    // Add scroll listener
    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // ✅ Auto-hide sold/ended products after 2-3 minutes
    useEffect(() => {
        const checkAndHideInactiveProducts = () => {
            const now = new Date();
            const newHiddenIds = new Set(hiddenProductIds);
            
            displayedProducts.forEach(product => {
                const isSold = product.status === 'sold';
                const isEnded = product.status === 'active' && product.auction_end && new Date(product.auction_end) <= now;
                
                if (isSold || isEnded) {
                    // ตรวจสอบว่าสินค้านี้ขายไปหรือสิ้นสุดเมื่อไหร่
                    const endTime = new Date(product.auction_end || product.updated_at);
                    const timeSinceEnd = now - endTime;
                    
                    // ถ้าผ่านไป 2-3 นาที (120-180 วินาที) ให้ซ่อน
                    const hideAfterMs = 150000; // 2.5 นาที (150 วินาที)
                    
                    if (timeSinceEnd >= hideAfterMs) {
                        newHiddenIds.add(product.id);
                    }
                }
            });
            
            if (newHiddenIds.size !== hiddenProductIds.size) {
                setHiddenProductIds(newHiddenIds);
            }
        };
        
        // เช็คทุก 30 วินาที
        const interval = setInterval(checkAndHideInactiveProducts, 30000);
        checkAndHideInactiveProducts(); // เช็คทันทีตอนโหลดหน้า
        
        return () => clearInterval(interval);
    }, [displayedProducts, hiddenProductIds]);

    // Load favorites and user bids once
    useEffect(() => {
        const fetchFavorites = async () => {
            if (isAuthenticated()) {
                try {
                    const response = await apiService.favorites.getAll();
                    const favorites = response.data.data || [];
                    setFavoriteIds(favorites.map(fav => fav.product_id));
                } catch (error) {
                    console.error('Error fetching favorites:', error);
                }
            }
        };
        
        const fetchUserBids = async () => {
            if (isAuthenticated()) {
                try {
                    const response = await apiService.bids.getUserBids();
                    const bids = response.data.data || [];
                    setUserBidIds(bids.map(bid => bid.product_id));
                } catch (error) {
                    console.error('Error fetching user bids:', error);
                }
            }
        };
        
        fetchFavorites();
        fetchUserBids();
    }, [isAuthenticated]);

    useEffect(() => {
        const fetchViewHistory = async () => {
            if (isAuthenticated()) {
                try {
                    setViewHistoryLoading(true);
                    const response = await apiService.products.getViewHistory();
                    setViewHistory(response.data.data || []);
                } catch (error) {
                    console.error('Error fetching view history:', error);
                    // Fallback to recent products if API fails
                    setViewHistory(displayedProducts.slice(0, 5));
                } finally {
                    setViewHistoryLoading(false);
                }
            } else {
                // For non-authenticated users, show recent products
                setViewHistory(displayedProducts.slice(0, 5));
            }
        };

        if (displayedProducts.length > 0) {
            fetchViewHistory();
        }
    }, [displayedProducts, isAuthenticated]);

    const handleActionClick = (feature) => {
      toast({
        title: `🚧 ${feature} ยังไม่เปิดใช้งาน`,
        description: "ฟีเจอร์นี้ยังไม่พร้อมใช้งาน แต่คุณสามารถขอให้สร้างได้ในพรอมต์ถัดไป! 🚀",
      });
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">กำลังโหลดสินค้า...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">เกิดข้อผิดพลาด: {error}</p>
        </div>
      );
    }

    return (
        <div className="bg-gray-100 min-h-screen font-sans pb-24 md:pb-0">
            
            <div className="hidden md:block relative z-10 max-w-7xl mx-auto pt-16 pb-0 px-4 sm:px-6 lg:px-8">
                 <div className="relative rounded-3xl overflow-hidden p-12 mb-6 bg-black" style={{ height: '350px' }}>
                    {/* LiquidEther Background */}
                    <div className="absolute inset-0 w-full h-full z-0">
                      <LiquidEther
                        colors={['#5227FF', '#FF9FFC', '#B19EEF']}
                        mouseForce={20}
                        cursorSize={100}
                        isViscous={false}
                        viscous={30}
                        iterationsViscous={32}
                        iterationsPoisson={32}
                        resolution={0.5}
                        isBounce={false}
                        autoDemo={true}
                        autoSpeed={0.5}
                        autoIntensity={2.2}
                        takeoverDuration={0.25}
                        autoResumeDelay={3000}
                        autoRampDuration={0.6}
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <div className="pointer-events-none">
                        <SplitText
                          text="การประมูลสุดพิเศษ"
                          tag="h1"
                          className="text-5xl md:text-7xl font-bold tracking-tight text-white drop-shadow-2xl"
                          delay={50}
                          duration={0.8}
                          ease="power3.out"
                          splitType="chars"
                          from={{ opacity: 0, y: 50 }}
                          to={{ opacity: 1, y: 0 }}
                          threshold={0.1}
                          rootMargin="-50px"
                          textAlign="center"
                        />
                        <div className="mt-4 max-w-2xl mx-auto">
                          <SplitText
                            text="พบกับสินค้าหายากและของสะสมสุดล้ำค่า ที่นี่ที่เดียว"
                            tag="p"
                            className="text-lg text-gray-100 drop-shadow-lg"
                            delay={30}
                            duration={0.6}
                            ease="power2.out"
                            splitType="words"
                            from={{ opacity: 0, y: 20 }}
                            to={{ opacity: 1, y: 0 }}
                            threshold={0.1}
                            rootMargin="-50px"
                            textAlign="center"
                          />
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="flex flex-wrap items-center justify-center gap-4 mt-8 pointer-events-auto"
                      >
                        <Link
                          to="/"
                          className="group relative inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-black bg-white rounded-full overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-gray-100"
                        >
                          <span className="relative z-10">วิธีการประมูล</span>
                        </Link>
                        <Link
                          to="/"
                          className="group relative inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-full overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white/20"
                        >
                          <span className="relative z-10">ดูการประมูล</span>
                        </Link>
                      </motion.div>
                    </div>
                </div>
            </div>

            <main className="p-3 md:p-0">
                {/* Viewing History - Horizontal Scroll - Extra Small */}
                <section className="mb-3 md:hidden">
                    <div className="flex justify-between items-center mb-1">
                        <h2 className="font-medium text-[10px] text-gray-500">ประวัติการเข้าชม</h2>
                        <button onClick={() => handleActionClick('สินค้าเพิ่มเติม')} className="text-blue-400 text-[9px] font-normal">สินค้าเพิ่มเติม &gt;</button>
                    </div>
                    {viewHistoryLoading ? (
                        <div className="flex space-x-1.5 overflow-x-auto pb-0.5 -mx-3 px-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-24 h-24 bg-gray-200 animate-pulse rounded"></div>
                            ))}
                        </div>
                    ) : viewHistory.length > 0 ? (
                        <div className="flex space-x-1.5 overflow-x-auto pb-0.5 -mx-3 px-3 hide-scrollbar">
                            {viewHistory
                                .filter(product => !hiddenProductIds.has(product.id))
                                .slice(0, 3)
                                .map(product => (
                                    <ProductCard key={product.id} product={product} isHorizontalScroll={true} favoriteIds={favoriteIds} userBidIds={userBidIds} />
                                ))}
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-gray-400 text-[9px]">ยังไม่มีประวัติการเข้าชม</p>
                        </div>
                    )}
                </section>

                {/* Recommended For You - Grid */}
                <section className="md:hidden">
                    <h2 className="font-bold text-sm mb-2">สินค้าแนะนำสำหรับคุณ</h2>
                    <div className="grid grid-cols-3 gap-3">
                        {displayedProducts
                            .filter(product => !hiddenProductIds.has(product.id))
                            .map(product => (
                                <ProductCard key={product.id} product={product} favoriteIds={favoriteIds} userBidIds={userBidIds} />
                            ))}
                    </div>
                    {/* Loading indicator for infinite scroll */}
                    {loadingMore && (
                        <div className="mt-4 text-center">
                            <div className="inline-flex items-center space-x-2 text-gray-500">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                                <span className="text-sm">กำลังโหลดสินค้าเพิ่มเติม...</span>
                            </div>
                        </div>
                    )}
                </section>
                 {/* Original Desktop Product Grid */}
                <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">สินค้าประมูล</h2>
                        <p className="text-gray-600 text-sm mt-1">ร่วมประมูลสินค้าคุณภาพในราคาพิเศษ</p>
                    </div>
                    <div className="grid grid-cols-5 gap-4">
                        {displayedProducts
                            .filter(product => !hiddenProductIds.has(product.id))
                            .map((product) => (
                                <ProductCard key={product.id} product={product} favoriteIds={favoriteIds} userBidIds={userBidIds} />
                            ))}
                    </div>
                    {/* Load More Button - Desktop */}
                    {/* Loading indicator for infinite scroll */}
                    {loadingMore && (
                        <div className="mt-8 text-center">
                            <div className="inline-flex items-center space-x-2 text-gray-500">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                                <span className="text-lg">กำลังโหลดสินค้าเพิ่มเติม...</span>
                            </div>
                        </div>
                    )}
                </div>
            </main>



            {/* Reviews Section - Desktop */}
            <div className="hidden md:block bg-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-3">เสียงจากผู้ใช้งาน</h2>
                        <p className="text-gray-600 text-lg">ประสบการณ์การประมูลที่พวกเขาประทับใจ</p>
                    </div>
                    
                    <div className="flex overflow-x-auto gap-6 pb-6 hide-scrollbar snap-x snap-mandatory scroll-smooth -mx-4 px-4">
                        {[
                            {
                                id: 1,
                                text: "ประทับใจระบบการประมูลมาก ใช้งานง่าย รวดเร็ว และได้สินค้าที่ต้องการในราคาที่ดี ประมูลได้ฟิกเกอร์หายากที่หามานาน จะมาใช้บริการอีกแน่นอน",
                                avatar: "https://randomuser.me/api/portraits/men/32.jpg",
                                name: "สมชาย วงศ์ทอง",
                                role: "นักสะสมฟิกเกอร์"
                            },
                            {
                                id: 2,
                                text: "PAMOON เป็นแพลตฟอร์มที่ดีที่สุดสำหรับนักสะสม มีของหายาก ของสะสมเยอะมาก ระบบการประมูลโปร่งใส เชื่อถือได้ แนะนำเลยครับ",
                                avatar: "https://randomuser.me/api/portraits/women/44.jpg",
                                name: "วิภาวี ใจดี",
                                role: "นักสะสมของเล่น"
                            },
                            {
                                id: 3,
                                text: "ใช้งานง่าย ไม่ซับซ้อน การประมูลเป็นไปอย่างยุติธรรม ทีมงานดูแลดีมาก ตอบคำถามเร็ว สินค้าที่ได้มีคุณภาพตามที่แจ้งไว้ ประทับใจครับ",
                                avatar: "https://randomuser.me/api/portraits/men/75.jpg",
                                name: "ธนพล สุขสันต์",
                                role: "นักสะสมการ์ดเกม"
                            },
                            {
                                id: 4,
                                text: "ได้สินค้าที่ชอบในราคาที่คุ้มค่า ระบบการประมูลทำงานได้ดีมาก ไม่มีปัญหา การจัดส่งรวดเร็ว สินค้าบรรจุภัณฑ์ดี ปลอดภัย",
                                avatar: "https://randomuser.me/api/portraits/women/68.jpg",
                                name: "นภัสสร ศรีสุข",
                                role: "นักสะสมโมเดล"
                            },
                            {
                                id: 5,
                                text: "เว็บไซต์ใช้งานง่าย ค้นหาสินค้าสะดวก มีหมวดหมู่ให้เลือกเยอะ ประมูลได้สินค้าที่ต้องการหลายชิ้น พอใจมากครับ",
                                avatar: "https://randomuser.me/api/portraits/men/46.jpg",
                                name: "ประเสริฐ มั่นคง",
                                role: "นักสะสมหนังสือ"
                            },
                            {
                                id: 6,
                                text: "บริการดีเยี่ยม ระบบการประมูลมีความยุติธรรม ไม่มีการโกง ได้ของสะสมหายากที่หามานาน ขอบคุณ PAMOON มากครับ",
                                avatar: "https://randomuser.me/api/portraits/women/29.jpg",
                                name: "สุภาพร แก้วใส",
                                role: "นักสะสมของโบราณ"
                            },
                            {
                                id: 7,
                                text: "ราคาดี คุณภาพดี ประมูลได้สินค้าในราคาที่ต่ำกว่าตลาด แต่ได้ของแท้ มีใบรับรอง แนะนำให้เพื่อนๆ มาใช้บริการ",
                                avatar: "https://randomuser.me/api/portraits/men/52.jpg",
                                name: "วิชัย ทองคำ",
                                role: "นักสะสมของวินเทจ"
                            },
                            {
                                id: 8,
                                text: "ประมูลครั้งแรกกับ PAMOON ได้สินค้าที่ต้องการเลย ระบบแจ้งเตือนทำงานดี ไม่พลาดการประมูล บริการหลังการขายก็ดีมาก",
                                avatar: "https://randomuser.me/api/portraits/women/65.jpg",
                                name: "กนกวรรณ สว่างใจ",
                                role: "นักสะสมเครื่องเล่น"
                            }
                        ].map((review) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: review.id * 0.05 }}
                                className="flex-shrink-0 w-96 snap-start bg-gray-50 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-lg transition-all group"
                            >
                                <div className="flex flex-col h-full">
                                    <p className="text-gray-700 text-sm leading-relaxed mb-6 flex-grow">
                                        "{review.text}"
                                    </p>
                                    <div className="flex items-center space-x-3">
                                        <img 
                                            src={review.avatar} 
                                            alt={review.name}
                                            className="w-12 h-12 rounded-full border-2 border-gray-200 group-hover:border-gray-900 transition-colors"
                                        />
                                        <div>
                                            <p className="text-gray-900 font-semibold text-sm">{review.name}</p>
                                            <p className="text-gray-500 text-xs">{review.role}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Reviews Section - Mobile */}
            <div className="md:hidden bg-gradient-to-b from-gray-50 to-white py-10">
                <div className="px-4">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-1">เสียงจากผู้ใช้งาน</h2>
                        <p className="text-gray-600 text-xs">ประสบการณ์ที่ประทับใจ</p>
                    </div>
                    
                    <div className="flex overflow-x-auto gap-3 pb-4 hide-scrollbar snap-x snap-mandatory scroll-smooth -mx-4 px-4">
                        {[
                            {
                                id: 1,
                                text: "ประทับใจระบบการประมูล ใช้งานง่ายมาก ได้สินค้าในราคาที่ดี",
                                avatar: "https://randomuser.me/api/portraits/men/32.jpg",
                                name: "สมชาย วงศ์ทอง",
                                role: "นักสะสมฟิกเกอร์"
                            },
                            {
                                id: 2,
                                text: "PAMOON เป็นแพลตฟอร์มที่ดี มีของหายาก ระบบโปร่งใส เชื่อถือได้",
                                avatar: "https://randomuser.me/api/portraits/women/44.jpg",
                                name: "วิภาวี ใจดี",
                                role: "นักสะสมของเล่น"
                            },
                            {
                                id: 3,
                                text: "ใช้งานง่าย การประมูลยุติธรรม ทีมงานดูแลดี ตอบคำถามเร็ว",
                                avatar: "https://randomuser.me/api/portraits/men/75.jpg",
                                name: "ธนพล สุขสันต์",
                                role: "นักสะสมการ์ดเกม"
                            },
                            {
                                id: 4,
                                text: "ได้สินค้าที่ชอบในราคาคุ้มค่า ระบบทำงานดี การจัดส่งรวดเร็ว",
                                avatar: "https://randomuser.me/api/portraits/women/68.jpg",
                                name: "นภัสสร ศรีสุข",
                                role: "นักสะสมโมเดล"
                            },
                            {
                                id: 5,
                                text: "เว็บไซต์ใช้งานง่าย ค้นหาสะดวก มีหมวดหมู่ให้เลือกเยอะ",
                                avatar: "https://randomuser.me/api/portraits/men/46.jpg",
                                name: "ประเสริฐ มั่นคง",
                                role: "นักสะสมหนังสือ"
                            },
                            {
                                id: 6,
                                text: "บริการดีเยี่ยม ระบบยุติธรรม ได้ของสะสมหายาก ขอบคุณมากครับ",
                                avatar: "https://randomuser.me/api/portraits/women/29.jpg",
                                name: "สุภาพร แก้วใส",
                                role: "นักสะสมของโบราณ"
                            },
                            {
                                id: 7,
                                text: "ราคาดี คุณภาพดี ประมูลได้ของแท้ในราคาที่ต่ำกว่าตลาด",
                                avatar: "https://randomuser.me/api/portraits/men/52.jpg",
                                name: "วิชัย ทองคำ",
                                role: "นักสะสมของวินเทจ"
                            },
                            {
                                id: 8,
                                text: "ประมูลครั้งแรกได้สินค้าเลย ระบบแจ้งเตือนดี บริการดีมาก",
                                avatar: "https://randomuser.me/api/portraits/women/65.jpg",
                                name: "กนกวรรณ สว่างใจ",
                                role: "นักสะสมเครื่องเล่น"
                            }
                        ].map((review) => (
                            <div
                                key={review.id}
                                className="flex-shrink-0 w-[280px] snap-start bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                            >
                                <div className="flex flex-col">
                                    <p className="text-gray-700 text-xs leading-relaxed mb-3 line-clamp-3">
                                        "{review.text}"
                                    </p>
                                    <div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
                                        <img 
                                            src={review.avatar} 
                                            alt={review.name}
                                            className="w-9 h-9 rounded-full border-2 border-gray-200"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-gray-900 font-semibold text-xs truncate">{review.name}</p>
                                            <p className="text-gray-500 text-[10px] truncate">{review.role}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
