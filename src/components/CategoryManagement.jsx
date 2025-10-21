
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    const stored = JSON.parse(localStorage.getItem('categories') || '[]');
    if (stored.length === 0) {
      const sampleCategories = [
        { id: '1', name: 'อิเล็กทรอนิกส์', description: 'สินค้าอิเล็กทรอนิกส์ทุกชนิด', order: 1 },
        { id: '2', name: 'แฟชั่น', description: 'เสื้อผ้าและเครื่องประดับ', order: 2 },
        { id: '3', name: 'ของสะสม', description: 'ของสะสมหายาก', order: 3 }
      ];
      localStorage.setItem('categories', JSON.stringify(sampleCategories));
      setCategories(sampleCategories);
    } else {
      setCategories(stored);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingId) {
      const updated = categories.map(c =>
        c.id === editingId ? { ...c, ...formData } : c
      );
      localStorage.setItem('categories', JSON.stringify(updated));
      setCategories(updated);
      toast({ title: "อัปเดตหมวดหมู่สำเร็จ" });
      setEditingId(null);
    } else {
      const newCategory = {
        ...formData,
        id: Date.now().toString(),
        order: categories.length + 1
      };
      const updated = [...categories, newCategory];
      localStorage.setItem('categories', JSON.stringify(updated));
      setCategories(updated);
      toast({ title: "เพิ่มหมวดหมู่สำเร็จ" });
      setIsAdding(false);
    }
    
    setFormData({ name: '', description: '' });
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({ name: category.name, description: category.description });
    setIsAdding(false);
  };

  const handleDelete = (id) => {
    const updated = categories.filter(c => c.id !== id);
    localStorage.setItem('categories', JSON.stringify(updated));
    setCategories(updated);
    toast({ title: "ลบหมวดหมู่สำเร็จ" });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', description: '' });
  };
  
  const commonInputClass = "w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none";

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
                  ชื่อหมวดหมู่
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={commonInputClass}
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
                />
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

      <div className="space-y-3">
        <AnimatePresence>
          {categories.map((category) => (
            <motion.div
              key={category.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{category.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleEdit(category)} variant="ghost" size="icon">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button onClick={() => handleDelete(category.id)} variant="ghost" size="icon" className="text-red-500 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CategoryManagement;
