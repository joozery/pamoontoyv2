
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import Swal from 'sweetalert2';
import { apiService } from '@/services/api';
import { io } from 'socket.io-client';
import { 
  Heart, 
  Share2, 
  Clock, 
  Shield, 
  Package,
  MessageCircle,
  AlertCircle,
  Gavel,
  History,
  ArrowLeft,
  Zap,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CountdownTimer = ({ endTime, currentPrice, userBid, isWon, isBought }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [auctionStatus, setAuctionStatus] = useState('active'); // 'active', 'leading', 'outbid', 'won', 'bought'

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endTime) - new Date();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        if (days > 0) {
          return `${days} วัน ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      return 'สิ้นสุดแล้ว';
    };

    const initialTime = calculateTimeLeft();
    setTimeLeft(initialTime);

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  useEffect(() => {
    // Determine auction status
    const auctionEnded = new Date(endTime) <= new Date();
    
    if (isBought) {
      setAuctionStatus('bought');
    } else if (auctionEnded && isWon) {
      // Only show "won" if auction has ended
      setAuctionStatus('won');
    } else if (userBid && userBid < currentPrice) {
      // Someone outbid the user
      setAuctionStatus('outbid');
    } else if (userBid && userBid === currentPrice && !auctionEnded) {
      // User is currently leading but auction not ended yet
      setAuctionStatus('leading');
    } else {
      setAuctionStatus('active');
    }
  }, [currentPrice, userBid, isWon, isBought, endTime]);

  // Parse timeLeft to extract days, hours, minutes, seconds
  const parseTime = (timeString) => {
    if (timeString === 'สิ้นสุดแล้ว') {
      return { days: '0', hours: '00', minutes: '00', seconds: '00' };
    }
    
    if (timeString.includes('วัน')) {
      const [dayPart, timePart] = timeString.split(' วัน ');
      const days = dayPart;
      const [hours, minutes, seconds] = timePart.split(':');
      return { days, hours, minutes, seconds };
    } else {
      const [hours, minutes, seconds] = timeString.split(':');
      return { days: '0', hours, minutes, seconds };
    }
  };

  const { days, hours, minutes, seconds } = parseTime(timeLeft);

  const getStatusConfig = () => {
    switch (auctionStatus) {
      case 'bought':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-600',
          borderColor: 'border-green-300',
          statusText: 'ซื้อแล้ว',
          statusBg: 'bg-green-500'
        };
      case 'won':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-600',
          borderColor: 'border-green-300',
          statusText: 'ชนะการประมูล',
          statusBg: 'bg-green-500'
        };
      case 'leading':
        return {
          bgColor: 'bg-gradient-to-br from-yellow-50 to-green-50',
          textColor: 'text-green-600',
          borderColor: 'border-green-300',
          statusText: '🏆 คุณกำลังชนะ!',
          statusBg: 'bg-gradient-to-r from-yellow-500 to-green-500'
        };
      case 'outbid':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-600',
          borderColor: 'border-red-300',
          statusText: 'โดนแซง',
          statusBg: 'bg-red-500'
        };
      default:
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-600',
          borderColor: 'border-blue-300',
          statusText: 'กำลังประมูล',
          statusBg: 'bg-blue-500'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`${config.bgColor} rounded-lg p-4 border ${config.borderColor}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`${config.textColor} font-semibold text-sm`}>เหลือ</span>
        <div className={`${config.statusBg} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
          {config.statusText}
        </div>
      </div>
      <div className="flex items-center justify-center space-x-2">
        <div className="flex items-center space-x-1">
          <div className="bg-white border border-gray-300 rounded px-2 py-1">
            <span className={`${config.textColor} font-bold text-lg`}>{days}</span>
          </div>
          <span className={`${config.textColor} font-bold`}>วัน</span>
          <div className="bg-white border border-gray-300 rounded px-2 py-1">
            <span className={`${config.textColor} font-bold text-lg`}>{hours}</span>
          </div>
          <span className={`${config.textColor} font-bold`}>:</span>
          <div className="bg-white border border-gray-300 rounded px-2 py-1">
            <span className={`${config.textColor} font-bold text-lg`}>{minutes}</span>
          </div>
          <span className={`${config.textColor} font-bold`}>:</span>
          <div className="bg-white border border-gray-300 rounded px-2 py-1">
            <span className={`${config.textColor} font-bold text-lg`}>{seconds}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidHistory, setBidHistory] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [showBidPopup, setShowBidPopup] = useState(false);
  const [popupBidAmount, setPopupBidAmount] = useState('');
  const [showBidHistory, setShowBidHistory] = useState(false);
  const [userBid, setUserBid] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isBought, setIsBought] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const productRef = useRef(null);
  const socketRef = useRef(null);

  // Function to refresh bid history with userId parameter
  const refreshBidHistoryWithUserId = async (userId = null) => {
    try {
      const bidResponse = await apiService.bids.getProductBids(id);
      const bidHistoryData = bidResponse.data.data.map(bid => ({
        id: bid.id,
        user: bid.bidder_name || 'ผู้ใช้***',
        userId: bid.user_id,
        amount: parseFloat(bid.bid_amount),
        time: new Date(bid.bid_time).toLocaleString('th-TH'),
        isHighest: bid.is_highest || false
      }));
      setBidHistory(bidHistoryData);

      // Update current price from latest bid
      if (bidHistoryData.length > 0) {
        const latestPrice = Math.max(...bidHistoryData.map(bid => bid.amount));
        setProduct(prev => ({ ...prev, currentPrice: latestPrice }));
      }

      // Check if current user has bid (ใช้ userId ที่ส่งมา)
      const checkUserId = userId || currentUserId;
      if (checkUserId) {
        const userBids = bidHistoryData.filter(bid => bid.userId === checkUserId);
        if (userBids.length > 0) {
          const highestUserBid = Math.max(...userBids.map(bid => bid.amount));
          setUserBid(highestUserBid);
          
          // Check if user won (only matters if auction ended)
          const currentHighestBid = Math.max(...bidHistoryData.map(bid => bid.amount));
          // isWon should only be true when auction ends and user has highest bid
          // During auction, we'll use 'leading' status instead
          setIsWon(highestUserBid === currentHighestBid);
        } else {
          setUserBid(0);
          setIsWon(false);
        }
      }
    } catch (error) {
      console.error('Error refreshing bid history:', error);
    }
  };

  // Wrapper function for backward compatibility
  const refreshBidHistory = async () => {
    await refreshBidHistoryWithUserId(currentUserId);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await apiService.products.getById(id);
        const productData = response.data.data;
        
        // Parse images from JSON string if needed
        let images = [];
        if (productData.images) {
          if (typeof productData.images === 'string') {
            try {
              images = JSON.parse(productData.images);
            } catch (e) {
              images = [productData.image_url || productData.primary_image];
            }
          } else if (Array.isArray(productData.images)) {
            images = productData.images;
          }
        }
        
        // If no images, use placeholder
        if (images.length === 0) {
          images = [productData.image_url || productData.primary_image || 'https://placehold.co/800x800/e5e7eb/9ca3af?text=No+Image'];
        }

        const formattedProduct = {
          id: productData.id,
          name: productData.name,
          description: productData.description || 'ไม่มีรายละเอียด',
          currentPrice: parseFloat(productData.current_price || productData.starting_price || 0),
          startPrice: parseFloat(productData.starting_price || 0),
          buyNowPrice: parseFloat(productData.buy_now_price || 0),
          category: productData.category || 'ไม่ระบุ',
          condition: productData.condition_status || 'ไม่ระบุ',
          status: productData.status || 'active',
          seller: {
            name: productData.seller_name || 'ไม่ระบุ',
            rating: productData.seller_rating || 0,
            totalSales: productData.seller_total_sales || 0,
            verified: true
          },
          endTime: productData.auction_end || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          images: images,
          totalBids: productData.bid_count || 0,
          views: productData.view_count || 0,
          watchers: 0,
          shipping: productData.shipping_cost > 0 ? `฿${parseFloat(productData.shipping_cost).toLocaleString()}` : 'ฟรี',
          shippingCost: parseFloat(productData.shipping_cost || 0),
          location: productData.location || 'ไม่ระบุ',
          brand: productData.brand || 'ไม่ระบุ',
          minBidIncrement: parseFloat(productData.min_bid_increment || 10)
        };
        
        // Check if product is sold (bought now)
        if (productData.status === 'sold') {
          setIsBought(true);
        }

        setProduct(formattedProduct);
        setBidAmount((formattedProduct.currentPrice + 100).toString());

        // Get current user ID ก่อน fetch bid history
        const token = localStorage.getItem('token');
        let userId = null;
        if (token) {
          try {
            const userResponse = await apiService.auth.getProfile();
            userId = userResponse.data.user.id;
            setCurrentUserId(userId);
          } catch (error) {
            console.error('Error getting user profile:', error);
          }
        }

        // Fetch bid history พร้อม userId
        await refreshBidHistoryWithUserId(userId);

        // Fetch related products
        try {
          const relatedResponse = await apiService.products.getAll({ 
            limit: 6, 
            category: productData.category,
            exclude: id,
            status: 'active' // Only show active products
          });
          // Filter to show only active products that are still in auction
          const activeProducts = (relatedResponse.data.data || []).filter(product => {
            const isActive = product.status === 'active';
            const isStillInAuction = product.auction_end && new Date(product.auction_end) > new Date();
            return isActive && isStillInAuction;
          });
          setRelatedProducts(activeProducts);
        } catch (error) {
          console.error('Error fetching related products:', error);
          setRelatedProducts([]);
        }

      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลสินค้าได้",
          variant: "destructive"
        });
        navigate('/');
      }
    };

    fetchProduct();

    // ✅ Update ref เมื่อ product เปลี่ยน
    productRef.current = product;

    // Auto-refresh product and bid history every 5 seconds (real-time bidding)
    const refreshInterval = setInterval(async () => {
      try {
        const currentProduct = productRef.current;
        if (!currentProduct) return;
        
        // Refresh product data (รวม auction_end ที่อาจถูกขยาย)
        const productResponse = await apiService.products.getById(id);
        const productData = productResponse.data.data;
        
        let shouldRefreshBids = false;
        
        // เช็คว่ามี bid ใหม่หรือไม่
        if (productData.bid_count !== currentProduct.totalBids) {
          shouldRefreshBids = true;
          
          setProduct(prev => ({
            ...prev,
            currentPrice: parseFloat(productData.current_price || productData.starting_price || 0),
            totalBids: productData.bid_count || 0
          }));
        }
        
        // อัพเดท auction_end ถ้ามีการเปลี่ยนแปลง
        if (productData.auction_end !== currentProduct.auction_end) {
          // แสดง toast แจ้งเตือน
          const oldEnd = new Date(currentProduct.auction_end);
          const newEnd = new Date(productData.auction_end);
          
          if (newEnd > oldEnd) {
            toast({
              title: "⏰ ขยายเวลาประมูล!",
              description: "ระบบได้ขยายเวลาประมูลออกไปอีก 5 นาทีเพื่อความยุติธรรม",
              duration: 5000
            });
          }
          
          setProduct(prev => ({
            ...prev,
            auction_end: productData.auction_end
          }));
        }
        
        // Refresh bid history ถ้ามี bid ใหม่
        if (shouldRefreshBids) {
          await refreshBidHistory();
        }
      } catch (error) {
        // Ignore 503 errors (server busy)
        if (error.response?.status !== 503) {
          console.error('Error refreshing product:', error);
        }
      }
    }, 5000); // 5 seconds (real-time มากขึ้น)

    return () => clearInterval(refreshInterval);
  }, [id]);

  // ✅ WebSocket connection for real-time updates
  useEffect(() => {
    // Initialize WebSocket connection
    const socket = io(import.meta.env.VITE_API_URL || 'https://api.pamoontoy.site', {
      transports: ['websocket', 'polling']
    });
    
    socketRef.current = socket;

    socket.on('connect', () => {
      // Join auction room
      socket.emit('join_auction', id);
    });

    // Listen for new bids
    socket.on('new_bid', (data) => {
      
      // อัพเดทราคาและจำนวน bid ทันที
      setProduct(prev => {
        if (!prev) {
          console.warn('⚠️ Product not loaded, cannot update');
          return prev;
        }
        
        
        const updated = {
          ...prev,
          currentPrice: data.currentPrice,
          totalBids: data.bidCount
        };
        
        // ถ้ามีการขยาย/reset เวลา → อัพเดท endTime และ auction_end
        if (data.timeExtended && data.newAuctionEnd) {
          updated.endTime = data.newAuctionEnd;
          updated.auction_end = data.newAuctionEnd;
        }
        
        return updated;
      });
      
      // อัพเดท productRef ด้วย
      if (productRef.current) {
        productRef.current.currentPrice = data.currentPrice;
        productRef.current.totalBids = data.bidCount;
        
        if (data.timeExtended && data.newAuctionEnd) {
          productRef.current.endTime = data.newAuctionEnd;
          productRef.current.auction_end = data.newAuctionEnd;
        }
      }
      
      // Refresh bid history เพื่ออัพเดทสถานะ
      refreshBidHistory();
      
      // แสดง toast ถ้าเวลาถูกขยาย
      if (data.timeExtended) {
        toast({
          title: "⏰ ขยายเวลาประมูล!",
          description: "มีการประมูลใหม่ เวลาถูกขยายเป็น 5 นาทีเต็ม",
          duration: 5000
        });
      }
    });

    // Listen for auction extended
    socket.on('auction_extended', (data) => {
      
      setProduct(prev => {
        
        // ถ้า product ยังไม่โหลด ไม่อัพเดท
        if (!prev) {
          console.warn('⚠️ Product not loaded yet, skipping update');
          return prev;
        }
        
        const updated = {
          ...prev,
          endTime: data.newAuctionEnd,  // ใช้ endTime เพราะ CountdownTimer รับ endTime
          auction_end: data.newAuctionEnd  // เก็บทั้งสองเพื่อความปลอดภัย
        };
        
        return updated;
      });
      
      // ✅ อัพเดท productRef ด้วย
      if (productRef.current) {
        productRef.current = {
          ...productRef.current,
          endTime: data.newAuctionEnd,
          auction_end: data.newAuctionEnd
        };
      }
      
      toast({
        title: "⏰ ขยายเวลาประมูล!",
        description: "ระบบได้ขยายเวลาประมูลออกไปอีก 5 นาที",
        duration: 5000
      });
    });

    socket.on('disconnect', () => {
    });

    // Cleanup on unmount
    return () => {
      socket.emit('leave_auction', id);
      socket.disconnect();
    };
  }, [id]);

  const handleBid = () => {
    // Open popup for bid amount input
    setPopupBidAmount((product.currentPrice + 100).toString());
    setShowBidPopup(true);
  };

  const handlePopupBid = async () => {
    const amount = parseInt(popupBidAmount);
    if (!amount || amount <= product.currentPrice) {
      toast({
        title: "❌ ราคาเสนอไม่ถูกต้อง",
        description: `กรุณาเสนอราคาสูงกว่า ฿${product.currentPrice.toLocaleString()}`,
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await apiService.bids.placeBid(id, { amount });
      
      // ✅ Check if time was extended
      if (response.data?.data?.timeExtended) {
        toast({
          title: "⏰ เสนอราคาสำเร็จ + ขยายเวลา!",
          description: `คุณเสนอราคา ฿${amount.toLocaleString()} และเวลาประมูลถูกขยายออกไปอีก 5 นาที!`,
          duration: 5000
        });
        
        // Update auction_end in product state
        if (response.data.data.newAuctionEnd) {
          setProduct(prev => ({ 
            ...prev, 
            currentPrice: amount, 
            totalBids: prev.totalBids + 1,
            auction_end: response.data.data.newAuctionEnd
          }));
        }
      } else {
        toast({
          title: "✅ เสนอราคาสำเร็จ!",
          description: `คุณเสนอราคา ฿${amount.toLocaleString()} สำหรับสินค้านี้`,
        });
        
        // Update local state
        setProduct({ ...product, currentPrice: amount, totalBids: product.totalBids + 1 });
      }

      setBidAmount((amount + 100).toString());
      setUserBid(amount);
      // Don't set isWon=true here - let refreshBidHistory handle it
      setShowBidPopup(false);

      // Refresh bid history
      await refreshBidHistory();

    } catch (error) {
      console.error('Error placing bid:', error);
      toast({
        title: "❌ เสนอราคาไม่สำเร็จ",
        description: error.response?.data?.message || "ไม่สามารถเสนอราคาได้",
        variant: "destructive"
      });
    }
  };

  // Expose handleBid to global scope for BottomNavBar
  useEffect(() => {
    window.handleBid = handleBid;
    return () => {
      delete window.handleBid;
    };
  }, [handleBid]);

  // ✅ Auto-redirect for sold/ended products after 2-3 minutes
  useEffect(() => {
    if (!product) return;
    
    const checkProductStatus = () => {
      const now = new Date();
      const isSold = product.status === 'sold';
      const isEnded = product.status === 'active' && product.auction_end && new Date(product.auction_end) <= now;
      
      if (isSold || isEnded) {
        // ตรวจสอบว่าสินค้านี้ขายไปหรือสิ้นสุดเมื่อไหร่
        const endTime = new Date(product.auction_end || product.updated_at);
        const timeSinceEnd = now - endTime;
        
        // ถ้าผ่านไป 2-3 นาที (120-180 วินาที) ให้ redirect
        const hideAfterMs = 150000; // 2.5 นาที (150 วินาที)
        
        if (timeSinceEnd >= hideAfterMs) {
          toast({
            title: "สินค้านี้ได้ถูกขายไปแล้ว",
            description: "กำลังนำคุณกลับไปหน้าแรก...",
            duration: 3000
          });
          
          // Redirect after 3 seconds
          setTimeout(() => {
            navigate('/');
          }, 3000);
          
          setShouldRedirect(true);
        }
      }
    };
    
    // เช็คทุก 30 วินาที
    const interval = setInterval(checkProductStatus, 30000);
    checkProductStatus(); // เช็คทันทีตอนโหลดหน้า
    
    return () => clearInterval(interval);
  }, [product, navigate]);


  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "❤️ ลบออกจากรายการโปรด" : "❤️ เพิ่มในรายการโปรด",
      description: isFavorite ? "ลบสินค้าออกจากรายการโปรดแล้ว" : "เพิ่มสินค้าในรายการโปรดแล้ว",
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "✅ คัดลอกลิงก์แล้ว",
      description: "คัดลอกลิงก์สินค้าไปยังคลิปบอร์ดแล้ว",
    });
  };

  // Touch handling for swipe
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && selectedImage < product.images.length - 1) {
      setSelectedImage(selectedImage + 1);
    }
    if (isRightSwipe && selectedImage > 0) {
      setSelectedImage(selectedImage - 1);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-40 md:pb-0">
      {/* Mobile Back Button */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 truncate">{product.name}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery - Slide Version */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl overflow-hidden shadow-sm"
            >
              {/* Main Image with Slide Controls */}
              <div 
                className="aspect-square bg-gray-100 relative overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img 
                  src={product.images[selectedImage]} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300"
                />
                
                {/* Slide Navigation */}
                {product.images.length > 1 && (
                  <>
                    {/* Previous Button */}
                    <button
                      onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : product.images.length - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    {/* Next Button */}
                    <button
                      onClick={() => setSelectedImage(selectedImage < product.images.length - 1 ? selectedImage + 1 : 0)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {product.images.length > 1 && (
                  <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {selectedImage + 1} / {product.images.length}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 hidden md:flex space-x-2">
                  <button onClick={handleShare} className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button onClick={handleToggleFavorite} className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100">
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                </div>

                {/* Dots Indicator */}
                {product.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {product.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          selectedImage === idx ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Product Info Summary - Compact */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-xl p-4 shadow-sm space-y-3"
            >
              {/* Countdown Timer or Order Button */}
              {(() => {
                const auctionEnded = new Date(product.endTime) <= new Date();
                const productSold = product.status === 'sold';
                const showWonMessage = (isBought || (isWon && auctionEnded));
                
                // If product sold but user didn't buy it
                if (productSold && !isBought) {
                  return (
                    <div className="bg-gray-100 rounded-lg p-4 border border-gray-300">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">สินค้าขายไปแล้ว</h3>
                        <p className="text-gray-600 text-sm">
                          สินค้านี้ถูกซื้อในราคา ฿{product.currentPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                }
                
                return !showWonMessage ? (
                  <CountdownTimer 
                    endTime={product.endTime} 
                    currentPrice={product.currentPrice}
                    userBid={userBid}
                    isWon={isWon}
                    isBought={isBought}
                  />
                ) : (
                  <div className="bg-green-100 rounded-lg p-4 border border-green-300">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-green-800 mb-2">
                        {isBought ? 'ซื้อสำเร็จ!' : 'ชนะการประมูล!'}
                      </h3>
                      <p className="text-green-600 text-sm mb-4">
                        {isBought 
                          ? `คุณซื้อสินค้านี้ในราคา ฿${product.currentPrice.toLocaleString()}`
                          : `คุณชนะการประมูลในราคา ฿${product.currentPrice.toLocaleString()}`
                        }
                      </p>
                      <Button 
                        onClick={() => navigate('/orders')}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                      >
                        ดูคำสั่งซื้อ
                      </Button>
                    </div>
                  </div>
                );
              })()}
              
              {/* Product Name */}
              <h1 className="text-lg font-bold text-gray-900 leading-tight">{product.name}</h1>
              
              {/* Current Price */}
         <div className="flex items-center justify-between">
           <div>
             <p className="text-sm text-gray-600">ราคาประมูลปัจจุบัน</p>
             <p className="text-2xl font-bold text-black">฿{product.currentPrice.toLocaleString()}</p>
           </div>
           {product.buyNowPrice > 0 && (
             <div className="text-right">
               <p className="text-sm text-red-500">ซื้อทันที</p>
               <p className="text-lg font-semibold text-red-600">฿{product.buyNowPrice.toLocaleString()}</p>
             </div>
           )}
         </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-900 text-white text-sm rounded-full font-medium">
                  {product.category}
                </span>
                <span className="px-3 py-1 bg-gray-900 text-white text-sm rounded-full font-medium">
                  {product.condition}
                </span>
                <span className="px-3 py-1 bg-gray-900 text-white text-sm rounded-full font-medium">
                  BANDAI
                </span>
              </div>
              
              {/* Shipping Info */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">ค่าจัดส่ง</span>
                </div>
                <span className="font-semibold text-gray-900">{product.shipping}</span>
              </div>
              
              {/* Location */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-600">สถานที่</span>
                </div>
                <span className="font-semibold text-gray-900">{product.location}</span>
              </div>
            </motion.div>

            {/* Product Description */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-4 shadow-sm"
            >
              <h2 className="text-lg font-semibold mb-3">รายละเอียดสินค้า</h2>
              
              {/* Product Details Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b">
                {product.brand && product.brand !== 'ไม่ระบุ' && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">แบรนด์</p>
                    <p className="text-sm font-medium text-gray-900">{product.brand}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 mb-1">สภาพสินค้า</p>
                  <p className="text-sm font-medium text-gray-900">
                    {product.condition === 'new' ? 'ใหม่' : product.condition === 'like_new' ? 'เหมือนใหม่' : product.condition === 'good' ? 'ดี' : product.condition === 'fair' ? 'พอใช้' : product.condition}
                  </p>
                </div>
                {product.category && product.category !== 'ไม่ระบุ' && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">หมวดหมู่</p>
                    <p className="text-sm font-medium text-gray-900">{product.category}</p>
                  </div>
                )}
                {product.location && product.location !== 'ไม่ระบุ' && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">สถานที่</p>
                    <p className="text-sm font-medium text-gray-900">{product.location}</p>
                  </div>
                )}
              </div>
              
              <div 
                className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </motion.div>

            {/* Seller Info */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold mb-4">ข้อมูลผู้ขาย</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {product.seller.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold text-gray-900">{product.seller.name}</p>
                      {product.seller.verified && (
                        <Shield className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <span>{product.seller.totalSales} รายการขาย</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  ติดต่อ
                </Button>
              </div>
            </motion.div>

            {/* Related Products from Same Seller */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold mb-4">สินค้าจากผู้ขายเดียวกัน</h2>
              
              {relatedProducts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">ไม่มีสินค้าอื่นจากผู้ขายนี้ที่กำลังประมูลอยู่</p>
                </div>
              ) : (
                <>
                  {/* Mobile: Grid 3 columns, 2 rows */}
                  <div className="md:hidden grid grid-cols-3 gap-3">
                {relatedProducts.slice(0, 6).map((relatedProduct) => {
                // Parse images from API response
                let productImage = 'https://placehold.co/400x400/e5e7eb/9ca3af?text=No+Image';
                if (relatedProduct.images && typeof relatedProduct.images === 'string') {
                  try {
                    const images = JSON.parse(relatedProduct.images);
                    if (images.length > 0) productImage = images[0];
                  } catch (e) {
                    productImage = relatedProduct.image_url || relatedProduct.primary_image || productImage;
                  }
                } else if (relatedProduct.image_url) {
                  productImage = relatedProduct.image_url;
                } else if (relatedProduct.primary_image) {
                  productImage = relatedProduct.primary_image;
                }

                return (
                  <Link
                    key={relatedProduct.id}
                    to={`/product/${relatedProduct.id}`}
                    className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                  <div className="aspect-square bg-gray-100 relative">
                    <img 
                      src={productImage} 
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/400x400/e5e7eb/9ca3af?text=No+Image';
                      }}
                    />
                    {relatedProduct.auction_end && (
                      <div className="absolute top-1 left-1 bg-red-600 text-white px-1.5 py-0.5 rounded text-[10px] font-semibold">
                        <Clock className="w-2 h-2 inline mr-0.5" />
                        {Math.ceil((new Date(relatedProduct.auction_end) - new Date()) / (1000 * 60 * 60 * 24))} วัน
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-gray-700 truncate font-medium">{relatedProduct.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm font-bold text-gray-900">฿{parseFloat(relatedProduct.current_price || relatedProduct.starting_price || 0).toLocaleString()}</p>
                      <p className="text-[10px] text-gray-500">{relatedProduct.bid_count || 0} ครั้ง</p>
                    </div>
                  </div>
                  </Link>
                );
                })}
              </div>

              {/* Desktop: Grid 3 columns, 2 rows */}
              <div className="hidden md:grid grid-cols-3 gap-4">
                {relatedProducts.slice(0, 6).map((relatedProduct) => {
                  // Parse images from API response
                  let productImage = 'https://placehold.co/400x400/e5e7eb/9ca3af?text=No+Image';
                  if (relatedProduct.images && typeof relatedProduct.images === 'string') {
                    try {
                      const images = JSON.parse(relatedProduct.images);
                      if (images.length > 0) productImage = images[0];
                    } catch (e) {
                      productImage = relatedProduct.image_url || relatedProduct.primary_image || productImage;
                    }
                  } else if (relatedProduct.image_url) {
                    productImage = relatedProduct.image_url;
                  } else if (relatedProduct.primary_image) {
                    productImage = relatedProduct.primary_image;
                  }

                  return (
                    <Link
                      key={relatedProduct.id}
                      to={`/product/${relatedProduct.id}`}
                      className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                    <div className="aspect-square bg-gray-100 relative">
                      <img 
                        src={productImage} 
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/400x400/e5e7eb/9ca3af?text=No+Image';
                        }}
                      />
                      {relatedProduct.auction_end && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {Math.ceil((new Date(relatedProduct.auction_end) - new Date()) / (1000 * 60 * 60 * 24))} วัน
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm text-gray-700 truncate font-medium">{relatedProduct.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-lg font-bold text-gray-900">฿{parseFloat(relatedProduct.current_price || relatedProduct.starting_price || 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{relatedProduct.bid_count || 0} ครั้ง</p>
                      </div>
                    </div>
                    </Link>
                  );
                })}
              </div>
                </>
              )}
            </motion.div>

            {/* Bid History */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <button
                onClick={() => setShowBidHistory(!showBidHistory)}
                className="flex items-center justify-between w-full mb-4 hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <History className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold">ประวัติการเสนอราคา</h2>
                  <span className="text-sm text-gray-500">({bidHistory.length})</span>
                </div>
                <div className={`transform transition-transform ${showBidHistory ? 'rotate-180' : ''}`}>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              {showBidHistory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3"
                >
                  {bidHistory.map((bid) => (
                    <div 
                      key={bid.id} 
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        bid.isHighest ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {bid.user.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{bid.user}</p>
                          <p className="text-xs text-gray-500">{bid.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${bid.isHighest ? 'text-green-600' : 'text-gray-900'}`}>
                          ฿{bid.amount.toLocaleString()}
                        </p>
                        {bid.isHighest && (
                          <p className="text-xs text-green-600 font-medium">ราคาสูงสุด</p>
                        )}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Bidding Panel */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm sticky top-20 space-y-6"
              data-bid-section
            >
              {/* Countdown Timer - Removed from here since it's now under image */}

              {/* Current Bid Price */}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600 mb-1">ราคาประมูลปัจจุบัน</p>
                <p className="text-3xl font-bold text-gray-900">฿{product.currentPrice.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">
                  ราคาเริ่มต้น ฿{product.startPrice.toLocaleString()}
                </p>
              </div>

              {/* Bid Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เสนอราคาของคุณ
                </label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="ใส่ราคาที่ต้องการเสนอ"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  ราคาขั้นต่ำ: ฿{(product.currentPrice + 100).toLocaleString()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {(() => {
                  const auctionEnded = new Date(product.endTime) <= new Date();
                  const productSold = product.status === 'sold';
                  const showWonMessage = (isBought || (isWon && auctionEnded));
                  
                  // If product is sold but user didn't buy it
                  if (productSold && !isBought) {
                    return (
                      <div className="text-center py-6 bg-gray-50 rounded-lg">
                        <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <p className="text-gray-700 font-semibold mb-1">สินค้าขายไปแล้ว</p>
                        <p className="text-gray-500 text-sm">ไม่สามารถประมูลได้</p>
                      </div>
                    );
                  }
                  
                  return !showWonMessage ? (
                    <Button 
                      onClick={handleBid} 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all" 
                      size="lg"
                      data-bid-button
                    >
                      <Gavel className="w-5 h-5 mr-2" />
                      เสนอราคาประมูล
                    </Button>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-600 text-sm">
                        {isBought ? 'คุณได้ซื้อสินค้านี้แล้ว' : 'คุณชนะการประมูลแล้ว'}
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">การันตีความปลอดภัย</p>
                    <p className="text-xs text-blue-700">
                      ทุกการทำธุรกรรมได้รับการคุ้มครองและมีระบบรักษาความปลอดภัย
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

      </div>

      {/* Mobile Bottom Bar */}
      {product.status !== 'sold' && !isBought && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-40">
          
          {/* Bid Section */}
          <div className="px-4 py-3">
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <p className="text-xs text-gray-600">ราคาประมูลปัจจุบัน</p>
                <p className="text-lg font-bold text-gray-900">฿{product.currentPrice.toLocaleString()}</p>
              </div>
              <Button onClick={handleBid} variant="outline" size="lg" className="border-2">
                <Gavel className="w-5 h-5 mr-2" />
                เสนอราคา
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bid Popup */}
      {showBidPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">เสนอราคาประมูล</h3>
              <button
                onClick={() => setShowBidPopup(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">ราคาประมูลปัจจุบัน</p>
                <p className="text-2xl font-bold text-black">฿{product.currentPrice.toLocaleString()}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ราคาที่ต้องการเสนอ
                </label>
                <input
                  type="number"
                  value={popupBidAmount}
                  onChange={(e) => setPopupBidAmount(e.target.value)}
                  placeholder="ใส่ราคา"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ราคาต่ำสุด: ฿{(product.currentPrice + 1).toLocaleString()}
                </p>
                
                {/* Quick bid buttons */}
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setPopupBidAmount((product.currentPrice + product.minBidIncrement).toString())}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    +฿{product.minBidIncrement}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPopupBidAmount((product.currentPrice + product.minBidIncrement * 5).toString())}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    +฿{product.minBidIncrement * 5}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPopupBidAmount((product.currentPrice + product.minBidIncrement * 10).toString())}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    +฿{product.minBidIncrement * 10}
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex space-x-3">
                  <Button
                    onClick={handlePopupBid}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Gavel className="w-4 h-4 mr-2" />
                    เสนอราคา
                  </Button>
                  {product.buyNowPrice > 0 && (
                    <Button
                      onClick={async () => {
                        const result = await Swal.fire({
                          title: 'ยืนยันการซื้อทันที',
                          text: `คุณต้องการซื้อสินค้านี้ในราคา ฿${product.buyNowPrice.toLocaleString()} ทันทีหรือไม่?`,
                          icon: 'warning',
                          showCancelButton: true,
                          confirmButtonColor: '#dc2626',
                          cancelButtonColor: '#6b7280',
                          confirmButtonText: 'ซื้อทันที',
                          cancelButtonText: 'ยกเลิก',
                          reverseButtons: true
                        });
                        
                        if (result.isConfirmed) {
                          try {
                            // Call buy now API
                            const response = await apiService.bids.buyNow(id);
                            const orderId = response.data.data.orderId;
                            
                            Swal.fire({
                              title: 'ซื้อทันทีสำเร็จ!',
                              text: `คุณซื้อสินค้านี้ในราคา ฿${product.buyNowPrice.toLocaleString()}`,
                              icon: 'success',
                              confirmButtonText: 'ไปชำระเงิน'
                            }).then((result) => {
                              if (result.isConfirmed) {
                                navigate(`/payment/${orderId}`);
                              }
                            });
                            
                            setIsBought(true);
                            setShowBidPopup(false);
                          } catch (error) {
                            console.error('Error buying now:', error);
                            Swal.fire({
                              title: 'เกิดข้อผิดพลาด',
                              text: error.response?.data?.message || 'ไม่สามารถซื้อสินค้าได้',
                              icon: 'error',
                              confirmButtonText: 'ตกลง'
                            });
                          }
                        }
                      }}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      ซื้อทันที ฿{product.buyNowPrice.toLocaleString()}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
