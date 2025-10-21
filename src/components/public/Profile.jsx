import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, Camera, Award, TrendingUp, ShoppingBag, Heart, Package, Star, Trophy, Zap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
    const [userName, setUserName] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [showAvatarUpload, setShowAvatarUpload] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        email: 'user@pamoon.com',
        phone: '081-234-5678',
        address: 'กรุงเทพมหานคร, ประเทศไทย',
        memberSince: 'ตุลาคม 2024',
        level: 'Gold Member',
        points: 2450,
        totalSpent: 45800,
        successfulBids: 12
    });

    useEffect(() => {
        const storedUserName = localStorage.getItem('userName');
        if (storedUserName) {
            setUserName(storedUserName);
            setProfileData(prev => ({ ...prev, name: storedUserName }));
        } else {
            // Set default name if not in localStorage
            setUserName('ผู้ใช้งาน');
            setProfileData(prev => ({ ...prev, name: 'ผู้ใช้งาน' }));
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('userName', profileData.name);
        setUserName(profileData.name);
        setIsEditing(false);
    };

    const activities = [
        { id: 1, icon: Trophy, title: 'ชนะการประมูล', desc: 'ฟิกเกอร์ Iron Man Mark V', time: '2 ชั่วโมงที่แล้ว', color: 'text-yellow-500' },
        { id: 2, icon: Heart, title: 'เพิ่มรายการโปรด', desc: 'โมเดล Batman Limited Edition', time: '5 ชั่วโมงที่แล้ว', color: 'text-red-500' },
        { id: 3, icon: Package, title: 'ได้รับสินค้า', desc: 'ชุด Lego Star Wars', time: '1 วันที่แล้ว', color: 'text-green-500' },
        { id: 4, icon: Star, title: 'เลื่อนระดับ', desc: 'คุณได้เป็น Gold Member แล้ว!', time: '3 วันที่แล้ว', color: 'text-purple-500' }
    ];

    const badges = [
        { id: 1, icon: Trophy, name: 'ผู้ชนะ 10 ครั้ง', color: 'from-gray-900 to-gray-700', earned: true },
        { id: 2, icon: Zap, name: 'ประมูลเร็ว', color: 'from-gray-800 to-gray-600', earned: true },
        { id: 3, icon: Star, name: 'ผู้รีวิวชั้นนำ', color: 'from-gray-700 to-gray-500', earned: true },
        { id: 4, icon: Award, name: 'สะสม 1000 แต้ม', color: 'from-gray-400 to-gray-300', earned: false }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-white py-6 md:py-12 pb-24 md:pb-12">
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
                                        <div className="w-full h-full bg-white rounded-2xl md:rounded-3xl flex items-center justify-center border-2 border-gray-100">
                                            <User className="w-12 h-12 md:w-16 md:h-16 text-gray-900" />
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
                                        {userName || 'ผู้ใช้งาน'}
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
                                    {profileData.successfulBids}
                                </div>
                                <div className="text-xs md:text-sm text-gray-600 mt-1">ชนะประมูล</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl md:text-3xl font-bold text-gray-900">
                                    {profileData.points}
                                </div>
                                <div className="text-xs md:text-sm text-gray-600 mt-1">แต้มสะสม</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl md:text-3xl font-bold text-gray-900">
                                    5
                                </div>
                                <div className="text-xs md:text-sm text-gray-600 mt-1">รายการโปรด</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl md:text-3xl font-bold text-gray-900">
                                    8
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
                                {activities.map((activity, index) => {
                                    const Icon = activity.icon;
                                    return (
                                        <motion.div
                                            key={activity.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + index * 0.1 }}
                                            className="flex items-start space-x-3 md:space-x-4 p-3 md:p-4 rounded-xl hover:bg-gray-50 transition-colors"
                                        >
                                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${activity.color === 'text-yellow-500' ? 'from-yellow-100 to-orange-100' : activity.color === 'text-red-500' ? 'from-red-100 to-pink-100' : activity.color === 'text-green-500' ? 'from-green-100 to-emerald-100' : 'from-purple-100 to-pink-100'} flex items-center justify-center flex-shrink-0`}>
                                                <Icon className={`w-5 h-5 md:w-6 md:h-6 ${activity.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm md:text-base font-semibold text-gray-900">{activity.title}</p>
                                                <p className="text-xs md:text-sm text-gray-600 mt-0.5">{activity.desc}</p>
                                                <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
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
                                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
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
                                        <span>Gold Member</span>
                                        <span>2,450 / 5,000 แต้ม</span>
                                    </div>
                                    <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/20">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: '49%' }}
                                            transition={{ delay: 0.5, duration: 1 }}
                                            className="h-full bg-white rounded-full"
                                        />
                                    </div>
                                    <p className="text-xs mt-2 text-gray-300">อีก 2,550 แต้มเพื่อเป็น Platinum Member</p>
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
                                    <span className="text-base font-bold text-gray-900">฿{profileData.totalSpent.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="flex items-center space-x-3">
                                        <Trophy className="w-5 h-5 text-gray-900" />
                                        <span className="text-sm font-medium text-gray-700">ชนะการประมูล</span>
                                    </div>
                                    <span className="text-base font-bold text-gray-900">{profileData.successfulBids} ครั้ง</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                                    <div className="flex items-center space-x-3">
                                        <Heart className="w-5 h-5 text-gray-900" />
                                        <span className="text-sm font-medium text-gray-700">อัตราการชนะ</span>
                                    </div>
                                    <span className="text-base font-bold text-gray-900">75%</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

