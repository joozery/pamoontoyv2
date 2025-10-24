import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, User, ArrowLeft } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet';
import pamoonLogo from '@/assets/pamoontoy.png';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบ",
        description: "โปรดระบุอีเมลและรหัสผ่าน",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await login({ email, password });
      
      if (result.success) {
        // Check if user is admin
        if (result.data.user.role === 'admin') {
          localStorage.setItem('adminAuth', 'true');
          toast({
            title: "เข้าสู่ระบบสำเร็จ",
            description: `ยินดีต้อนรับ ${result.data.user.name || result.data.user.email}`,
          });
          navigate('/admin');
        } else {
          // Not an admin
          localStorage.removeItem('token');
          localStorage.removeItem('adminAuth');
          toast({
            title: "เข้าสู่ระบบไม่สำเร็จ",
            description: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "เข้าสู่ระบบไม่สำเร็จ",
          description: result.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Login - PAMOON</title>
        <meta name="description" content="เข้าสู่ระบบหลังบ้านสำหรับผู้ดูแลระบบ" />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center bg-white relative">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.03),transparent_50%)]"></div>

        {/* Back Button */}
        <Link
          to="/"
          className="absolute top-4 left-4 flex items-center space-x-1 text-gray-600 hover:text-black transition-colors text-sm group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>กลับ</span>
        </Link>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 w-full max-w-sm mx-4"
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-8 pb-6 text-center border-b border-gray-100">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <img 
                  src={pamoonLogo} 
                  alt="PAMOON" 
                  className="w-14 h-14 object-contain mx-auto mb-3"
                />
              </motion.div>
              
              <h1 className="text-xl font-bold text-gray-900">
                Admin Panel
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                ระบบจัดการ PAMOON
              </p>
            </div>

            {/* Form */}
            <div className="px-6 py-6">
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    อีเมล
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@pamoon.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 text-gray-900 text-sm placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    รหัสผ่าน
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 bg-white border border-gray-300 text-gray-900 text-sm placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center space-x-1.5 text-gray-600 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-3.5 h-3.5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                    />
                    <span>จดจำฉัน</span>
                  </label>
                  <button type="button" className="text-gray-600 hover:text-gray-900 transition-colors">
                    ลืมรหัสผ่าน?
                  </button>
                </div>

                {/* Submit */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gray-900 hover:bg-black text-white font-medium py-2.5 px-4 rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm"
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>กำลังเข้าสู่ระบบ...</span>
                    </>
                  ) : (
                    <span>เข้าสู่ระบบ</span>
                  )}
                </motion.button>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-400">
                  สำหรับผู้ดูแลระบบเท่านั้น
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Login;
