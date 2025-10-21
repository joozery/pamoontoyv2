import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Users, ShoppingCart, Star, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, MoreVertical, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 142,
    totalUsers: 1234,
    totalOrders: 856,
    totalReviews: 324,
    revenue: 2458900,
    pendingOrders: 23
  });

  // Mock data for recent activities
  const recentOrders = [
    { id: 'ORD-001', customer: 'สมชาย ใจดี', product: 'ฟิกเกอร์ Iron Man', amount: 6800, status: 'completed', date: '2024-10-21' },
    { id: 'ORD-002', customer: 'สมหญิง รักดี', product: 'โมเดล Batman', amount: 4800, status: 'pending', date: '2024-10-21' },
    { id: 'ORD-003', customer: 'วิชัย มีสุข', product: 'การ์ดโปเกมอน', amount: 25000, status: 'processing', date: '2024-10-20' },
    { id: 'ORD-004', customer: 'นภา สวยงาม', product: 'Lego Star Wars', amount: 12000, status: 'completed', date: '2024-10-20' },
    { id: 'ORD-005', customer: 'ประสิทธิ์ ดีมาก', product: 'ของสะสม Transformers', amount: 9500, status: 'completed', date: '2024-10-19' },
  ];

  const topProducts = [
    { name: 'ฟิกเกอร์ Iron Man Mark V', sales: 145, revenue: 986000 },
    { name: 'โมเดล Batman Limited', sales: 123, revenue: 590400 },
    { name: 'การ์ดโปเกมอน Charizard', sales: 98, revenue: 2450000 },
    { name: 'Lego Star Wars', sales: 87, revenue: 1044000 },
  ];

  const statCards = [
    { 
      title: 'รายได้รวม', 
      value: `฿${stats.revenue.toLocaleString()}`, 
      change: '+12.5%',
      isPositive: true,
      icon: DollarSign, 
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'เทียบกับเดือนที่แล้ว'
    },
    { 
      title: 'ผู้ใช้งานทั้งหมด', 
      value: stats.totalUsers.toLocaleString(), 
      change: '+8.2%',
      isPositive: true,
      icon: Users, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'ผู้ใช้งานใหม่ 92 คน'
    },
    { 
      title: 'คำสั่งซื้อ', 
      value: stats.totalOrders.toLocaleString(), 
      change: '-3.1%',
      isPositive: false,
      icon: ShoppingCart, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: `รอดำเนินการ ${stats.pendingOrders} รายการ`
    },
    { 
      title: 'สินค้าทั้งหมด', 
      value: stats.totalProducts.toLocaleString(), 
      change: '+5.4%',
      isPositive: true,
      icon: Package, 
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'สินค้าใหม่ 18 รายการ'
    },
  ];

  const getStatusBadge = (status) => {
    const variants = {
      completed: 'default',
      pending: 'secondary',
      processing: 'outline'
    };
    
    const labels = {
      completed: 'สำเร็จ',
      pending: 'รอชำระเงิน',
      processing: 'กำลังดำเนินการ'
    };

    return (
      <Badge variant={variants[status]} className="text-xs">
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const ChangeIcon = stat.isPositive ? ArrowUpRight : ArrowDownRight;
          
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="flex items-center text-xs mt-1">
                    <span className={`flex items-center ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      <ChangeIcon className="h-3 w-3 mr-0.5" />
                      {stat.change}
                    </span>
                    <span className="text-gray-500 ml-2">{stat.description}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>คำสั่งซื้อล่าสุด</CardTitle>
                  <CardDescription>รายการคำสั่งซื้อที่เพิ่งเกิดขึ้น</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  ดูทั้งหมด
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>รหัสคำสั่งซื้อ</TableHead>
                    <TableHead>ลูกค้า</TableHead>
                    <TableHead>สินค้า</TableHead>
                    <TableHead>ยอดเงิน</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{order.product}</TableCell>
                      <TableCell>฿{order.amount.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              ดูรายละเอียด
                            </DropdownMenuItem>
                            <DropdownMenuItem>แก้ไข</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">ลบ</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>สินค้ายอดนิยม</CardTitle>
              <CardDescription>สินค้าที่ขายดีที่สุด</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-900 font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 leading-none mb-1">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.sales} รายการ
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        ฿{(product.revenue / 1000).toFixed(0)}k
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>สถิติด่วน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">รีวิวทั้งหมด</span>
                  <span className="text-sm font-semibold text-gray-900">{stats.totalReviews}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">คะแนนเฉลี่ย</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold text-gray-900">4.8</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">อัตราการเติบโต</span>
                  <span className="text-sm font-semibold text-green-600">+24.3%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Welcome Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">ยินดีต้อนรับสู่ PAMOON Admin</h2>
                <p className="text-gray-300 max-w-2xl">
                  ระบบจัดการที่ทรงพลังสำหรับการบริหารงานประมูลออนไลน์ 
                  คุณสามารถจัดการสินค้า ผู้ใช้ คำสั่งซื้อ และติดตามสถิติได้อย่างมีประสิทธิภาพ
                </p>
              </div>
              <Package className="h-24 w-24 text-white/20" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
