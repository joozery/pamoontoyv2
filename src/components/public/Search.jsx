import React, { useState } from 'react';
import { Search as SearchIcon, TrendingUp, Clock, X, Filter, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Search = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [recentSearches, setRecentSearches] = useState([
        'ฟิกเกอร์ Iron Man',
        'Lego Star Wars',
        'โมเดล Gundam',
        'ของสะสม Marvel'
    ]);

    const trendingSearches = [
        { keyword: 'ฟิกเกอร์ Anime', count: '2.5k' },
        { keyword: 'รถเหล็กวินเทจ', count: '1.8k' },
        { keyword: 'โมเดลรถยนต์', count: '1.2k' },
        { keyword: 'ตุ๊กตา Limited Edition', count: '980' },
        { keyword: 'ของสะสม DC', count: '750' }
    ];

    const categories = [
        { name: 'ทั้งหมด', icon: '🎯' },
        { name: 'ของเล่น', icon: '🧸' },
        { name: 'ฟิกเกอร์', icon: '🦸' },
        { name: 'โมเดล', icon: '🚗' },
        { name: 'การ์ด', icon: '🃏' },
        { name: 'เกม', icon: '🎮' },
        { name: 'หนังสือ', icon: '📚' },
        { name: 'อื่นๆ', icon: '✨' }
    ];

    const handleSearch = (query) => {
        if (query.trim()) {
            setIsSearching(true);
            // Add to recent searches if not already there
            if (!recentSearches.includes(query)) {
                setRecentSearches([query, ...recentSearches.slice(0, 4)]);
            }
            // Simulate search
            setTimeout(() => setIsSearching(false), 1000);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setIsSearching(false);
    };

    const removeRecentSearch = (index) => {
        setRecentSearches(recentSearches.filter((_, i) => i !== index));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-white pt-6 pb-24 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Search Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">ค้นหาสินค้า</h1>
                    <p className="text-gray-600">ค้นหาสินค้าที่คุณต้องการจากหลายพันรายการ</p>
                </motion.div>

                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative mb-6"
                >
                    <div className="relative">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="ค้นหาสินค้า, หมวดหมู่, หรือแบรนด์..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                            className="w-full pl-12 pr-24 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-gray-900 focus:outline-none transition-all text-gray-900 placeholder-gray-400 shadow-sm"
                        />
                        
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                            {searchQuery && (
                                <motion.button
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    onClick={handleClearSearch}
                                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                                >
                                    <X className="w-4 h-4 text-gray-600" />
                                </motion.button>
                            )}
                            <button className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center hover:bg-black transition-colors shadow-lg">
                                <Filter className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Search Loading */}
                    <AnimatePresence>
                        {isSearching && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-900 border-t-transparent"></div>
                                    <span className="text-gray-600">กำลังค้นหา...</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Categories Scroll */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map((category, index) => (
                            <button
                                key={index}
                                className="flex items-center space-x-2 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-900 hover:bg-gray-50 transition-all whitespace-nowrap shadow-sm"
                            >
                                <span className="text-lg">{category.icon}</span>
                                <span className="text-sm font-medium text-gray-900">{category.name}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center">
                                <Clock className="w-5 h-5 mr-2" />
                                ค้นหาล่าสุด
                            </h2>
                            <button
                                onClick={() => setRecentSearches([])}
                                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                ล้างทั้งหมด
                            </button>
                        </div>
                        <div className="space-y-2">
                            {recentSearches.map((search, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    className="flex items-center justify-between bg-white rounded-xl p-4 hover:bg-gray-50 transition-colors border border-gray-100 shadow-sm"
                                >
                                    <button
                                        onClick={() => setSearchQuery(search)}
                                        className="flex items-center space-x-3 flex-1"
                                    >
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-900">{search}</span>
                                    </button>
                                    <button
                                        onClick={() => removeRecentSearch(index)}
                                        className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors"
                                    >
                                        <X className="w-4 h-4 text-gray-500" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Trending Searches */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2" />
                        คำค้นหายอดนิยม
                    </h2>
                    <div className="space-y-2">
                        {trendingSearches.map((item, index) => (
                            <motion.button
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * index }}
                                onClick={() => setSearchQuery(item.keyword)}
                                className="w-full flex items-center justify-between bg-white rounded-xl p-4 hover:bg-gray-50 transition-all border border-gray-100 shadow-sm hover:shadow-md"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                                        index === 0 ? 'bg-yellow-400 text-gray-900' :
                                        index === 1 ? 'bg-gray-300 text-gray-900' :
                                        index === 2 ? 'bg-orange-400 text-white' :
                                        'bg-gray-100 text-gray-600'
                                    }`}>
                                        {index + 1}
                                    </div>
                                    <span className="text-gray-900 font-medium">{item.keyword}</span>
                                </div>
                                <span className="text-sm text-gray-500">{item.count} รายการ</span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Search;

