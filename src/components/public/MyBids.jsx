import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Trophy, TrendingUp, Package, Gavel, ArrowLeft, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import apiService from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

// Real-time Countdown Component
const CountdownTimer = ({ auctionEnd }) => {
    const [timeRemaining, setTimeRemaining] = useState('');

    useEffect(() => {
        const updateTimer = () => {
            if (!auctionEnd) {
                setTimeRemaining('ไม่ระบุ');
                return;
            }

            const now = new Date();
            const end = new Date(auctionEnd);
            const diff = end - now;
            
            if (diff <= 0) {
                setTimeRemaining('สิ้นสุดแล้ว');
                return;
            }
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            if (days > 0) {
                setTimeRemaining(`${days} วัน ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            } else if (hours > 0) {
                setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            } else {
                setTimeRemaining(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        
        return () => clearInterval(interval);
    }, [auctionEnd]);

    return <span>{timeRemaining}</span>;
};

const MyBids = () => {
    const { isAuthenticated } = useAuth();
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active');
    const [isConnected, setIsConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const socketRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    useEffect(() => {
        if (isAuthenticated()) {
            fetchBids();
            connectWebSocket();
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [isAuthenticated]);

    // Join auction rooms when bids change
    useEffect(() => {
        if (socketRef.current && socketRef.current.connected && bids.length > 0) {
            console.log('🔌 Joining auction rooms for', bids.length, 'products');
            bids.forEach(bid => {
                if (bid.product_id) {
                    socketRef.current.emit('joinAuction', bid.product_id);
                }
            });
        }
    }, [bids]);

    const fetchBids = async (isManualRefresh = false) => {
        try {
            if (isManualRefresh) {
                setIsRefreshing(true);
            } else {
                setLoading(true);
            }
            
            const response = await apiService.bids.getUserBids();
            const bidsData = response.data.data || [];
            
            // Sort by auction end time (ending soon first)
            bidsData.sort((a, b) => {
                const endTimeA = new Date(a.auction_end_time);
                const endTimeB = new Date(b.auction_end_time);
                return endTimeA - endTimeB; // Ascending (closest first)
            });
            
            setBids(bidsData);
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Error fetching bids:', error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = () => {
        fetchBids(true);
    };

    const connectWebSocket = () => {
        try {
            // Import socket.io-client dynamically
            import('socket.io-client').then(({ io }) => {
                const socket = io('wss://api.pamoontoy.site', {
                    transports: ['websocket'],
                    upgrade: false
                });

                socketRef.current = socket;

                socket.on('connect', () => {
                    console.log('🔌 Connected to WebSocket for MyBids');
                    setIsConnected(true);
                });

                socket.on('disconnect', () => {
                    console.log('🔌 Disconnected from WebSocket');
                    setIsConnected(false);
                    // Auto-reconnect after 3 seconds
                    reconnectTimeoutRef.current = setTimeout(() => {
                        if (isAuthenticated()) {
                            connectWebSocket();
                        }
                    }, 3000);
                });

                socket.on('connect_error', (error) => {
                    console.error('❌ WebSocket connection error:', error);
                });

                // Listen for bid updates
                socket.on('bidUpdate', (data) => {
                    console.log('🔔 Bid update received:', data);
                    handleBidUpdate(data);
                });

                // Listen for new bid (for real-time status update)
                socket.on('newBid', (data) => {
                    console.log('🔔 New bid received:', data);
                    handleBidUpdate(data);
                });

                // Listen for auction end
                socket.on('auctionEnded', (data) => {
                    console.log('🔔 Auction ended:', data);
                    handleAuctionEnded(data);
                });

                // Join user-specific room
                const token = localStorage.getItem('token');
                if (token) {
                    socket.emit('joinUserRoom', { token });
                }

                // Join auction rooms for all user's bids
                bids.forEach(bid => {
                    if (bid.product_id) {
                        socket.emit('joinAuction', bid.product_id);
                    }
                });

            }).catch(error => {
                console.error('❌ Failed to load socket.io-client:', error);
            });
        } catch (error) {
            console.error('❌ WebSocket connection failed:', error);
        }
    };

    const handleBidUpdate = async (data) => {
        const productId = data.productId || data.product_id;
        const newPrice = data.newPrice || data.current_price || data.bidAmount;
        const userId = localStorage.getItem('userId');

        console.log('🔄 Updating bid:', { productId, newPrice, data });

        setBids(prevBids => {
            return prevBids.map(bid => {
                if (bid.product_id === productId) {
                    // Determine if user is still winning
                    const isWinning = data.isWinning !== undefined 
                        ? data.isWinning 
                        : data.userId && userId 
                            ? data.userId.toString() === userId.toString()
                            : bid.is_winning;

                    console.log('✅ Updated bid:', { 
                        productId, 
                        oldPrice: bid.current_price, 
                        newPrice, 
                        isWinning,
                        oldWinning: bid.is_winning 
                    });

                    return {
                        ...bid,
                        current_price: newPrice,
                        is_winning: isWinning
                    };
                }
                return bid;
            });
        });
        setLastUpdate(new Date());
    };

    const handleAuctionEnded = (data) => {
        setBids(prevBids => {
            return prevBids.map(bid => {
                if (bid.product_id === data.productId) {
                    return {
                        ...bid,
                        product_status: 'ended',
                        is_winning: data.isWinning
                    };
                }
                return bid;
            });
        });
    };

    const getTimeRemaining = (auctionEnd) => {
        if (!auctionEnd) return 'ไม่ระบุ';
        const now = new Date();
        const end = new Date(auctionEnd);
        const diff = end - now;
        
        if (diff <= 0) return 'สิ้นสุดแล้ว';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) return `${days} วัน ${hours} ชม.`;
        if (hours > 0) return `${hours} ชม. ${minutes} นาที`;
        return `${minutes} นาที`;
    };

    const getBidStatus = (bid) => {
        const now = new Date();
        const auctionEnd = new Date(bid.auction_end_time);
        
        if (bid.product_status === 'sold') {
            return bid.is_winning ? 'won' : 'lost';
        }
        
        if (auctionEnd <= now) {
            return bid.is_winning ? 'won' : 'lost';
        }
        
        // สำหรับรายการที่ยังไม่สิ้นสุด - รวมทั้งกำลังนำและถูกแซง
        return 'active';
    };

    const getStatusInfo = (status, bid) => {
        const now = new Date();
        const auctionEnd = new Date(bid.auction_end);
        const isEnded = auctionEnd <= now;
        
        if (isEnded) {
            if (bid.is_winning) {
                return { 
                    label: 'ประมูลสิ้นสุด', 
                    color: 'text-yellow-600 bg-yellow-50', 
                    icon: Trophy 
                };
            } else {
                return { 
                    label: 'แพ้', 
                    color: 'text-red-600 bg-red-50', 
                    icon: Package 
                };
            }
        } else {
            // รายการที่ยังไม่สิ้นสุด
            if (bid.is_winning) {
                return { 
                    label: 'กำลังนำ', 
                    color: 'text-green-600 bg-green-50', 
                    icon: TrendingUp 
                };
            } else {
                return { 
                    label: 'ถูกแซง', 
                    color: 'text-orange-600 bg-orange-50', 
                    icon: Clock 
                };
            }
        }
    };

    const filteredBids = bids.filter(bid => {
        const status = getBidStatus(bid);
        switch (activeTab) {
            case 'active':
                return status === 'active';
            case 'won':
                return status === 'won';
            case 'lost':
                return status === 'lost';
            default:
                return true;
        }
    });

    if (!isAuthenticated()) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">กรุณาเข้าสู่ระบบ</h1>
                    <p className="text-gray-600 mb-6">คุณต้องเข้าสู่ระบบเพื่อดูรายการประมูล</p>
                    <Link to="/login" className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-black transition-colors">
                        เข้าสู่ระบบ
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8 pb-24">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Link 
                        to="/" 
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        กลับหน้าหลัก
                    </Link>
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Gavel className="w-8 h-8 text-gray-900" />
                            รายการประมูลของฉัน
                        </h1>
                        <motion.button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            whileTap={{ scale: 0.95 }}
                            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                isRefreshing 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
                            }`}
                        >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? 'กำลังรีเฟรช...' : 'รีเฟรช'}
                        </motion.button>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-gray-600">ติดตามสถานะการประมูลของคุณ</p>
                        {lastUpdate && (
                            <p className="text-xs text-gray-400">
                                อัปเดตล่าสุด: {lastUpdate.toLocaleTimeString()}
                            </p>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-6">
                    <div className="flex flex-wrap gap-2 bg-gray-100 p-2 rounded-xl">
                        {[
                            { id: 'active', label: 'กำลังประมูล', count: bids.filter(bid => getBidStatus(bid) === 'active').length },
                            { id: 'won', label: 'ชนะประมูล', count: bids.filter(bid => getBidStatus(bid) === 'won').length },
                            { id: 'lost', label: 'แพ้', count: bids.filter(bid => getBidStatus(bid) === 'lost').length },
                            { id: 'all', label: 'ทั้งหมด', count: bids.length }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-gray-900 text-white shadow-lg'
                                        : 'text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {tab.label} ({tab.count})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-4 text-gray-600">กำลังโหลด...</p>
                    </div>
                ) : filteredBids.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                        <Gavel className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {activeTab === 'all' ? 'ยังไม่มีรายการประมูล' : 
                             activeTab === 'active' ? 'ไม่มีรายการที่กำลังประมูล' :
                             activeTab === 'won' ? 'ไม่มีรายการที่ประมูลสิ้นสุด' :
                             'ไม่มีรายการที่แพ้'}
                        </h3>
                        <p className="text-gray-600 mb-6">เริ่มประมูลสินค้าที่คุณสนใจได้เลย</p>
                        <Link 
                            to="/" 
                            className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-black transition-colors inline-block"
                        >
                            ดูสินค้า
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredBids.map((bid, index) => {
                            const status = getBidStatus(bid);
                            const statusInfo = getStatusInfo(status, bid);
                            const StatusIcon = statusInfo.icon;
                            const now = new Date();
                            const auctionEnd = new Date(bid.auction_end_time || bid.auction_end);
                            const isEnded = auctionEnd <= now || bid.product_status === 'ended' || bid.product_status === 'sold';

                            return (
                                <motion.div
                                    key={bid.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                                        isEnded && bid.is_winning 
                                            ? 'bg-gradient-to-br from-green-50 to-yellow-50 border-2 border-green-300' 
                                            : isEnded 
                                                ? 'opacity-50 bg-gray-50 border border-gray-200' 
                                                : 'bg-white border border-gray-200'
                                    }`}
                                >
                                    <div className="p-4">
                                        {isEnded && bid.is_winning && (
                                            <div className="mb-3 p-3 bg-green-100 border border-green-300 rounded-lg">
                                                <div className="flex items-center gap-2 text-green-800">
                                                    <Trophy className="w-5 h-5" />
                                                    <span className="font-semibold">🎉 ยินดีด้วย! คุณชนะการประมูล</span>
                                                </div>
                                                <p className="text-sm text-green-700 mt-1">กรุณาชำระเงินภายใน 3 วัน</p>
                                            </div>
                                        )}
                                        <div className="flex gap-4">
                                            {/* Product Image */}
                                            <div className="flex-shrink-0 relative">
                                                <img
                                                    src={bid.product_image || 'https://placehold.co/120x120/e5e7eb/9ca3af?text=No+Image'}
                                                    alt={bid.product_name}
                                                    className="w-24 h-24 object-cover rounded-lg"
                                                    onError={(e) => {
                                                        e.target.src = 'https://placehold.co/120x120/e5e7eb/9ca3af?text=No+Image';
                                                    }}
                                                    onLoad={() => {
                                                    }}
                                                />
                                                {/* Status Badge */}
                                                <div className={`absolute bottom-1 left-1 px-2 py-1 rounded text-xs font-semibold text-white ${
                                                    isEnded 
                                                        ? (bid.is_winning ? 'bg-yellow-600' : 'bg-gray-600') 
                                                        : (bid.is_winning ? 'bg-green-600' : 'bg-orange-600')
                                                }`}>
                                                    {isEnded 
                                                        ? (bid.is_winning ? 'สิ้นสุด' : 'แพ้') 
                                                        : statusInfo.label
                                                    }
                                                </div>
                                            </div>
                                            
                                            {/* Product Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className={`text-sm font-medium mb-2 line-clamp-2 ${
                                                    isEnded && bid.is_winning 
                                                        ? 'text-gray-900' 
                                                        : isEnded 
                                                            ? 'text-gray-500' 
                                                            : 'text-gray-900'
                                                }`}>
                                                    {bid.product_name}
                                                </h3>
                                                
                                                <div className="mb-3">
                                                    <motion.p 
                                                        key={bid.current_price}
                                                        initial={{ scale: 1.1, color: '#10b981' }}
                                                        animate={{ 
                                                            scale: 1, 
                                                            color: isEnded && bid.is_winning 
                                                                ? '#15803d' 
                                                                : isEnded 
                                                                    ? '#9ca3af' 
                                                                    : '#111827' 
                                                        }}
                                                        transition={{ duration: 0.5 }}
                                                        className={`text-lg font-bold ${
                                                            isEnded && bid.is_winning 
                                                                ? 'text-green-700' 
                                                                : isEnded 
                                                                    ? 'text-gray-400' 
                                                                    : ''
                                                        }`}
                                                    >
                                                        ฿{parseFloat(bid.current_price).toLocaleString()}
                                                    </motion.p>
                                                </div>
                                                
                                                <div className={`flex items-center gap-4 text-sm ${
                                                    isEnded ? 'text-gray-400' : 'text-gray-600'
                                                }`}>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {isEnded ? (
                                                            <span className="text-red-500 font-medium">สิ้นสุดแล้ว</span>
                                                        ) : (
                                                            <CountdownTimer auctionEnd={bid.auction_end_time} />
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <TrendingUp className="w-4 h-4" />
                                                        <span>{bid.bid_count || 0} ประมูล</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Action Button */}
                                            <div className="flex-shrink-0 flex flex-col gap-2">
                                                {isEnded && bid.is_winning ? (
                                                    <Link 
                                                        to={`/orders`}
                                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
                                                    >
                                                        <Trophy className="w-4 h-4" />
                                                        ชำระเงิน
                                                    </Link>
                                                ) : null}
                                                <Link 
                                                    to={`/product/${bid.product_id}`}
                                                    className={`text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                                                        isEnded ? 'bg-gray-400 hover:bg-gray-500' : 'bg-gray-900 hover:bg-black'
                                                    }`}
                                                >
                                                    ดูสินค้า
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBids;




