import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Users, ShoppingCart, Star, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, MoreVertical, Eye, RefreshCw } from 'lucide-react';
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
import { apiService } from '@/services/api';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalBids: 0,
    recentUsers: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load dashboard stats
      const statsResponse = await apiService.dashboard.getStats();
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      // Load latest orders (limit 5)
      const ordersResponse = await apiService.dashboard.getLatestOrders({ limit: 5 });
      if (ordersResponse.data.success) {
        setRecentOrders(ordersResponse.data.data || []);
      }

      // Load top products
      const topProductsResponse = await apiService.dashboard.getTopProducts({ limit: 4 });
      if (topProductsResponse.data.success) {
        setTopProducts(topProductsResponse.data.data || []);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลแดชบอร์ดได้",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      title: 'รายได้รวม', 
      value: loading ? '...' : `฿${(stats.totalRevenue || 0).toLocaleString()}`, 
      change: '+12.5%',
      isPositive: true,
      icon: DollarSign, 
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'จากคำสั่งซื้อที่สำเร็จ'
    },
    { 
      title: 'ผู้ใช้งานทั้งหมด', 
      value: loading ? '...' : (stats.totalUsers || 0).toLocaleString(), 
      change: stats.recentUsers > 0 ? `+${stats.recentUsers}` : '+0',
      isPositive: true,
      icon: Users, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'ผู้ใช้ใหม่ 7 วันล่าสุด'
    },
    { 
      title: 'คำสั่งซื้อ', 
      value: loading ? '...' : (stats.totalOrders || 0).toLocaleString(), 
      change: stats.pendingOrders > 0 ? `${stats.pendingOrders} รอดำเนินการ` : 'ไม่มีรอดำเนินการ',
      isPositive: stats.pendingOrders === 0,
      icon: ShoppingCart, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: `สำเร็จ ${stats.completedOrders || 0} รายการ`
    },
    { 
      title: 'สินค้าทั้งหมด', 
      value: loading ? '...' : (stats.totalProducts || 0).toLocaleString(), 
      change: `${stats.activeProducts || 0} กำลังประมูล`,
      isPositive: true,
      icon: Package, 
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: `การเสนอราคา ${stats.totalBids || 0} รายการ`
    },
  ];

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { variant: 'secondary', label: 'รอชำระเงิน', color: 'bg-yellow-100 text-yellow-800' },
      paid: { variant: 'default', label: 'ชำระแล้ว', color: 'bg-blue-100 text-blue-800' },
      confirmed: { variant: 'default', label: 'ยืนยันแล้ว', color: 'bg-green-100 text-green-800' },
      shipped: { variant: 'default', label: 'จัดส่งแล้ว', color: 'bg-indigo-100 text-indigo-800' },
      delivered: { variant: 'default', label: 'ส่งถึงแล้ว', color: 'bg-green-100 text-green-800' },
      completed: { variant: 'default', label: 'สำเร็จ', color: 'bg-green-100 text-green-800' },
      cancelled: { variant: 'destructive', label: 'ยกเลิก', color: 'bg-red-100 text-red-800' },
    };

    const statusInfo = statusMap[status] || { variant: 'secondary', label: status, color: 'bg-gray-100 text-gray-800' };

    return (
      <Badge className={`text-xs ${statusInfo.color} border-0`}>
        {statusInfo.label}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <span className="ml-3 text-gray-600">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">แดชบอร์ด</h1>
          <p className="text-muted-foreground">ภาพรวมระบบและสถิติสำคัญ</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadDashboardData}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          รีเฟรช
        </Button>
      </div>

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
                    <span className={`flex items-center ${stat.isPositive ? 'text-green-600' : 'text-yellow-600'}`}>
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
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/admin/payments')}
                >
                  ดูทั้งหมด
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>ยังไม่มีคำสั่งซื้อ</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>รหัส</TableHead>
                      <TableHead>ลูกค้า</TableHead>
                      <TableHead>สินค้า</TableHead>
                      <TableHead>ยอดเงิน</TableHead>
                      <TableHead>สถานะ</TableHead>
                      <TableHead>วันที่</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">#{order.id}</TableCell>
                        <TableCell className="max-w-[120px] truncate">
                          {order.customer_name || order.user_name || '-'}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {order.product_name || '-'}
                        </TableCell>
                        <TableCell className="font-semibold">
                          ฿{(order.total_amount || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-xs text-gray-500">
                          {formatDate(order.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
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
              <CardDescription>สินค้าที่มีการเสนอราคามากที่สุด</CardDescription>
            </CardHeader>
            <CardContent>
              {topProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>ยังไม่มีข้อมูล</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-900 font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 leading-none mb-1">
                            {product.name || product.product_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {product.bid_count || 0} การเสนอราคา
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          ฿{((product.current_price || 0) / 1000).toFixed(0)}k
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                  <span className="text-sm text-gray-600">การเสนอราคาทั้งหมด</span>
                  <span className="text-sm font-semibold text-gray-900">{stats.totalBids || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">สินค้าที่กำลังประมูล</span>
                  <span className="text-sm font-semibold text-green-600">{stats.activeProducts || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">คำสั่งซื้อรอดำเนินการ</span>
                  <span className="text-sm font-semibold text-orange-600">{stats.pendingOrders || 0}</span>
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
