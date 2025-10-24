
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Upload, X, Image as ImageIcon, Calendar, DollarSign, Tag, MapPin, Truck, Package } from 'lucide-react';
import LexicalEditor from '@/components/ui/LexicalEditor';

const ProductDialog = ({ isOpen, onClose, product, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    startPrice: '',
    currentPrice: '',
    image: '',
    images: [],
    status: 'active',
    category: '',
    condition: 'new',
    brand: '',
    tags: [],
    shippingCost: '',
    location: '',
    seller: {
      name: '',
      rating: 0,
      totalSales: 0,
      avatar: ''
    },
    auction: {
      startTime: '',
      endTime: '',
      bidCount: 0,
      viewCount: 0
    },
    specifications: {},
    features: []
  });

  useEffect(() => {
    if (isOpen) {
      if (product) {
        console.log('ProductDialog received product:', product);
        
        // Parse images if it's a JSON string
        let imagesArray = [];
        if (product.images) {
          if (typeof product.images === 'string') {
            try {
              imagesArray = JSON.parse(product.images);
            } catch (e) {
              imagesArray = [];
            }
          } else if (Array.isArray(product.images)) {
            imagesArray = product.images;
          }
        }
        
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.buy_now_price || product.price || '',
          startPrice: product.starting_price || product.startPrice || '',
          currentPrice: product.current_price || product.currentPrice || '',
          image: product.image_url || product.image || '',
          images: imagesArray,
          status: product.status || 'active',
          category: product.category || '',
          condition: product.condition_status || product.condition || 'new',
          brand: product.brand || '',
          tags: product.tags || [],
          shippingCost: product.shipping_cost || product.shippingCost || '',
          location: product.location || '',
          seller: product.seller || {
            name: '',
            rating: 0,
            totalSales: 0,
            avatar: ''
          },
          auction: {
            startTime: product.auction_start || product.auction?.startTime || '',
            endTime: product.auction_end || product.auction?.endTime || '',
            bidCount: product.bid_count || product.auction?.bidCount || 0,
            viewCount: product.view_count || product.auction?.viewCount || 0
          },
          specifications: product.specifications || {},
          features: product.features || []
        });
      } else {
        setFormData({
          name: '',
          description: '',
          price: '',
          startPrice: '',
          currentPrice: '',
          image: '',
          images: [],
          status: 'active',
          category: '',
          condition: 'new',
          brand: '',
          tags: [],
          shippingCost: '',
          location: '',
          seller: {
            name: '',
            rating: 0,
            totalSales: 0,
            avatar: ''
          },
          auction: {
            startTime: '',
            endTime: '',
            bidCount: 0,
            viewCount: 0
          },
          specifications: {},
          features: []
        });
      }
    }
  }, [product, isOpen]);

  const [uploadedImages, setUploadedImages] = useState([]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image'
    }));
    setUploadedImages([...uploadedImages, ...newImages]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const newImages = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image'
    }));
    setUploadedImages([...uploadedImages, ...newImages]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeImage = (id) => {
    setUploadedImages(uploadedImages.filter(img => img.id !== id));
  };

  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag]
      });
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const uploadToCloudinary = async (file) => {
    // Use backend API to upload to Cloudinary
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await fetch(
        `https://api.pamoontoy.site/api/upload/image`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        }
      );
      const data = await response.json();
      if (data.success) {
        return data.url;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Show loading toast
    if (uploadedImages.length > 0) {
      toast({
        title: "กำลังอัปโหลดรูปภาพ...",
        description: `อัปโหลด ${uploadedImages.length} ไฟล์`
      });
    }
    
    // Upload images to Cloudinary
    const uploadedUrls = [];
    for (const img of uploadedImages) {
      try {
        const url = await uploadToCloudinary(img.file);
        uploadedUrls.push(url);
      } catch (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถอัปโหลดรูปภาพได้",
          variant: "destructive"
        });
        return;
      }
    }
    
    // Transform formData to API format
    const productData = {
      name: formData.name,
      description: formData.description,
      startPrice: formData.startPrice,
      currentPrice: formData.currentPrice,
      price: formData.price,
      condition: formData.condition,
      brand: formData.brand,
      category: formData.category,
      shippingCost: formData.shippingCost,
      location: formData.location,
      status: formData.status,
      auction: formData.auction,
      tags: formData.tags,
      images: uploadedUrls.length > 0 ? uploadedUrls : []
    };
    
    // Call onSave with transformed data
    await onSave(productData);
  };
  
  const commonInputClass = "w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            {product ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
          </DialogTitle>
          <DialogDescription>
            กรอกรายละเอียดสินค้าด้านล่าง
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4 max-h-[70vh] overflow-y-auto">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Package className="w-5 h-5 mr-2" />
              ข้อมูลพื้นฐาน
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ชื่อสินค้า
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ชื่อสินค้า"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                รายละเอียด
              </label>
              <LexicalEditor
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                placeholder="รายละเอียดสินค้า"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  หมวดหมู่
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">เลือกหมวดหมู่</option>
                  <option value="toys">ของเล่น</option>
                  <option value="figures">ฟิกเกอร์</option>
                  <option value="models">โมเดล</option>
                  <option value="cards">การ์ด</option>
                  <option value="electronics">อิเล็กทรอนิกส์</option>
                  <option value="fashion">แฟชั่น</option>
                  <option value="home">ของใช้ในบ้าน</option>
                  <option value="sports">กีฬา</option>
                  <option value="books">หนังสือ</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  สภาพสินค้า
                </label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="new">ใหม่ (New)</option>
                  <option value="like_new">เหมือนใหม่ (Like New)</option>
                  <option value="good">ดี (Good)</option>
                  <option value="fair">ปานกลาง (Fair)</option>
                  <option value="poor">ไม่ค่อยดี (Poor)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                แบรนด์
              </label>
              <Input
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="แบรนด์สินค้า"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              ราคาและการประมูล
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ราคาเริ่มต้น
                </label>
                <Input
                  type="number"
                  value={formData.startPrice}
                  onChange={(e) => setFormData({ ...formData, startPrice: e.target.value })}
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  บิดขั้นต่ำ
                </label>
                <Input
                  type="number"
                  value={formData.currentPrice}
                  onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ราคาซื้อทันที
                </label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <ImageIcon className="w-5 h-5 mr-2" />
              รูปภาพสินค้า
            </h3>
            
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                type="file"
                id="image-upload"
                multiple
                accept="image/*,video/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600">คลิกหรือลากไฟล์มาวางที่นี่</span>
                <span className="text-xs text-gray-500">PNG, JPG, JPEG, MP4, MOV สูงสุด 10MB</span>
              </label>
            </div>

            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {uploadedImages.map((img) => (
                  <div key={img.id} className="relative">
                    {img.type === 'video' ? (
                      <video
                        src={img.preview}
                        className="w-full h-24 object-cover rounded-lg"
                        controls
                      />
                    ) : (
                      <img
                        src={img.preview}
                        alt="Preview"
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                      {img.type === 'video' ? 'วิดีโอ' : 'รูปภาพ'}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Tag className="w-5 h-5 mr-2" />
              แท็กสินค้า
            </h3>
            
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <Input
                placeholder="เพิ่มแท็กใหม่"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(e.target.value);
                    e.target.value = '';
                  }
                }}
              />
            </div>
          </div>

          {/* Shipping & Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Truck className="w-5 h-5 mr-2" />
              การจัดส่งและสถานที่
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ค่าจัดส่ง
                </label>
                <Input
                  type="number"
                  value={formData.shippingCost}
                  onChange={(e) => setFormData({ ...formData, shippingCost: e.target.value })}
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  สถานที่
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="กรุงเทพฯ"
                />
              </div>
            </div>
          </div>

          {/* Auction Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              การตั้งค่าการประมูล
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  วันที่เริ่มประมูล
                </label>
                <Input
                  type="datetime-local"
                  value={formData.auction.startTime}
                  onChange={(e) => setFormData({
                    ...formData,
                    auction: { ...formData.auction, startTime: e.target.value }
                  })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  วันที่สิ้นสุดประมูล
                </label>
                <Input
                  type="datetime-local"
                  value={formData.auction.endTime}
                  onChange={(e) => setFormData({
                    ...formData,
                    auction: { ...formData.auction, endTime: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>


          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              สถานะ
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="active">แสดง</option>
              <option value="hidden">ซ่อน</option>
              <option value="draft">ร่าง</option>
            </select>
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
