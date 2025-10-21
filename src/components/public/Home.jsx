
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { Search, Bell, CheckCircle, ShoppingBag, Heart, User, LogOut, Package, Baby, Users, CreditCard, Plane, Gem, BookOpen, Gamepad2, Gift, Clock, Car, Ticket, Armchair, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';
import SplitText from '../SplitText';
import LiquidEther from '@/components/LiquidEther';
import pamoonLogo from '@/assets/pamoontoy.png';

const CountdownTimer = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endTime) - new Date();
      
      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      return 'สิ้นสุดแล้ว';
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="flex items-center space-x-1 text-red-600 bg-red-50 px-2 py-1 rounded-lg">
      <Clock className="w-3 h-3" />
      <span className="text-xs font-semibold">{timeLeft}</span>
    </div>
  );
};

const ProductCard = ({ product, isHorizontalScroll = false }) => {
  const handleActionClick = (feature) => {
    toast({
      title: `🚧 ${feature} ยังไม่เปิดใช้งาน`,
      description: "ฟีเจอร์นี้ยังไม่พร้อมใช้งาน แต่คุณสามารถขอให้สร้างได้ในพรอมต์ถัดไป! 🚀",
    });
  };

  return (
    <div className={`flex-shrink-0 bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200/80 hover:shadow-md transition-shadow ${isHorizontalScroll ? 'w-36' : 'w-full'}`}>
      <div className="relative">
        <img
          alt={product.name}
          className="h-32 w-full object-cover"
         src="https://images.unsplash.com/photo-1559223669-e0065fa7f142" />
        <button 
          onClick={() => handleActionClick('ถูกใจ')}
          className="absolute top-2 right-2 bg-black/30 text-white p-1.5 rounded-full backdrop-blur-sm hover:bg-black/50 transition-colors"
        >
          <Heart className="w-4 h-4" />
        </button>
      </div>
      <div className="p-3">
        <p className="text-gray-700 text-sm truncate font-medium">{product.name}</p>
        <p className="font-bold text-lg mt-1 text-gray-900">฿{product.price.toLocaleString()}</p>
        {product.endTime && (
          <div className="mt-2">
            <CountdownTimer endTime={product.endTime} />
          </div>
        )}
      </div>
    </div>
  );
};

