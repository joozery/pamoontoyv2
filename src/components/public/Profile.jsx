import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, Camera, Award, TrendingUp, ShoppingBag, Heart, Package, Star, Trophy, Zap, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import apiService from '@/services/api';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, isAuthenticated, updateUser } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [showAvatarUpload, setShowAvatarUpload] = useState(false);
    const [loading, setLoading] = useState(true);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalSpent: 0,
        wonAuctions: 0,
        favoritesCount: 0,
        activeBids: 0
    });
    const [recentActivities, setRecentActivities] = useState([]);
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        memberSince: '',
        level: '',
        points: 0,
        totalSpent: 0,
        successfulBids: 0
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '', // Use address from user
                memberSince: user.created_at ? new Date(user.created_at).toLocaleDateString('th-TH', { 
                    year: 'numeric', 
                    month: 'long' 
                }) : 'ไม่ระบุ',
                level: user.level || 'Bronze Member',
                points: user.total_spent || 0,
                totalSpent: user.total_spent || 0,
                successfulBids: user.won_auctions || 0
            });
            fetchUserStats();
        }
    }, [user]);

    const fetchUserStats = async () => {
        try {
            setLoading(true);
            
            // Fetch favorites
            const favoritesRes = await apiService.favorites.getAll();
            const favoritesCount = favoritesRes.data.data?.length || 0;

            // Fetch orders
            const ordersRes = await apiService.orders.getAll();
            const orders = ordersRes.data.data || [];
            const totalOrders = orders.length;
            const totalSpent = orders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);

            // Fetch active bids
            const bidsRes = await apiService.bids.getUserBids();
            const bids = bidsRes.data.data || [];
            
            // Count active bids (products still in auction)
            const now = new Date();
            const activeBids = bids.filter(bid => {
                if (!bid.auction_end_time) return false;
                return new Date(bid.auction_end_time) > now && bid.product_status === 'active';
            }).length;
            
            // Count won auctions (is_winning = true and auction ended or product sold)
            const wonAuctions = bids.filter(bid => {
                if (bid.is_winning) {
                    // If auction ended or product sold, count as won
                    if (bid.product_status === 'sold') return true;
                    if (bid.auction_end_time && new Date(bid.auction_end_time) <= now) return true;
                }
                return false;
            }).length;

            setStats({
                totalOrders,
                totalSpent,
                wonAuctions,
                favoritesCount,
                activeBids
            });

            // Build recent activities from orders and bids
            const activities = [];
            
            // Add recent orders
            orders.slice(0, 2).forEach(order => {
                const timeAgo = getTimeAgo(order.created_at);
                activities.push({
                    id: `order-${order.id}`,
                    icon: Package,
                    title: order.status === 'delivered' ? 'ได้รับสินค้า' : 'สั่งซื้อสินค้า',
                    desc: order.product_name,
                    time: timeAgo,
                    color: 'text-green-500'
                });
            });

            // Add recent winning bids
            const wonBids = bids.filter(bid => {
                if (bid.is_winning) {
                    if (bid.product_status === 'sold') return true;
                    if (bid.auction_end_time && new Date(bid.auction_end_time) <= new Date()) return true;
                }
                return false;
            });
            
            wonBids.slice(0, 2).forEach(bid => {
                const timeAgo = getTimeAgo(bid.bid_time);
                activities.push({
                    id: `bid-${bid.id}`,
                    icon: Trophy,
                    title: 'ชนะการประมูล',
                    desc: bid.product_name,
                    time: timeAgo,
                    color: 'text-yellow-500'
                });
            });

            setRecentActivities(activities.slice(0, 4));
        } catch (error) {
            console.error('Error fetching user stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTimeAgo = (date) => {
        if (!date) return 'ไม่ทราบ';
        const diff = Date.now() - new Date(date).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (hours < 1) return 'เมื่อสักครู่';
        if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
        return `${days} วันที่แล้ว`;
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast({
                    title: "ไฟล์ใหญ่เกินไป",
                    description: "กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB",
                    variant: "destructive",
                });
                return;
            }
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleUploadAvatar = async () => {
        if (!avatarFile) return;

        try {
            setUploadingAvatar(true);

            // Upload to Cloudinary
            const formData = new FormData();
            formData.append('images', avatarFile);

            const uploadRes = await apiService.upload.images(formData);
            const avatarUrl = uploadRes.data.urls[0];

            // Update user profile with new avatar_url  
            const response = await fetch('https://api.pamoontoy.site/api/auth/update-avatar', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ avatar_url: avatarUrl })
            });

            const result = await response.json();
            if (!result.success) throw new Error('Failed to update avatar');

            // Update local user state
            if (updateUser) {
                updateUser({ ...user, avatar_url: avatarUrl });
            }

            toast({
                title: "อัพเดทรูปโปรไฟล์สำเร็จ",
                description: "รูปโปรไฟล์ของคุณได้รับการอัพเดทแล้ว",
            });

            setShowAvatarUpload(false);
            setAvatarFile(null);
            setAvatarPreview(null);
        } catch (error) {
            console.error('Error uploading avatar:', error);
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถอัพเดทรูปโปรไฟล์ได้",
                variant: "destructive",
            });
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSave = async () => {
        try {
            // TODO: Implement API call to update user profile
            toast({
                title: "บันทึกสำเร็จ",
                description: "ข้อมูลโปรไฟล์ได้รับการอัพเดทแล้ว",
            });
            setIsEditing(false);
        } catch (error) {
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถบันทึกข้อมูลได้",
                variant: "destructive",
            });
        }
    };

    // Calculate badges based on real stats
    const badges = [
        { 
            id: 1, 
            icon: Trophy, 
            name: 'ผู้ชนะ 10 ครั้ง', 
            color: 'from-yellow-500 to-yellow-600', 
            earned: stats.wonAuctions >= 10 
        },
        { 
            id: 2, 
            icon: Package, 
            name: 'ซื้อ 5 ครั้ง', 
            color: 'from-blue-500 to-blue-600', 
            earned: stats.totalOrders >= 5 
        },
        { 
            id: 3, 
            icon: Heart, 
            name: 'สะสม 10 รายการโปรด', 
            color: 'from-red-500 to-red-600', 
            earned: stats.favoritesCount >= 10 
        },
        { 
            id: 4, 
            icon: Award, 
            name: 'ใช้จ่าย 10,000 บาท', 
            color: 'from-purple-500 to-purple-600', 
            earned: stats.totalSpent >= 10000 
        }
    ];

    // Redirect if not authenticated
    if (!isAuthenticated()) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">กรุณาเข้าสู่ระบบ</h1>
                    <p className="text-gray-600 mb-6">คุณต้องเข้าสู่ระบบเพื่อดูโปรไฟล์</p>
                    <a href="/login" className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-black transition-colors">
                        เข้าสู่ระบบ
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-6 md:py-12 pb-24 md:pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Cover Photo & Profile Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 border border-gray-200"
                >
                    {/* Cover Photo */}
                    <div className="h-32 md:h-48 bg-gradient-to-r from-gray-900 via-gray-800 to-black relative">
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
                    </div>

                    {/* Profile Info */}
                    <div className="px-4 md:px-8 pb-6 md:pb-8 relative">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-12 md:-mt-16">
                            {/* Avatar & Name */}
                            <div className="flex items-center gap-8 md:gap-12 relative z-10">
                                <div className="relative group flex-shrink-0">
                                    <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl md:rounded-3xl p-1 shadow-2xl">
                                        <div className="w-full h-full bg-white rounded-2xl md:rounded-3xl flex items-center justify-center border-2 border-gray-100 overflow-hidden">
                                            {user?.avatar_url ? (
                                                <img 
                                                    src={user.avatar_url} 
                                                    alt="Profile" 
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <User 
                                                className="w-12 h-12 md:w-16 md:h-16 text-gray-900" 
                                                style={{ display: user?.avatar_url ? 'none' : 'block' }}
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setShowAvatarUpload(true)}
                                        className="absolute bottom-0 right-0 w-8 h-8 md:w-10 md:h-10 bg-gray-900 rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:bg-black transition-all z-20"
                                    >
                                        <Camera className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                    </button>
                                </div>

                                <div className="flex-1 min-w-0 pl-2 md:pl-4">
                                    <h1 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg truncate">
                                        {user?.name || 'ผู้ใช้งาน'}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-3">
                                        <div className="flex items-center space-x-1 bg-white text-gray-900 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs md:text-sm font-semibold shadow-md">
                                            <Award className="w-3 h-3 md:w-4 md:h-4" />
                                            <span>{profileData.level}</span>
                                        </div>
                                        <span className="text-xs md:text-sm text-gray-300 drop-shadow">• สมาชิกตั้งแต่ {profileData.memberSince}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-2 md:space-x-3 mt-4 md:mt-0">
                                {!isEditing ? (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center space-x-2 px-4 md:px-6 py-2 md:py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all text-sm md:text-base"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        <span>แก้ไขโปรไฟล์</span>
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleSave}
                                        className="flex items-center space-x-2 px-4 md:px-6 py-2 md:py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all text-sm md:text-base"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>บันทึก</span>
                                    </motion.button>
                                )}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-4 gap-2 md:gap-4 mt-6 md:mt-8">
                            <div className="text-center">
                                <div className="text-2xl md:text-3xl font-bold text-gray-900">
                                    {loading ? '...' : stats.wonAuctions}
                                </div>
                                <div className="text-xs md:text-sm text-gray-600 mt-1">ชนะประมูล</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl md:text-3xl font-bold text-gray-900">
                                    {loading ? '...' : stats.totalOrders}
                                </div>
                                <div className="text-xs md:text-sm text-gray-600 mt-1">คำสั่งซื้อ</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl md:text-3xl font-bold text-gray-900">
                                    {loading ? '...' : stats.favoritesCount}
                                </div>
                                <div className="text-xs md:text-sm text-gray-600 mt-1">รายการโปรด</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl md:text-3xl font-bold text-gray-900">
                                    {loading ? '...' : stats.activeBids}
                                </div>
                                <div className="text-xs md:text-sm text-gray-600 mt-1">กำลังประมูล</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Profile Details Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6"
                        >
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center">
                                <User className="w-5 h-5 md:w-6 md:h-6 mr-2 text-gray-900" />
                                ข้อมูลส่วนตัว
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                {/* Name */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center">
                                        <User className="w-4 h-4 mr-1.5 text-gray-600" />
                                        ชื่อผู้ใช้
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                            className="w-full px-4 py-2.5 text-sm md:text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                                            placeholder="กรอกชื่อของคุณ"
                                        />
                                    ) : (
                                        <p className="text-base md:text-lg font-medium text-gray-900 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200">{profileData.name || 'ไม่ระบุ'}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center">
                                        <Mail className="w-4 h-4 mr-1.5 text-gray-600" />
                                        อีเมล
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                            className="w-full px-4 py-2.5 text-sm md:text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                                            placeholder="your@email.com"
                                        />
                                    ) : (
                                        <p className="text-base md:text-lg font-medium text-gray-900 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200">{profileData.email}</p>
                                    )}
                                </div>

                                {/* Phone */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center">
                                        <Phone className="w-4 h-4 mr-1.5 text-gray-600" />
                                        เบอร์โทรศัพท์
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                            className="w-full px-4 py-2.5 text-sm md:text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                                            placeholder="08x-xxx-xxxx"
                                        />
                                    ) : (
                                        <p className="text-base md:text-lg font-medium text-gray-900 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200">{profileData.phone}</p>
                                    )}
                                </div>

                                {/* Address */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center">
                                        <MapPin className="w-4 h-4 mr-1.5 text-gray-600" />
                                        ที่อยู่
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            value={profileData.address}
                                            onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                            rows={2}
                                            className="w-full px-4 py-2.5 text-sm md:text-base border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
                                            placeholder="ที่อยู่ของคุณ"
                                        />
                                    ) : (
                                        <p className="text-base md:text-lg font-medium text-gray-900 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200">{profileData.address}</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Recent Activity */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6"
                        >
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center">
                                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 mr-2 text-gray-900" />
                                กิจกรรมล่าสุด
                            </h2>
                            <div className="space-y-3 md:space-y-4">
                                {loading ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto"></div>
                                        <p className="mt-2 text-sm">กำลังโหลด...</p>
                                    </div>
                                ) : recentActivities.length > 0 ? (
                                    recentActivities.map((activity, index) => {
                                        const Icon = activity.icon;
                                        return (
                                            <motion.div
                                                key={activity.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3 + index * 0.1 }}
                                                className="flex items-start space-x-3 md:space-x-4 p-3 md:p-4 rounded-xl hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                    <Icon className={`w-5 h-5 md:w-6 md:h-6 ${activity.color}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm md:text-base font-semibold text-gray-900">{activity.title}</p>
                                                    <p className="text-xs md:text-sm text-gray-600 mt-0.5">{activity.desc}</p>
                                                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                        <p className="text-sm">ยังไม่มีกิจกรรม</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Badges & Achievements */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6"
                        >
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center">
                                <Award className="w-5 h-5 md:w-6 md:h-6 mr-2 text-gray-900" />
                                ความสำเร็จ
                            </h2>
                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                {badges.map((badge, index) => {
                                    const Icon = badge.icon;
                                    return (
                                        <motion.div
                                            key={badge.id}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.4 + index * 0.1 }}
                                            className={`relative group ${badge.earned ? '' : 'opacity-40'}`}
                                        >
                                            <div className={`aspect-square rounded-2xl bg-gradient-to-br ${badge.color} p-4 flex flex-col items-center justify-center text-white shadow-lg ${badge.earned ? 'hover:scale-105' : ''} transition-transform cursor-pointer`}>
                                                <Icon className="w-8 h-8 md:w-10 md:h-10 mb-2" />
                                                <p className="text-xs md:text-sm font-semibold text-center leading-tight">{badge.name}</p>
                                            </div>
                                            {badge.earned && (
                                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-black rounded-full flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* Level Progress */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-lg p-4 md:p-6 text-white border border-gray-700"
                        >
                            <h3 className="text-lg md:text-xl font-bold mb-4">ความคืบหน้าระดับ</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>{profileData.level}</span>
                                        <span>{loading ? '...' : `${stats.totalSpent.toLocaleString()} บาท`}</span>
                                    </div>
                                    <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/20">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: loading ? '0%' : `${Math.min((stats.totalSpent / 50000) * 100, 100)}%` }}
                                            transition={{ delay: 0.5, duration: 1 }}
                                            className="h-full bg-white rounded-full"
                                        />
                                    </div>
                                    <p className="text-xs mt-2 text-gray-300">
                                        {loading ? 'กำลังโหลด...' : 
                                            stats.totalSpent >= 50000 ? 
                                            'คุณถึงระดับสูงสุดแล้ว!' : 
                                            `อีก ${(50000 - stats.totalSpent).toLocaleString()} บาทเพื่อเป็น Platinum Member`
                                        }
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Quick Stats Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6"
                        >
                            <h3 className="text-lg font-bold text-gray-900 mb-4">สถิติรวม</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="flex items-center space-x-3">
                                        <ShoppingBag className="w-5 h-5 text-gray-900" />
                                        <span className="text-sm font-medium text-gray-700">ยอดใช้จ่ายทั้งหมด</span>
                                    </div>
                                    <span className="text-base font-bold text-gray-900">
                                        {loading ? '...' : `฿${stats.totalSpent.toLocaleString()}`}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="flex items-center space-x-3">
                                        <Trophy className="w-5 h-5 text-gray-900" />
                                        <span className="text-sm font-medium text-gray-700">ชนะการประมูล</span>
                                    </div>
                                    <span className="text-base font-bold text-gray-900">
                                        {loading ? '...' : `${stats.wonAuctions} ครั้ง`}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="flex items-center space-x-3">
                                        <Package className="w-5 h-5 text-gray-900" />
                                        <span className="text-sm font-medium text-gray-700">คำสั่งซื้อทั้งหมด</span>
                                    </div>
                                    <span className="text-base font-bold text-gray-900">
                                        {loading ? '...' : `${stats.totalOrders} รายการ`}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Avatar Upload Modal */}
            <AnimatePresence>
                {showAvatarUpload && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => {
                            if (!uploadingAvatar) {
                                setShowAvatarUpload(false);
                                setAvatarFile(null);
                                setAvatarPreview(null);
                            }
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-900">อัพเดทรูปโปรไฟล์</h3>
                                <button
                                    onClick={() => {
                                        if (!uploadingAvatar) {
                                            setShowAvatarUpload(false);
                                            setAvatarFile(null);
                                            setAvatarPreview(null);
                                        }
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    disabled={uploadingAvatar}
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Preview */}
                                <div className="flex justify-center">
                                    <div className="relative w-32 h-32">
                                        <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-gray-200">
                                            {avatarPreview ? (
                                                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : user?.avatar_url ? (
                                                <img src={user.avatar_url} alt="Current" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-16 h-16 text-gray-400" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* File Input */}
                                <div>
                                    <label className="block">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            className="hidden"
                                            disabled={uploadingAvatar}
                                        />
                                        <div className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors text-sm font-medium">
                                            <Camera className="w-4 h-4" />
                                            <span>เลือกรูปภาพ</span>
                                        </div>
                                    </label>
                                    <p className="text-xs text-gray-500 mt-2 text-center">
                                        รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB
                                    </p>
                                </div>

                                {/* Upload Button */}
                                {avatarFile && (
                                    <button
                                        onClick={handleUploadAvatar}
                                        disabled={uploadingAvatar}
                                        className="w-full px-4 py-3 bg-gray-900 hover:bg-black text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {uploadingAvatar ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>กำลังอัพโหลด...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                <span>บันทึกรูปโปรไฟล์</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;

