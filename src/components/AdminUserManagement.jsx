import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Search, UserCog, Shield, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Swal from 'sweetalert2';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'member'
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
      Swal.fire({
        title: 'ไม่มีสิทธิ์เข้าถึง',
        text: 'คุณต้องเป็น Admin ถึงจะเข้าถึงหน้านี้ได้',
        icon: 'error'
      }).then(() => {
        navigate('/admin/dashboard');
      });
      return;
    }

    fetchUsers();
  }, [user, isAuthenticated, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiService.admin.getAdminUsers();
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      
      if (error.response?.status === 403) {
        Swal.fire({
          title: 'ไม่มีสิทธิ์เข้าถึง',
          text: 'คุณต้องเป็น Admin ถึงจะเข้าถึงหน้านี้ได้',
          icon: 'error'
        }).then(() => {
          navigate('/admin/dashboard');
        });
      } else if (error.response?.status === 401) {
        Swal.fire({
          title: 'กรุณาเข้าสู่ระบบ',
          text: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่',
          icon: 'warning'
        }).then(() => {
          navigate('/admin/login');
        });
      } else {
        Swal.fire({
          title: 'เกิดข้อผิดพลาด!',
          text: 'ไม่สามารถโหลดข้อมูล users',
          icon: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'member'
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      phone: user.phone || '',
      role: user.role
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name || !formData.email) {
      Swal.fire({
        title: 'กรุณากรอกข้อมูล!',
        text: 'กรุณากรอกชื่อและอีเมล',
        icon: 'warning'
      });
      return;
    }

    if (!editingUser && !formData.password) {
      Swal.fire({
        title: 'กรุณากรอกรหัสผ่าน!',
        text: 'กรุณากรอกรหัสผ่านสำหรับ user ใหม่',
        icon: 'warning'
      });
      return;
    }

    try {
      const url = editingUser 
        ? `https://api.pamoontoy.site/api/admin/users/${editingUser.id}`
        : 'https://api.pamoontoy.site/api/admin/users';
      
      const method = editingUser ? 'PUT' : 'POST';
      
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role
      };

      // Only include password if provided
      if (formData.password) {
        payload.password = formData.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          title: 'สำเร็จ!',
          text: editingUser ? 'อัปเดต user แล้ว' : 'สร้าง user ใหม่แล้ว',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        fetchUsers();
        setIsDialogOpen(false);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error saving user:', error);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: error.message || 'ไม่สามารถบันทึกข้อมูล',
        icon: 'error'
      });
    }
  };

  const handleDelete = async (userId) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ?',
      text: 'คุณต้องการลบ user นี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`https://api.pamoontoy.site/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const data = await response.json();

        if (data.success) {
          Swal.fire({
            title: 'ลบสำเร็จ!',
            text: 'ลบ user แล้ว',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
          fetchUsers();
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        Swal.fire({
          title: 'เกิดข้อผิดพลาด!',
          text: error.message || 'ไม่สามารถลบ user',
          icon: 'error'
        });
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'vip':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-3 h-3" />;
      case 'vip':
        return <UserCog className="w-3 h-3" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        <span className="ml-2 text-gray-600">กำลังโหลด...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="relative bg-black rounded-2xl shadow-xl p-10 overflow-hidden border border-gray-800">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
        
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              จัดการ Admin Users
            </h1>
            <p className="text-gray-400 text-base">
              สร้างและจัดการบัญชี Admin เท่านั้น
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20">
            <div className="text-white text-center">
              <p className="text-xs text-gray-400 mb-1">Admin Users</p>
              <p className="text-3xl font-bold">{users.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Action Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหา user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-black focus:border-black transition-all"
          />
        </div>
        <Button 
          onClick={handleAdd}
          className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all font-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          เพิ่ม User
        </Button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black border-b border-gray-800">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-white text-xs uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left font-bold text-white text-xs uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left font-bold text-white text-xs uppercase tracking-wider">Level</th>
                <th className="px-6 py-4 text-left font-bold text-white text-xs uppercase tracking-wider">Orders</th>
                <th className="px-6 py-4 text-right font-bold text-white text-xs uppercase tracking-wider">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <AnimatePresence>
                {filteredUsers.map((user) => (
                  <motion.tr
                    key={user.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="hover:bg-gray-50 transition-all duration-150 group"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {user.name}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">{user.email}</p>
                        {user.phone && (
                          <p className="text-gray-400 text-xs mt-0.5">{user.phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${getRoleBadgeClass(user.role)}`}>
                        {getRoleIcon(user.role)}
                        {user.role === 'admin' ? 'Admin' :
                         user.role === 'vip' ? 'VIP' : 'Member'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 font-medium">{user.level}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{user.total_orders || 0}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(user)}
                          className="hover:bg-gray-100 text-gray-700 rounded-md p-2"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                          className="hover:bg-red-50 text-red-600 rounded-md p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 bg-white rounded-xl border border-gray-200"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <UserCog className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">ไม่พบ user</h3>
          <p className="text-gray-500 text-sm mb-6">ลองค้นหาด้วยคำอื่นหรือเพิ่ม user ใหม่</p>
          <Button 
            onClick={handleAdd}
            className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            เพิ่ม User แรก
          </Button>
        </motion.div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingUser ? 'แก้ไข User' : 'เพิ่ม User ใหม่'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อ *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ชื่อผู้ใช้"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                อีเมล *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รหัสผ่าน {!editingUser && '*'}
                {editingUser && <span className="text-xs text-gray-500 ml-2">(เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยน)</span>}
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingUser ? 'ใส่รหัสผ่านใหม่ถ้าต้องการเปลี่ยน' : 'รหัสผ่าน'}
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เบอร์โทรศัพท์
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0812345678"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="เลือก role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member (สมาชิกทั่วไป)</SelectItem>
                  <SelectItem value="vip">VIP (สมาชิก VIP)</SelectItem>
                  <SelectItem value="admin">Admin (ผู้ดูแลระบบ)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="px-6"
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleSave}
              className="bg-black hover:bg-gray-800 text-white px-6"
            >
              {editingUser ? 'บันทึก' : 'สร้าง User'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUserManagement;






