
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

const ProductDialog = ({ isOpen, onClose, product, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    status: 'active',
    category: ''
  });

  useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        image: '',
        status: 'active',
        category: ''
      });
    }
  }, [product, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    
    if (product) {
      const updated = products.map(p => p.id === product.id ? { ...formData, id: product.id } : p);
      localStorage.setItem('products', JSON.stringify(updated));
      toast({
        title: "อัปเดตสินค้าสำเร็จ",
        description: "แก้ไขข้อมูลสินค้าแล้ว",
      });
    } else {
      const newProduct = {
        ...formData,
        id: Date.now().toString(),
        price: parseFloat(formData.price),
        createdAt: new Date().toISOString()
      };
      products.push(newProduct);
      localStorage.setItem('products', JSON.stringify(products));
      toast({
        title: "เพิ่มสินค้าสำเร็จ",
        description: "เพิ่มสินค้าใหม่เข้าระบบแล้ว",
      });
    }
    
    onSave();
    onClose();
  };
  
  const commonInputClass = "w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            {product ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
          </DialogTitle>
          <DialogDescription>
            กรอกรายละเอียดสินค้าด้านล่าง
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              ชื่อสินค้า
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
              รายละเอียด
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`${commonInputClass} min-h-[100px]`}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                ราคา (บาท)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className={commonInputClass}
                required
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
                <option value="active">พร้อมขาย</option>
                <option value="sold">ขายแล้ว</option>
                <option value="hidden">ซ่อน</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              URL รูปภาพ
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className={commonInputClass}
              placeholder="https://example.com/image.jpg"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              หมวดหมู่
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={commonInputClass}
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" onClick={onClose} variant="outline">
              ยกเลิก
            </Button>
            <Button type="submit">
              {product ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog;
