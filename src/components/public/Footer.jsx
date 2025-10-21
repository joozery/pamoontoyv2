import React from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import pamoonLogo from '@/assets/pamoontoy.png';

const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-300 hidden md:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <img src={pamoonLogo} alt="PAMOON" className="h-10 w-10 object-contain" />
              <span className="font-bold text-2xl text-white">PAMOON</span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              แพลตฟอร์มประมูลสินค้าออนไลน์ที่ให้คุณค้นพบสินค้าหายากและของสะสมสุดพิเศษ
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-9 h-9 bg-white/10 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 rounded-full flex items-center justify-center transition-all">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-white/10 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 rounded-full flex items-center justify-center transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-white/10 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 rounded-full flex items-center justify-center transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-white/10 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 rounded-full flex items-center justify-center transition-all">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">เมนูหลัก</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm hover:text-purple-400 transition-colors">สินค้าทั้งหมด</Link></li>
              <li><Link to="/" className="text-sm hover:text-purple-400 transition-colors">การประมูล</Link></li>
              <li><Link to="/" className="text-sm hover:text-purple-400 transition-colors">วิธีการประมูล</Link></li>
              <li><Link to="/" className="text-sm hover:text-purple-400 transition-colors">หมวดหมู่</Link></li>
              <li><Link to="/" className="text-sm hover:text-purple-400 transition-colors">โปรโมชั่น</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">ช่วยเหลือ</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm hover:text-purple-400 transition-colors">คำถามที่พบบ่อย</Link></li>
              <li><Link to="/" className="text-sm hover:text-purple-400 transition-colors">ติดต่อเรา</Link></li>
              <li><Link to="/" className="text-sm hover:text-purple-400 transition-colors">นโยบายความเป็นส่วนตัว</Link></li>
              <li><Link to="/" className="text-sm hover:text-purple-400 transition-colors">ข้อกำหนดการใช้งาน</Link></li>
              <li><Link to="/admin/login" className="text-sm hover:text-purple-400 transition-colors">สำหรับผู้ดูแล</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">ติดต่อเรา</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm">123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span className="text-sm">02-123-4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span className="text-sm">contact@pamoon.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-500">
              © {year} PAMOON. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link to="/" className="text-sm text-gray-500 hover:text-purple-400 transition-colors">นโยบายความเป็นส่วนตัว</Link>
              <Link to="/" className="text-sm text-gray-500 hover:text-purple-400 transition-colors">ข้อกำหนด</Link>
              <Link to="/" className="text-sm text-gray-500 hover:text-purple-400 transition-colors">แผนผังเว็บไซต์</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;