import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, User, Lock, ArrowLeft, Phone, MessageCircle, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import pamoonLogo from '@/assets/pamoontoy.png';
import { useAuth } from '@/contexts/AuthContext';

const UserAuth = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
    phone: '',
    lineId: '',
    facebookName: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (!formData.email || !formData.password) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบ",
        description: "โปรดระบุอีเมลและรหัสผ่าน",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const result = await login({
      email: formData.email,
      password: formData.password
    });

    if (result.success) {
      toast({
        title: "เข้าสู่ระบบสำเร็จ! 🎉",
        description: `ยินดีต้อนรับกลับมา ${result.data.user.name}`,
      });
      navigate('/');
    } else {
      toast({
        title: "เข้าสู่ระบบไม่สำเร็จ",
        description: result.message,
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.phone || !formData.lineId || !formData.facebookName) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบ",
        description: "โปรดกรอกข้อมูลทุกช่อง",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "รหัสผ่านไม่ตรงกัน",
        description: "กรุณาตรวจสอบรหัสผ่านอีกครั้ง",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "รหัสผ่านสั้นเกินไป",
        description: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
        variant: "destructive",
      });
      return;
    }

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone
    });

    if (result.success) {
      toast({
        title: "สมัครสมาชิกสำเร็จ! 🎊",
        description: `ยินดีต้อนรับ ${result.data.user.name} สู่ PAMOON`,
      });
      navigate('/');
    } else {
      toast({
        title: "สมัครสมาชิกไม่สำเร็จ",
        description: result.message,
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmPassword: ''
    });
    setShowPassword(false);
  };

  return (
    <>
      <Helmet>
        <title>{isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'} - PAMOON</title>
        <meta name="description" content={isLogin ? 'เข้าสู่ระบบเพื่อเริ่มประมูลสินค้า' : 'สมัครสมาชิกเพื่อเข้าร่วมประมูล'} />
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-900/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-900/20 to-transparent rounded-full blur-3xl"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm p-6 space-y-6 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 relative z-10 m-4"
        >
          {/* Back to Home */}
          <Link 
            to="/" 
            className="absolute top-4 left-4 text-white/60 hover:text-white transition-colors flex items-center space-x-1 text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับหน้าหลัก</span>
          </Link>

          <div className="text-center pt-4">
            <img src={pamoonLogo} alt="PAMOON Logo" className="w-16 h-16 mx-auto object-contain" />
            <h1 className="mt-4 text-2xl font-bold text-white">
              {isLogin ? 'ยินดีต้อนรับกลับ' : 'เริ่มต้นกับเรา'}
            </h1>
            <p className="mt-2 text-sm text-gray-300">
              {isLogin ? 'เข้าสู่ระบบเพื่อเริ่มประมูลสินค้า' : 'สมัครสมาชิกเพื่อเข้าร่วมประมูล'}
            </p>
          </div>

          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
            {!isLogin && (
              <>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="ชื่อของคุณ"
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                    required={!isLogin}
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="เบอร์โทรศัพท์"
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                    required={!isLogin}
                  />
                </div>

                <div className="relative">
                  <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="lineId"
                    value={formData.lineId}
                    onChange={handleInputChange}
                    placeholder="ไอดีไลน์"
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                    required={!isLogin}
                  />
                </div>

                <div className="relative">
                  <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="facebookName"
                    value={formData.facebookName}
                    onChange={handleInputChange}
                    placeholder="ชื่อ Facebook"
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                    required={!isLogin}
                  />
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="อีเมล"
                className="w-full pl-10 pr-3 py-2.5 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="รหัสผ่าน"
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {!isLogin && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="ยืนยันรหัสผ่าน"
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                  required={!isLogin}
                />
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center text-gray-300 cursor-pointer">
                  <input type="checkbox" className="mr-1.5 rounded" />
                  จดจำฉัน
                </label>
                <a href="#" className="text-white hover:underline">
                  ลืมรหัสผ่าน?
                </a>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white text-black hover:bg-gray-200 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังประมวลผล...' : (isLogin ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก')}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-transparent text-gray-400">หรือ</span>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={toggleMode}
              className="text-sm text-white hover:underline font-medium"
            >
              {isLogin ? (
                <>
                  ยังไม่มีบัญชี? <span className="text-blue-400">สมัครสมาชิก</span>
                </>
              ) : (
                <>
                  มีบัญชีแล้ว? <span className="text-blue-400">เข้าสู่ระบบ</span>
                </>
              )}
            </button>
          </div>

          <div className="pt-3 text-center border-t border-white/10">
            <p className="text-xs text-gray-400">
              สำหรับแอดมิน:{' '}
              <Link to="/admin/login" className="text-white hover:underline">
                เข้าสู่ระบบผู้ดูแล
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default UserAuth;

