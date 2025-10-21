import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  MessageSquare, 
  FolderTree, 
  Star,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Receipt
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import pamoonLogo from '@/assets/pamoontoy.png';

const Sidebar = ({ currentPage, setCurrentPage, onLogout, collapsed = false, setCollapsed = () => {} }) => {
  const menuItems = [
    { id: 'dashboard', label: 'แดชบอร์ด', icon: LayoutDashboard, path: '', badge: null },
    { id: 'products', label: 'จัดการสินค้า', icon: Package, path: 'products', badge: '142' },
    { id: 'users', label: 'จัดการผู้ใช้', icon: Users, path: 'users', badge: '1.2k' },
    { id: 'orders', label: 'คำสั่งซื้อ', icon: ShoppingCart, path: 'orders', badge: '23' },
    { id: 'payments', label: 'ตรวจสอบการชำระเงิน', icon: Receipt, path: 'payments', badge: '8' },
    { id: 'messages', label: 'ข้อความติดต่อ', icon: MessageSquare, path: 'messages', badge: '5' },
    { id: 'categories', label: 'หมวดหมู่', icon: FolderTree, path: 'categories', badge: null },
    { id: 'reviews', label: 'รีวิวสินค้า', icon: Star, path: 'reviews', badge: '18' },
  ];

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ 
        x: 0,
        width: collapsed ? 80 : 256
      }}
      transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
      className={cn(
        "fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col shadow-sm z-40",
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo & Toggle */}
      <div className={cn(
        "h-16 flex items-center border-b border-gray-200 px-4",
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        <div className="flex items-center gap-3">
          <img src={pamoonLogo} alt="PAMOON" className="w-8 h-8 object-contain" />
          {!collapsed && (
            <div>
              <h2 className="text-sm font-bold text-gray-900">PAMOON</h2>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCollapsed(true)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Expand Button (when collapsed) */}
      {collapsed && (
        <div className="px-2 py-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-full h-9"
            onClick={() => setCollapsed(false)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id || (currentPage === 'dashboard' && item.id === 'dashboard');
          
          return (
            <Link
              to={`/admin/${item.path}`}
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
            >
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 text-sm font-medium",
                  collapsed && "justify-center px-2",
                  isActive && "bg-gray-900 text-white hover:bg-gray-800",
                  !isActive && "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Logout */}
      <div className="p-3">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50",
            collapsed && "justify-center px-2"
          )}
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>ออกจากระบบ</span>}
        </Button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
