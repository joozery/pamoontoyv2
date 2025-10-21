
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Package, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import ProductDialog from '@/components/ProductDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    const stored = JSON.parse(localStorage.getItem('products') || '[]');
    setProducts(stored);
  };

  const handleDelete = (id) => {
    const updated = products.filter(p => p.id !== id);
    localStorage.setItem('products', JSON.stringify(updated));
    setProducts(updated);
    toast({
      title: "ลบสินค้าสำเร็จ",
      description: "ลบสินค้าออกจากระบบแล้ว",
    });
  };

  const handleToggleStatus = (id) => {
    const updated = products.map(p => 
      p.id === id ? { ...p, status: p.status === 'active' ? 'hidden' : 'active' } : p
    );
    localStorage.setItem('products', JSON.stringify(updated));
    setProducts(updated);
    toast({
      title: "อัปเดตสถานะสำเร็จ",
      description: "เปลี่ยนสถานะสินค้าแล้ว",
    });
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาสินค้า..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มสินค้า
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">สินค้า</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">สถานะ</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">ราคา</th>
                <th className="px-6 py-3 text-right font-medium text-gray-500 dark:text-gray-400"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              <AnimatePresence>
                {filteredProducts.map((product) => (
                  <motion.tr
                    key={product.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-md"
                        />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{product.name}</p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400' :
                        product.status === 'sold' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                        <span className={`h-2 w-2 rounded-full ${
                          product.status === 'active' ? 'bg-green-500' :
                          product.status === 'sold' ? 'bg-red-500' :
                          'bg-gray-500'
                        }`}></span>
                        {product.status === 'active' ? 'พร้อมขาย' :
                         product.status === 'sold' ? 'ขายแล้ว' : 'ซ่อน'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">฿{product.price.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(product)}>
                            <Edit className="w-4 h-4 mr-2" /> แก้ไข
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(product.id)}>
                            {product.status === 'active' ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                            {product.status === 'active' ? 'ซ่อน' : 'แสดง'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(product.id)} className="text-red-500">
                            <Trash2 className="w-4 h-4 mr-2" /> ลบ
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

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">ไม่พบสินค้า</p>
        </div>
      )}

      <ProductDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onSave={loadProducts}
      />
    </div>
  );
};

export default ProductManagement;
