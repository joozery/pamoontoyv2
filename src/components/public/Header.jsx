
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Apple, Search, ShoppingBag } from 'lucide-react';
const Header = () => {
  return <header className="hidden md:block sticky top-0 z-40 w-full bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <Link to="/" className="flex items-center space-x-2">
                  <Apple className="h-6 w-6 text-gray-800" />
                  <span className="font-semibold text-lg text-gray-800">PAMOON</span>
                </Link>
                <nav className="hidden md:flex space-x-8">
                  <Link to="/" className="text-sm font-medium text-gray-600 hover:text-black">สินค้าทั้งหมด</Link>
                  <Link to="/" className="text-sm font-medium text-gray-600 hover:text-black">วิธีการประมูล</Link>
                  <Link to="/" className="text-sm font-medium text-gray-600 hover:text-black">ติดต่อเรา</Link>
                </nav>
              </div>
              <div className="flex items-center space-x-6">
                <button className="text-gray-600 hover:text-black">
                  <Search className="h-5 w-5" />
                </button>
                <button className="text-gray-600 hover:text-black">
                  <ShoppingBag className="h-5 w-5" />
                </button>
                <Link to="/admin" className="text-sm font-medium text-white bg-black rounded-full px-4 py-2 hover:bg-gray-800 transition-colors">
                  เข้าสู่ระบบ
                </Link>
              </div>
            </div>
          </div>
        </header>;
};
export default Header;
