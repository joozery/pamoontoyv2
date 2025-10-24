import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { Helmet } from 'react-helmet';
import { Menu, Bell, User, Search, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const adminPath = location.pathname.split('/')[2] || 'dashboard';
  const [currentPage, setCurrentPage] = useState(adminPath);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [notificationCount] = useState(12);

  useEffect(() => {
    const authStatus = localStorage.getItem('adminAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    } else {
      navigate('/admin/login');
    }
  }, [navigate]);

  useEffect(() => {
      setCurrentPage(adminPath);
  }, [adminPath]);
  
  const handleSetCurrentPage = (page) => {
      setCurrentPage(page);
  }

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuth');
    navigate('/admin/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  const pageTitles = {
    dashboard: 'แดชบอร์ด',
    products: 'จัดการสินค้า',
    users: 'จัดการผู้ใช้',
    admins: 'จัดการแอดมิน',
    orders: 'คำสั่งซื้อ',
    payments: 'ตรวจสอบการชำระเงิน',
    discounts: 'โค้ดส่วนลด',
    messages: 'ข้อความติดต่อ',
    categories: 'หมวดหมู่',
    reviews: 'รีวิวสินค้า',
  };

  const pageDescriptions = {
    dashboard: 'ภาพรวมระบบและสถิติสำคัญ',
    products: 'จัดการสินค้าและการประมูล',
    users: 'จัดการข้อมูลผู้ใช้งาน',
    admins: 'จัดการแอดมินและสิทธิ์การเข้าถึง',
    orders: 'ติดตามและจัดการคำสั่งซื้อ',
    payments: 'ตรวจสอบสลิปโอนเงินและอัปเดทเลขพัสดุ',
    discounts: 'จัดการโค้ดส่วนลดและโปรโมชั่น',
    messages: 'ตอบกลับข้อความและคำถาม',
    categories: 'จัดการหมวดหมู่สินค้า',
    reviews: 'ดูและจัดการรีวิวสินค้า',
  };

  return (
    <>
      <Helmet>
        <title>{pageTitles[currentPage] || 'Admin'} - PAMOON</title>
        <meta name="description" content="ระบบจัดการหลังบ้านสำหรับเว็บไซต์ประมูล" />
      </Helmet>
      
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar
          collapsed={isSidebarCollapsed}
          setCollapsed={setIsSidebarCollapsed}
          currentPage={currentPage}
          setCurrentPage={handleSetCurrentPage}
          onLogout={handleLogout}
        />
        
        <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          {/* Header */}
          <header className="sticky top-0 z-30 h-16 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-gray-200">
            <div className="h-full px-4 md:px-6 flex items-center gap-4">
              {/* Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Page Title */}
              <div className="flex-1 min-w-0">
                <h1 className="text-base md:text-lg font-semibold text-gray-900 truncate">
                  {pageTitles[currentPage]}
                </h1>
                <p className="hidden md:block text-xs text-gray-500">
                  {pageDescriptions[currentPage]}
                </p>
              </div>

              {/* Search */}
              <div className="hidden lg:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="ค้นหา..."
                    className="w-64 pl-9 h-9 bg-gray-50 border-gray-300"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Search (Mobile) */}
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Search className="h-5 w-5" />
                </Button>

                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      {notificationCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                          {notificationCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>การแจ้งเตือน</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="max-h-96 overflow-y-auto">
                      <DropdownMenuItem className="flex-col items-start py-3">
                        <div className="font-medium text-sm">คำสั่งซื้อใหม่</div>
                        <div className="text-xs text-gray-500">มีคำสั่งซื้อใหม่ 3 รายการรอดำเนินการ</div>
                        <div className="text-xs text-gray-400 mt-1">5 นาทีที่แล้ว</div>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex-col items-start py-3">
                        <div className="font-medium text-sm">ข้อความใหม่</div>
                        <div className="text-xs text-gray-500">มีข้อความติดต่อจากลูกค้า</div>
                        <div className="text-xs text-gray-400 mt-1">15 นาทีที่แล้ว</div>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex-col items-start py-3">
                        <div className="font-medium text-sm">รีวิวใหม่</div>
                        <div className="text-xs text-gray-500">มีรีวิวสินค้าใหม่ 2 รายการ</div>
                        <div className="text-xs text-gray-400 mt-1">1 ชั่วโมงที่แล้ว</div>
                      </DropdownMenuItem>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="justify-center text-sm text-gray-600">
                      ดูทั้งหมด
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-gray-900 text-white text-sm">
                          A
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">Admin</p>
                        <p className="text-xs text-gray-500">admin@pamoon.com</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>โปรไฟล์</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Sun className="mr-2 h-4 w-4" />
                      <span>ธีม</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <span>ออกจากระบบ</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminLayout;
