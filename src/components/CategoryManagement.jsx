import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, GripVertical, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { apiService } from '@/services/api';
import Swal from 'sweetalert2';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    icon: '', 
    status: 'active' 
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await apiService.categories.getAll();
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลหมวดหมู่ได้",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await apiService.categories.update(editingId, formData);
        toast({ 
          title: "อัปเดตหมวดหมู่สำเร็จ",
          description: "บันทึกข้อมูลเรียบร้อยแล้ว" 
        });
        setEditingId(null);
      } else {
        await apiService.categories.create(formData);
        toast({ 
          title: "เพิ่มหมวดหมู่สำเร็จ",
          description: "เพิ่มหมวดหมู่ใหม่เรียบร้อยแล้ว" 
        });
        setIsAdding(false);
      }
      
      setFormData({ name: '', description: '', icon: '', status: 'active' });
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      
      let errorMessage = "ไม่สามารถบันทึกข้อมูลได้";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast({
        title: "เกิดข้อผิดพลาด",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({ 
      name: category.name, 
      description: category.description || '',
      icon: category.icon || '',
      status: category.status || 'active'
    });
    setIsAdding(false);
  };

  const handleDelete = async (id, categoryName) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ',
      html: `คุณต้องการลบหมวดหมู่ <strong>${categoryName}</strong> ใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
      background: '#1f2937',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await apiService.categories.delete(id);
        toast({ 
          title: "ลบหมวดหมู่สำเร็จ",
          description: `ลบหมวดหมู่ ${categoryName} เรียบร้อยแล้ว` 
        });
        loadCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        
        let errorMessage = "ไม่สามารถลบหมวดหมู่ได้";
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        Swal.fire({
          title: 'ไม่สามารถลบได้',
          text: errorMessage,
          icon: 'error',
          confirmButtonColor: '#3b82f6',
          background: '#1f2937',
          color: '#fff'
        });
      }
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', description: '', icon: '', status: 'active' });
  };
  
  const commonInputClass = "w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">กำลังโหลด...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">หมวดหมู่สินค้า</h1>
        {!isAdding && !editingId && (
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มหมวดหมู่
          </Button>
        )}
      </div>

      <AnimatePresence>
        {(isAdding || editingId) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 mb-6 overflow-hidden"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingId ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  ชื่อหมวดหมู่ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={commonInputClass}
                  placeholder="เช่น อิเล็กทรอนิกส์, ของสะสม"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  คำอธิบาย
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`${commonInputClass} min-h-[80px]`}
                  placeholder="อธิบายเกี่ยวกับหมวดหมู่นี้"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  ไอคอน (ไม่บังคับ)
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className={commonInputClass}
                  placeholder="เช่น 🎮, 📱, 👕"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  สถานะ
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className={commonInputClass}
                >
                  <option value="active">เปิดใช้งาน</option>
                  <option value="inactive">ปิดใช้งาน</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit">
                  {editingId ? 'บันทึกการแก้ไข' : 'เพิ่มหมวดหมู่'}
                </Button>
                <Button type="button" onClick={handleCancel} variant="outline">
                  ยกเลิก
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {categories.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">ยังไม่มีหมวดหมู่</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">เริ่มต้นด้วยการเพิ่มหมวดหมู่แรกของคุณ</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {categories.map((category) => (
              <motion.div
                key={category.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                    {category.icon && (
                      <span className="text-2xl">{category.icon}</span>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {category.name}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          category.status === 'active' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {category.status === 'active' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                        </span>
                      </div>
                      {category.description && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleEdit(category)} 
                      variant="ghost" 
                      size="icon"
                      className="hover:bg-blue-50 dark:hover:bg-blue-900"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      onClick={() => handleDelete(category.id, category.name)} 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;

