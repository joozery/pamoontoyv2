import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Ban, 
  CheckCircle, 
  MoreHorizontal, 
  Trash2, 
  Edit, 
  Eye,
  UserPlus,
  Download,
  Filter,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  DollarSign,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated and is admin
    if (!isAuthenticated()) {
      navigate('/admin/login');
      return;
    }
    
    if (user && user.role !== 'admin') {
      toast({
        title: "ไม่มีสิทธิ์เข้าถึง",
        description: "คุณต้องเป็น Admin ถึงจะเข้าถึงหน้านี้ได้",
        variant: "destructive"
      });
      navigate('/admin/dashboard');
      return;
    }

    loadUsers();
  }, [user, isAuthenticated, navigate]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await apiService.admin.getUsers();
      if (response.data.success) {
        // Filter out admin users, only show regular users (members, vip)
        const regularUsers = response.data.data.filter(user => user.role !== 'admin');
        setUsers(regularUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูล users ได้",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiService.admin.deleteUser(id);
      toast({
        title: "ลบผู้ใช้สำเร็จ",
        description: "ลบบัญชีผู้ใช้ออกจากระบบแล้ว",
      });
      loadUsers(); // Reload users
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบผู้ใช้ได้",
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      // This would need a separate API endpoint for status update
      toast({
        title: "ฟีเจอร์ยังไม่พร้อม",
        description: "การเปลี่ยนสถานะผู้ใช้ยังไม่พร้อมใช้งาน",
        variant: "destructive"
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเปลี่ยนสถานะได้",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (user) => {
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address || ''
    });
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      await apiService.admin.updateUser(selectedUser.id, editForm);
      toast({
        title: "บันทึกข้อมูลสำเร็จ",
        description: "อัปเดตข้อมูลผู้ใช้แล้ว",
      });
      setIsEditDialogOpen(false);
      loadUsers(); // Reload users
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตข้อมูลได้",
        variant: "destructive"
      });
    }
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredUsers, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast({
      title: "Export สำเร็จ",
      description: "ดาวน์โหลดไฟล์ข้อมูลผู้ใช้แล้ว",
    });
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm));
    
    const matchesStatus = filterStatus === 'all' || u.status === filterStatus;
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active' || !u.status).length, // Default to active if no status
    suspended: users.filter(u => u.status === 'suspended').length,
    vip: users.filter(u => u.role === 'vip').length,
    member: users.filter(u => u.role === 'member').length,
  };

  const getStatusBadge = (status) => {
    return status === 'active' ? (
      <Badge className="bg-green-100 text-green-800 border-0">ใช้งาน</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 border-0">ระงับ</Badge>
    );
  };

  const getRoleBadge = (role) => {
    return role === 'vip' ? (
      <Badge className="bg-purple-100 text-purple-800 border-0">VIP</Badge>
    ) : (
      <Badge variant="outline">สมาชิก</Badge>
    );
  };

  const getLevelColor = (level) => {
    const colors = {
      'Platinum': 'from-gray-400 to-gray-600',
      'Gold': 'from-yellow-400 to-yellow-600',
      'Silver': 'from-gray-300 to-gray-500',
      'Bronze': 'from-orange-400 to-orange-600'
    };
    return colors[level] || colors.Bronze;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">ผู้ใช้ทั้งหมด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <p className="text-xs text-gray-500 mt-1">บัญชีทั้งหมด</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">ใช้งาน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-xs text-gray-500 mt-1">บัญชีที่ใช้งานได้</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">ระงับ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.suspended}</div>
              <p className="text-xs text-gray-500 mt-1">บัญชีที่ถูกระงับ</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">สมาชิก VIP</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.vip}</div>
              <p className="text-xs text-gray-500 mt-1">สมาชิกพิเศษ</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>จัดการผู้ใช้</CardTitle>
                <CardDescription>ดูและจัดการข้อมูลผู้ใช้งานในระบบ</CardDescription>
              </div>

              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="ค้นหาผู้ใช้..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 pl-9 h-9"
                  />
                </div>

                {/* Filter Status */}
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[140px] h-9">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="สถานะ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="active">ใช้งาน</SelectItem>
                    <SelectItem value="suspended">ระงับ</SelectItem>
                  </SelectContent>
                </Select>

                {/* Filter Role */}
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-[140px] h-9">
                    <UserPlus className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="ประเภท" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="member">สมาชิก</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>

                {/* Export */}
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ผู้ใช้</TableHead>
                  <TableHead>ติดต่อ</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>สถิติ</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>วันที่สมัคร</TableHead>
                  <TableHead className="text-right">การจัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      ไม่พบข้อมูลผู้ใช้
                    </TableCell>
                  </TableRow>
                ) : (
                  <AnimatePresence>
                    {filteredUsers.map((user) => (
                      <motion.tr
                        key={user.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="group"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className={`h-10 w-10 bg-gradient-to-br ${getLevelColor(user.level || 'Bronze')}`}>
                              <AvatarFallback className="text-white font-semibold">
                                {user.name ? user.name.charAt(0) : 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-gray-900">{user.name || 'Unknown'}</p>
                              <div className="flex items-center gap-1 mt-0.5">
                                {getRoleBadge(user.role || 'member')}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="h-3 w-3 mr-1.5" />
                              {user.email || '-'}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-3 w-3 mr-1.5" />
                              {user.phone || '-'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`bg-gradient-to-r ${getLevelColor(user.level || 'Bronze')} text-white border-0`}>
                            {user.level || 'Bronze'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center text-gray-600">
                              <ShoppingBag className="h-3 w-3 mr-1" />
                              {user.totalOrders || 0} คำสั่งซื้อ
                            </div>
                            <div className="flex items-center text-gray-600">
                              <DollarSign className="h-3 w-3 mr-1" />
                              ฿{(user.totalSpent || 0).toLocaleString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(user.status || 'active')}</TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>การจัดการ</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleView(user)}>
                                <Eye className="h-4 w-4 mr-2" />
                                ดูรายละเอียด
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(user)}>
                                <Edit className="h-4 w-4 mr-2" />
                                แก้ไขข้อมูล
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(user.id)}>
                                {user.status === 'active' ? (
                                  <>
                                    <Ban className="h-4 w-4 mr-2" />
                                    ระงับบัญชี
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    เปิดใช้งาน
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(user.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                ลบบัญชี
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle>รายละเอียดผู้ใช้</DialogTitle>
                <DialogDescription>
                  ข้อมูลและสถิติการใช้งานของผู้ใช้
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* User Info */}
                <div className="flex items-start gap-4">
                  <Avatar className={`h-16 w-16 bg-gradient-to-br ${getLevelColor(selectedUser.level || 'Bronze')}`}>
                    <AvatarFallback className="text-white font-bold text-2xl">
                      {selectedUser.name ? selectedUser.name.charAt(0) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{selectedUser.name || 'Unknown'}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      {getStatusBadge(selectedUser.status || 'active')}
                      {getRoleBadge(selectedUser.role || 'member')}
                      <Badge className={`bg-gradient-to-r ${getLevelColor(selectedUser.level || 'Bronze')} text-white border-0`}>
                        {selectedUser.level || 'Bronze'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">ข้อมูลติดต่อ</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">{selectedUser.email || '-'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-600">{selectedUser.phone || '-'}</span>
                    </div>
                    <div className="flex items-start text-sm">
                      <div className="h-4 w-4 mr-2 text-gray-400">📍</div>
                      <span className="text-gray-600">{selectedUser.address || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">สถิติการใช้งาน</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-gray-900">{selectedUser.totalOrders || 0}</div>
                      <div className="text-xs text-gray-600 mt-1">คำสั่งซื้อทั้งหมด</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-gray-900">{selectedUser.wonAuctions || 0}</div>
                      <div className="text-xs text-gray-600 mt-1">ชนะการประมูล</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                      <div className="text-2xl font-bold text-gray-900">
                        ฿{(selectedUser.totalSpent || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">ยอดใช้จ่ายทั้งหมด</div>
                    </div>
                  </div>
                </div>

                {/* Member Info */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">สมัครสมาชิกเมื่อ</span>
                    <span className="font-semibold text-gray-900">
                      {selectedUser.joinedAt ? new Date(selectedUser.joinedAt).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลผู้ใช้</DialogTitle>
            <DialogDescription>
              อัปเดตข้อมูลของผู้ใช้
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">ชื่อ</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="กรอกชื่อ"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">อีเมล</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone">เบอร์โทรศัพท์</Label>
              <Input
                id="edit-phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="08x-xxx-xxxx"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-address">ที่อยู่</Label>
              <Input
                id="edit-address"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                placeholder="ที่อยู่"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleSaveEdit}>
              บันทึกข้อมูล
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
