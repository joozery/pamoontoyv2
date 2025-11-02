import React from 'react';
import { Mail, Facebook } from 'lucide-react';
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
              แพลตฟอร์มประมูลสินค้าจากญี่ปุ่น ของแท้และของสะสมหายาก
            </p>
            <div className="flex space-x-3">
              <a href="https://www.facebook.com/share/1AsxQCYE5A/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 rounded-full flex items-center justify-center transition-all">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://line.me/R/ti/p/@pamoon" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 rounded-full flex items-center justify-center transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">เมนูหลัก</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm hover:text-purple-400 transition-colors">สินค้าทั้งหมด</Link></li>
              <li><Link to="/my-bids" className="text-sm hover:text-purple-400 transition-colors">การประมูล</Link></li>
              <li><Link to="/how-to-bid" className="text-sm hover:text-purple-400 transition-colors">วิธีการประมูล</Link></li>
              <li><Link to="/" className="text-sm hover:text-purple-400 transition-colors">หมวดหมู่</Link></li>
              <li><a href="https://www.facebook.com/share/1AsxQCYE5A/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-purple-400 transition-colors">โปรโมชั่น</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">ช่วยเหลือ</h3>
            <ul className="space-y-2">
              <li><Link to="/faq" className="text-sm hover:text-purple-400 transition-colors">คำถามที่พบบ่อย</Link></li>
              <li><Link to="/contact" className="text-sm hover:text-purple-400 transition-colors">ติดต่อเรา</Link></li>
              <li><Link to="/privacy-policy" className="text-sm hover:text-purple-400 transition-colors">นโยบายความเป็นส่วนตัว</Link></li>
              <li><Link to="/terms" className="text-sm hover:text-purple-400 transition-colors">ข้อกำหนดการใช้งาน</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">ติดต่อเรา</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-purple-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                </svg>
                <a href="https://line.me/R/ti/p/@pamoon" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-purple-400 transition-colors">Line OA: @pamoon</a>
              </li>
              <li className="flex items-center space-x-3">
                <Facebook className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <a href="https://www.facebook.com/share/1AsxQCYE5A/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-purple-400 transition-colors">Facebook</a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <a href="mailto:support@pamoontoy.site" className="text-sm hover:text-purple-400 transition-colors">support@pamoontoy.site</a>
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
              <Link to="/privacy-policy" className="text-sm text-gray-500 hover:text-purple-400 transition-colors">นโยบายความเป็นส่วนตัว</Link>
              <Link to="/terms" className="text-sm text-gray-500 hover:text-purple-400 transition-colors">ข้อกำหนด</Link>
              <Link to="/sitemap" className="text-sm text-gray-500 hover:text-purple-400 transition-colors">แผนผังเว็บไซต์</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;