const Home = () => {
    const [viewHistory, setViewHistory] = useState([]);
    const [recommended, setRecommended] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        // Check if user is logged in
        const userAuth = localStorage.getItem('userAuth');
        const storedUserName = localStorage.getItem('userName');
        if (userAuth === 'true') {
            setIsLoggedIn(true);
            setUserName(storedUserName || 'User');
        }
        
        // Generate end times for countdown
        const now = new Date();
        const getRandomEndTime = (hoursToAdd) => {
            const endTime = new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
            return endTime.toISOString();
        };
        
        // Mock data with countdown timers
        setViewHistory([
            { id: 1, name: 'ชุดฟิกเกอร์ของเล่น', price: 8519, endTime: getRandomEndTime(2) },
            { id: 2, name: 'กล่องของสะสม Minecraft', price: 1, endTime: getRandomEndTime(5) },
            { id: 3, name: 'ของเล่น Toy Story', price: 11561, endTime: getRandomEndTime(1) },
            { id: 4, name: 'การ์ดเกมส์หายาก', price: 8110, endTime: getRandomEndTime(3) },
            { id: 5, name: 'โมเดลประกอบ', price: 2500, endTime: getRandomEndTime(6) },
        ]);
        setRecommended([
            { id: 101, name: 'ฟิกเกอร์ Stormtrooper และอุปกรณ์', price: 100, endTime: getRandomEndTime(4) },
            { id: 102, name: 'ชุดใหญ่ Star Wars Micro Machines', price: 7750, endTime: getRandomEndTime(8) },
            { id: 103, name: 'รวมฟิกเกอร์ STAR WARS', price: 3000, endTime: getRandomEndTime(2.5) },
            { id: 104, name: 'หุ่น R2-D2', price: 1200, endTime: getRandomEndTime(7) },
            { id: 105, name: 'โมเดล Predator', price: 4500, endTime: getRandomEndTime(1.5) },
            { id: 106, name: 'ฟิกเกอร์ Iron Man Mark V', price: 6800, endTime: getRandomEndTime(3.5) },
            { id: 107, name: 'ฟิกเกอร์ Spider-Man', price: 5200, endTime: getRandomEndTime(5) },
            { id: 108, name: 'โมเดล Batman', price: 4800, endTime: getRandomEndTime(2) },
            { id: 109, name: 'ของสะสม Transformers', price: 9500, endTime: getRandomEndTime(6) },
            { id: 110, name: 'ชุด Lego Star Wars', price: 12000, endTime: getRandomEndTime(4) },
        ]);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showUserMenu && !event.target.closest('.relative')) {
                setShowUserMenu(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showUserMenu]);

    const handleActionClick = (feature) => {
      toast({
        title: `🚧 ${feature} ยังไม่เปิดใช้งาน`,
        description: "ฟีเจอร์นี้ยังไม่พร้อมใช้งาน แต่คุณสามารถขอให้สร้างได้ในพรอมต์ถัดไป! 🚀",
      });
    };

    const handleLogout = () => {
      localStorage.removeItem('userAuth');
      localStorage.removeItem('userName');
      setIsLoggedIn(false);
      setUserName('');
      setShowUserMenu(false);
      toast({
        title: "ออกจากระบบสำเร็จ",
        description: "แล้วพบกันใหม่! 👋",
      });
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans pb-24 md:pb-0">
            {/* Desktop Header */}
            <header className="hidden md:block sticky top-0 z-40 w-full bg-gradient-to-r from-black via-gray-900 to-black backdrop-blur-xl border-b border-gray-800/50 shadow-lg">
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
                    <button className="relative p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all group">
                      <ShoppingBag className="h-5 w-5" />
                      <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full scale-0 group-hover:scale-100 transition-transform">3</span>
                    </button>
                    <button className="relative p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all group">
                      <Bell className="h-5 w-5" />
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">9</span>
                    </button>
                    
                    {/* User Menu */}
                    {isLoggedIn ? (
                      <div className="relative">
                        <button 
                          onClick={() => setShowUserMenu(!showUserMenu)}
                          className="flex items-center space-x-2 text-sm font-medium text-black bg-white rounded-full pl-2 pr-4 py-2 hover:bg-gray-200 hover:shadow-lg hover:scale-105 transition-all"
                        >
                          <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold">
                            {userName.charAt(0).toUpperCase()}
                          </div>
                          <span>{userName}</span>
                        </button>
                        
                        {showUserMenu && (
                          <div className="absolute right-0 mt-3 w-56 bg-gray-900 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700 overflow-hidden z-50">
                            <div className="bg-white px-4 py-4 text-black">
                              <p className="text-sm font-bold">{userName}</p>
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
              </div>
            </header>
            
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
                          className="group relative inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-full overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                          <span className="relative z-10">วิธีการประมูล</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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

            {/* Categories Slider - Desktop */}
            <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">หมวดหมู่สินค้า</h2>
                    <Link to="/" className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                        ดูทั้งหมด →
                    </Link>
                </div>
                <div className="relative">
                    <div className="flex overflow-x-auto gap-6 pb-4 hide-scrollbar snap-x snap-mandatory scroll-smooth">
                        {[
                            { id: 1, name: 'ของเล่น', icon: Baby, color: 'from-purple-400 to-purple-600' },
                            { id: 2, name: 'ฟิกเกอร์', icon: Users, color: 'from-purple-500 to-purple-700' },
                            { id: 3, name: 'การ์ดเกม', icon: CreditCard, color: 'from-violet-400 to-violet-600' },
                            { id: 4, name: 'โมเดล', icon: Plane, color: 'from-violet-500 to-violet-700' },
                            { id: 5, name: 'ของสะสม', icon: Gem, color: 'from-fuchsia-400 to-fuchsia-600' },
                            { id: 6, name: 'หนังสือ', icon: BookOpen, color: 'from-fuchsia-500 to-fuchsia-700' },
                            { id: 7, name: 'เครื่องเล่น', icon: Gamepad2, color: 'from-pink-400 to-pink-600' },
                            { id: 8, name: 'อื่นๆ', icon: Gift, color: 'from-pink-500 to-pink-700' },
                        ].map((category) => {
                            const IconComponent = category.icon;
                            return (
                                <Link
                                    key={category.id}
                                    to="/"
                                    className="group flex-shrink-0 snap-start"
                                >
                                    <div className="flex flex-col items-center space-y-3 w-32">
                                        <div className={`w-24 h-24 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}>
                                            <IconComponent className="w-10 h-10 text-white" strokeWidth={1.5} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-900 text-center group-hover:text-purple-600 transition-colors">
                                            {category.name}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Categories Slider - Mobile */}
            <div className="md:hidden px-3 pt-4 pb-6 bg-white">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">หมวดหมู่</h2>
                    <Link to="/" className="text-purple-600 font-medium text-xs">
                        ทั้งหมด →
                    </Link>
                </div>
                <div className="flex overflow-x-auto gap-4 pb-2 hide-scrollbar snap-x snap-mandatory scroll-smooth">
                    {[
                        { id: 1, name: 'ของเล่น', icon: Baby, color: 'from-purple-400 to-purple-600' },
                        { id: 2, name: 'ฟิกเกอร์', icon: Users, color: 'from-purple-500 to-purple-700' },
                        { id: 3, name: 'การ์ดเกม', icon: CreditCard, color: 'from-violet-400 to-violet-600' },
                        { id: 4, name: 'โมเดล', icon: Plane, color: 'from-violet-500 to-violet-700' },
                        { id: 5, name: 'ของสะสม', icon: Gem, color: 'from-fuchsia-400 to-fuchsia-600' },
                        { id: 6, name: 'หนังสือ', icon: BookOpen, color: 'from-fuchsia-500 to-fuchsia-700' },
                        { id: 7, name: 'เครื่องเล่น', icon: Gamepad2, color: 'from-pink-400 to-pink-600' },
                        { id: 8, name: 'อื่นๆ', icon: Gift, color: 'from-pink-500 to-pink-700' },
                    ].map((category) => {
                        const IconComponent = category.icon;
                        return (
                            <Link
                                key={category.id}
                                to="/"
                                className="flex-shrink-0 snap-start"
                            >
                                <div className="flex flex-col items-center space-y-2 w-20">
                                    <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center shadow-md active:scale-95 transition-transform`}>
                                        <IconComponent className="w-8 h-8 text-white" strokeWidth={1.5} />
                                    </div>
                                    <span className="text-xs font-medium text-gray-900 text-center">
                                        {category.name}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            <main className="p-3 md:p-0">
                <div className="md:hidden bg-green-200 text-green-800 p-4 rounded-lg flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <span className="text-3xl font-bold mr-2">1,000 บาท</span>
                        <span className="font-semibold">เทียบเท่า</span>
                    </div>
                    <p className="text-xs text-right">※เงื่อนไขการใช้งานและขีดจำกัดอาจแตกต่างกันไป</p>
                </div>
                
                {/* Viewing History - Horizontal Scroll */}
                <section className="mb-6 md:hidden">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="font-bold text-sm">ประวัติการเข้าชม</h2>
                        <button onClick={() => handleActionClick('ดูเพิ่มเติม')} className="text-blue-600 text-xs font-semibold">ดูเพิ่มเติม &gt;</button>
                    </div>
                    <div className="flex space-x-3 overflow-x-auto pb-2 -mx-3 px-3 hide-scrollbar">
                        {viewHistory.map(product => (
                            <ProductCard key={product.id} product={product} isHorizontalScroll={true} />
                        ))}
                    </div>
                </section>

                {/* Recommended For You - Grid */}
                <section className="md:hidden">
                    <h2 className="font-bold text-sm mb-2">สินค้าแนะนำสำหรับคุณ</h2>
                    <div className="grid grid-cols-3 gap-3">
                        {recommended.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </section>
                 {/* Original Desktop Product Grid */}
                <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">สินค้าประมูล</h2>
                        <p className="text-gray-600 text-sm mt-1">ร่วมประมูลสินค้าคุณภาพในราคาพิเศษ</p>
                    </div>
                    <div className="grid grid-cols-5 gap-4">
                        {[...viewHistory, ...recommended].slice(0, 10).map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </main>

            {/* Popular Products Section - Desktop */}
            <div className="hidden md:block bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">สินค้ายอดนิยมในปัจจุบัน</h2>
                        <p className="text-sm text-gray-500">ปรับปรุงล่าสุด 20/10 20:00 น.</p>
                    </div>
                    
                    {/* Tab Navigation */}
                    <div className="flex space-x-2 mb-6 border-b border-gray-200">
                        {[
                            { title: "รถจิ๋ว", icon: Car },
                            { title: "บัตรเข้าชมสวนสนุกและสวนสนุกอิ่มปาร์ค", icon: Ticket },
                            { title: "เฟอร์นิเจอร์ในรถ", icon: Armchair },
                            { title: "อีซีฮุยอนเทล", icon: Cpu }
                        ].map((tab, idx) => {
                            const IconComponent = tab.icon;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => setActiveTab(idx)}
                                    className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all ${
                                        activeTab === idx
                                            ? 'text-blue-600 border-b-2 border-blue-600'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <IconComponent className="w-4 h-4" />
                                    <span>{tab.title}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Content */}
                    <div className="grid grid-cols-3 gap-6">
                        {(() => {
                            const categories = [
                                {
                                    products: [
                                        { rank: 1, name: "ไมเดสทราอนิต้า Nismo Nissan Skyline BNR3...", price: "3,100" },
                                        { rank: 2, name: "exoto 1/18 Tyrrell P3 4 Ronnie Peterson", price: "1,000" },
                                        { rank: 3, name: "80. รถโมเดล Nissan Skyline 2000 GT-R สี...", price: "2,800" }
                                    ]
                                },
                                {
                                    products: [
                                        { rank: 1, name: "ทดมปตร์ 1 วันสำหรับผู้ใต้ อกูน Oriental Land T...", price: "9,550" },
                                        { rank: 2, name: "งานกิเดทร์ [ตำเรียดเดดบียบ สมอรี้ไม่รับการแนบ...", price: "25,000" },
                                        { rank: 3, name: "[JAL-sponsored Private Night] ปีครุสำหรับ...", price: "25,000" }
                                    ]
                                },
                                {
                                    products: [
                                        { rank: 1, name: "โต๊ะเสีย Karin ไม่มือแช่งสายใใม่บริส สายอม ทาง...", price: "1,000" },
                                        { rank: 2, name: "★ผู้ทันตศึกญิ้งเดดซือยน Shows ปาง...", price: "1,000" },
                                        { rank: 3, name: "○ขายเลึกใ○073 [อันตตี้ยอมรักบการรถบั่นค่าโตยต...", price: "1,000" }
                                    ]
                                },
                                {
                                    products: [
                                        { rank: 1, name: "ชิพัย Intel Core i5-950 3.00Ghz", price: "4,210" },
                                        { rank: 2, name: "Intel Core i7-9700 Tray Edition รุ่น 9 / LG...", price: "11" },
                                        { rank: 3, name: "รุ่นต่อสากกับ: T-09310 / Intel / CPU / Core...", price: "5,500" }
                                    ]
                                }
                            ];
                            
                            const currentProducts = categories[activeTab].products;
                            
                            return currentProducts.map((product) => (
                                <div key={product.rank} className="flex items-start space-x-3 group cursor-pointer">
                                    <div className={`flex-shrink-0 w-10 h-10 rounded flex items-center justify-center font-bold text-lg ${
                                        product.rank === 1 ? 'bg-yellow-400 text-white' :
                                        product.rank === 2 ? 'bg-gray-300 text-gray-700' :
                                        'bg-orange-400 text-white'
                                    }`}>
                                        {product.rank}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="bg-gray-50 rounded-lg p-4 group-hover:shadow-md transition-shadow border border-gray-200">
                                            <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 overflow-hidden">
                                                <img 
                                                    src="https://images.unsplash.com/photo-1559223669-e0065fa7f142" 
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <p className="text-sm text-gray-700 line-clamp-2 mb-2 min-h-[40px]">
                                                {product.name}
                                            </p>
                                            <p className="text-xs text-gray-500 mb-2">กระแปียฉุบิน</p>
                                            <p className="text-red-600 font-bold text-lg">
                                                {product.price} <span className="text-sm">เชน</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                </div>
            </div>

            {/* Popular Products Section - Mobile */}
            <div className="md:hidden bg-white py-8">
                <div className="px-4">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">สินค้ายอดนิยม</h2>
                        <p className="text-xs text-gray-500">20/10 20:00</p>
                    </div>
                    
                    {/* Tab Navigation Mobile */}
                    <div className="flex overflow-x-auto space-x-2 mb-6 pb-2 hide-scrollbar">
                        {[
                            { title: "รถจิ๋ว", icon: Car },
                            { title: "บัตรสวนสนุก", icon: Ticket },
                            { title: "เฟอร์นิเจอร์", icon: Armchair },
                            { title: "อีซีฮุย", icon: Cpu }
                        ].map((tab, idx) => {
                            const IconComponent = tab.icon;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => setActiveTab(idx)}
                                    className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-medium whitespace-nowrap rounded-full transition-all ${
                                        activeTab === idx
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-600'
                                    }`}
                                >
                                    <IconComponent className="w-3.5 h-3.5" />
                                    <span>{tab.title}</span>
                                </button>
                            );
                        })}
                    </div>
                    
                    {/* Tab Content */}
                    <div className="space-y-3">
                        {(() => {
                            const categories = [
                                [
                                    { rank: 1, name: "ไมเดสทราอนิต้า Nismo Nissan Skyline BNR3...", price: "3,100" },
                                    { rank: 2, name: "exoto 1/18 Tyrrell P3 4 Ronnie Peterson", price: "1,000" },
                                    { rank: 3, name: "80. รถโมเดล Nissan Skyline 2000 GT-R", price: "2,800" }
                                ],
                                [
                                    { rank: 1, name: "ทดมปตร์ 1 วันสำหรับผู้ใต้", price: "9,550" },
                                    { rank: 2, name: "งานกิเดทร์ [ตำเรียดเดดบียบ", price: "25,000" },
                                    { rank: 3, name: "[JAL-sponsored Private Night]", price: "25,000" }
                                ],
                                [
                                    { rank: 1, name: "โต๊ะเสีย Karin ไม่มือแช่ง", price: "1,000" },
                                    { rank: 2, name: "★ผู้ทันตศึกญิ้งเดด Shows", price: "1,000" },
                                    { rank: 3, name: "○ขายเลึกใ○073 [อันตตี้", price: "1,000" }
                                ],
                                [
                                    { rank: 1, name: "ชิพัย Intel Core i5-950 3.00Ghz", price: "4,210" },
                                    { rank: 2, name: "Intel Core i7-9700 Tray Edition", price: "11" },
                                    { rank: 3, name: "รุ่นต่อสากกับ: T-09310", price: "5,500" }
                                ]
                            ];
                            
                            return categories[activeTab].map((product) => (
                                <div key={product.rank} className="flex items-start space-x-2">
                                    <div className={`flex-shrink-0 w-7 h-7 rounded flex items-center justify-center font-bold text-xs ${
                                        product.rank === 1 ? 'bg-yellow-400 text-white' :
                                        product.rank === 2 ? 'bg-gray-300 text-gray-700' :
                                        'bg-orange-400 text-white'
                                    }`}>
                                        {product.rank}
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                                            <div className="w-full h-16 bg-gray-200 rounded-lg mb-2 overflow-hidden">
                                                <img 
                                                    src="https://images.unsplash.com/photo-1559223669-e0065fa7f142" 
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-700 line-clamp-2 mb-1">
                                                {product.name}
                                            </p>
                                            <p className="text-[10px] text-gray-500 mb-1">กระแปียฉุบิน</p>
                                            <p className="text-red-600 font-bold text-xs">
                                                {product.price} <span className="text-[10px]">เชน</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                </div>
            </div>

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
            <div className="md:hidden bg-white py-12">
                <div className="px-4">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">เสียงจากผู้ใช้งาน</h2>
                        <p className="text-gray-600 text-sm">ประสบการณ์ที่ประทับใจ</p>
                    </div>
                    
                    <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar snap-x snap-mandatory scroll-smooth -mx-4 px-4">
                        {[
                            {
                                id: 1,
                                text: "ประทับใจระบบการประมูลมาก ใช้งานง่าย รวดเร็ว และได้สินค้าที่ต้องการในราคาที่ดี ประมูลได้ฟิกเกอร์หายากที่หามานาน",
                                avatar: "https://randomuser.me/api/portraits/men/32.jpg",
                                name: "สมชาย วงศ์ทอง",
                                role: "นักสะสมฟิกเกอร์"
                            },
                            {
                                id: 2,
                                text: "PAMOON เป็นแพลตฟอร์มที่ดีที่สุดสำหรับนักสะสม มีของหายาก ของสะสมเยอะมาก ระบบการประมูลโปร่งใส เชื่อถือได้",
                                avatar: "https://randomuser.me/api/portraits/women/44.jpg",
                                name: "วิภาวี ใจดี",
                                role: "นักสะสมของเล่น"
                            },
                            {
                                id: 3,
                                text: "ใช้งานง่าย ไม่ซับซ้อน การประมูลเป็นไปอย่างยุติธรรม ทีมงานดูแลดีมาก ตอบคำถามเร็ว",
                                avatar: "https://randomuser.me/api/portraits/men/75.jpg",
                                name: "ธนพล สุขสันต์",
                                role: "นักสะสมการ์ดเกม"
                            },
                            {
                                id: 4,
                                text: "ได้สินค้าที่ชอบในราคาที่คุ้มค่า ระบบการประมูลทำงานได้ดีมาก การจัดส่งรวดเร็ว",
                                avatar: "https://randomuser.me/api/portraits/women/68.jpg",
                                name: "นภัสสร ศรีสุข",
                                role: "นักสะสมโมเดล"
                            },
                            {
                                id: 5,
                                text: "เว็บไซต์ใช้งานง่าย ค้นหาสินค้าสะดวก มีหมวดหมู่ให้เลือกเยอะ ประมูลได้สินค้าที่ต้องการหลายชิ้น",
                                avatar: "https://randomuser.me/api/portraits/men/46.jpg",
                                name: "ประเสริฐ มั่นคง",
                                role: "นักสะสมหนังสือ"
                            },
                            {
                                id: 6,
                                text: "บริการดีเยี่ยม ระบบการประมูลมีความยุติธรรม ได้ของสะสมหายากที่หามานาน ขอบคุณ PAMOON มากครับ",
                                avatar: "https://randomuser.me/api/portraits/women/29.jpg",
                                name: "สุภาพร แก้วใส",
                                role: "นักสะสมของโบราณ"
                            },
                            {
                                id: 7,
                                text: "ราคาดี คุณภาพดี ประมูลได้สินค้าในราคาที่ต่ำกว่าตลาด แต่ได้ของแท้ มีใบรับรอง",
                                avatar: "https://randomuser.me/api/portraits/men/52.jpg",
                                name: "วิชัย ทองคำ",
                                role: "นักสะสมของวินเทจ"
                            },
                            {
                                id: 8,
                                text: "ประมูลครั้งแรกกับ PAMOON ได้สินค้าที่ต้องการเลย ระบบแจ้งเตือนทำงานดี บริการหลังการขายดีมาก",
                                avatar: "https://randomuser.me/api/portraits/women/65.jpg",
                                name: "กนกวรรณ สว่างใจ",
                                role: "นักสะสมเครื่องเล่น"
                            }
                        ].map((review) => (
                            <div
                                key={review.id}
                                className="flex-shrink-0 w-72 snap-start bg-gray-50 backdrop-blur-xl border border-gray-200 rounded-2xl p-5 shadow-sm"
                            >
                                <div className="flex flex-col h-full">
                                    <p className="text-gray-700 text-sm leading-relaxed mb-4 flex-grow">
                                        "{review.text}"
                                    </p>
                                    <div className="flex items-center space-x-3">
                                        <img 
                                            src={review.avatar} 
                                            alt={review.name}
                                            className="w-10 h-10 rounded-full border-2 border-gray-200"
                                        />
                                        <div>
                                            <p className="text-gray-900 font-semibold text-xs">{review.name}</p>
                                            <p className="text-gray-500 text-[10px]">{review.role}</p>
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
