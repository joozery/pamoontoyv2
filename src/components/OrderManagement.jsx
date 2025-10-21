
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Printer, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu"

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    const stored = JSON.parse(localStorage.getItem('orders') || '[]');
    if (stored.length === 0) {
      const sampleOrders = [
        {
          id: 'ORD001',
          customerName: 'สมชาย ใจดี',
          items: 'iPhone 15 Pro',
          total: 45900,
          status: 'pending',
          trackingNumber: '',
          createdAt: new Date().toISOString()
        },
        {
          id: 'ORD002',
          customerName: 'สมหญิง รักสวย',
          items: 'MacBook Pro',
          total: 89900,
          status: 'paid',
          trackingNumber: 'TH123456789',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('orders', JSON.stringify(sampleOrders));
      setOrders(sampleOrders);
    } else {
      setOrders(stored);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    const updated = orders.map(o =>
      o.id === id ? { ...o, status: newStatus } : o
    );
    localStorage.setItem('orders', JSON.stringify(updated));
    setOrders(updated);
    toast({
      title: "อัปเดตสถานะสำเร็จ",
      description: "เปลี่ยนสถานะคำสั่งซื้อแล้ว",
    });
  };

  const handlePrint = () => {
    toast({
      title: "🚧 ฟีเจอร์นี้ยังไม่พร้อมใช้งาน",
      description: "แต่ไม่ต้องกังวล! คุณสามารถขอเพิ่มฟีเจอร์นี้ในข้อความถัดไปได้! 🚀",
    });
  };

  const filteredOrders = orders.filter(o =>
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.items.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending': return { text: 'รอชำระเงิน', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400' };
      case 'paid': return { text: 'ชำระแล้ว', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400' };
      case 'shipped': return { text: 'จัดส่งแล้ว', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-400' };
      case 'cancelled': return { text: 'ยกเลิก', color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400' };
      default: return { text: status, color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' };
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาคำสั่งซื้อ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Order ID</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">ลูกค้า</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">สถานะ</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">ยอดรวม</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">วันที่</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500 dark:text-gray-400"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              <AnimatePresence>
                {filteredOrders.map((order) => (
                  <motion.tr
                    key={order.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-400">{order.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{order.customerName}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusInfo(order.status).color}`}>
                        {getStatusInfo(order.status).text}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">฿{order.total.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString('th-TH')}</td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>เปลี่ยนสถานะ</DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuSubContent>
                                <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'pending')}>รอชำระเงิน</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'paid')}>ชำระแล้ว</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'shipped')}>จัดส่งแล้ว</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'cancelled')}>ยกเลิก</DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                          <DropdownMenuItem onClick={handlePrint}>
                            <Printer className="w-4 h-4 mr-2" /> พิมพ์
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">ไม่พบคำสั่งซื้อ</p>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
