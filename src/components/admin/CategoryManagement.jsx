import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Save, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import apiService from '@/services/api';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiService.categories.getAll();
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดหมวดหมู่ได้",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'กรุณากรอกชื่อหมวดหมู่';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'ชื่อหมวดหมู่ต้องมีอย่างน้อย 2 ตัวอักษร';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'กรุณากรอกคำอธิบาย';
    } else if (formData.description.trim().length < 5) {
      errors.description = 'คำอธิบายต้องมีอย่างน้อย 5 ตัวอักษร';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle add category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const response = await apiService.categories.create(formData);
      
      toast({
        title: "สำเร็จ",
        description: "เพิ่มหมวดหมู่เรียบร้อยแล้ว"
      });
      
      setFormData({ name: '', description: '' });
      setShowAddForm(false);
      fetchCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.response?.data?.message || "ไม่สามารถเพิ่มหมวดหมู่ได้",
        variant: "destructive"
      });
    }
  };

  // Handle edit category
  const handleEditCategory = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await apiService.categories.update(editingCategory.id, formData);
      
      toast({
        title: "สำเร็จ",
        description: "แก้ไขหมวดหมู่เรียบร้อยแล้ว"
      });
      
      setFormData({ name: '', description: '' });
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.response?.data?.message || "ไม่สามารถแก้ไขหมวดหมู่ได้",
        variant: "destructive"
      });
    }
  };

  // Handle delete category
  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่ "${categoryName}"?`)) {
      return;
    }
    
    try {
      await apiService.categories.delete(categoryId);
      
      toast({
        title: "สำเร็จ",
        description: "ลบหมวดหมู่เรียบร้อยแล้ว"
      });
      
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.response?.data?.message || "ไม่สามารถลบหมวดหมู่ได้",
        variant: "destructive"
      });
    }
  };

  // Start editing
  const startEditing = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description
    });
    setFormErrors({});
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setFormErrors({});
  };

  // Cancel adding
  const cancelAdding = () => {
    setShowAddForm(false);
    setFormData({ name: '', description: '' });
    setFormErrors({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">จัดการหมวดหมู่</h2>
          <p className="text-gray-600">เพิ่ม แก้ไข และลบหมวดหมู่สินค้า</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มหมวดหมู่</span>
        </motion.button>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">หมวดหมู่ทั้งหมด ({categories.length})</h3>
          
          {categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>ยังไม่มีหมวดหมู่</p>
              <p className="text-sm">คลิก "เพิ่มหมวดหมู่" เพื่อเริ่มต้น</p>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{category.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => startEditing(category)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteCategory(category.id, category.name)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {(showAddForm || editingCategory) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                if (showAddForm) cancelAdding();
                if (editingCategory) cancelEditing();
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingCategory ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
                </h3>
                <button
                  onClick={editingCategory ? cancelEditing : cancelAdding}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={editingCategory ? handleEditCategory : handleAddCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อหมวดหมู่ *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="เช่น ของเล่น, ฟิกเกอร์, โมเดล"
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    คำอธิบาย *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none ${
                      formErrors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="อธิบายเกี่ยวกับหมวดหมู่นี้"
                  />
                  {formErrors.description && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={editingCategory ? cancelEditing : cancelAdding}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    ยกเลิก
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingCategory ? 'บันทึกการแก้ไข' : 'เพิ่มหมวดหมู่'}</span>
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoryManagement;
