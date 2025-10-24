import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const ProductEdit = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startPrice: '',
    price: '',
    minBidIncrement: '10',
    condition: 'new',
    status: 'active',
    category: '',
    brand: '',
    shippingCost: '',
    location: '',
    auction: {
      startTime: '',
      endTime: ''
    },
    images: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);

  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

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

    if (id) {
      fetchProduct();
    }
  }, [user, isAuthenticated, navigate, id, authLoading]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await apiService.products.getById(id);
      const productData = response.data.data;
      
      console.log('Fetched product data:', productData);
      
      // Parse images - check multiple sources
      let imagesArray = [];
      
      // Try to get from images field (JSON)
      if (productData.images) {
        if (typeof productData.images === 'string') {
          try {
            const parsed = JSON.parse(productData.images);
            if (Array.isArray(parsed) && parsed.length > 0) {
              imagesArray = parsed;
            }
          } catch (e) {
            // If parse fails, treat as single URL
            if (productData.images) {
              imagesArray = [productData.images];
            }
          }
        } else if (Array.isArray(productData.images)) {
          imagesArray = productData.images;
        }
      }
      
      // If no images from JSON, try image_url
      if (imagesArray.length === 0 && productData.image_url) {
        imagesArray = [productData.image_url];
      }
      
      // If still no images, try primary_image
      if (imagesArray.length === 0 && productData.primary_image) {
        imagesArray = [productData.primary_image];
      }

      console.log('Parsed images:', imagesArray);
      
      // ✅ Format dates for datetime-local input (แปลง UTC → Bangkok timezone)
      const formatDateTime = (dateString) => {
        if (!dateString) return '';
        // แปลง UTC → Bangkok timezone แล้วแปลงเป็นรูปแบบ datetime-local
        const bangkokTime = dayjs.utc(dateString).tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm');
        return bangkokTime;
      };

      setFormData({
        name: productData.name || '',
        description: productData.description || '',
        startPrice: productData.starting_price || '',
        price: productData.buy_now_price || '',
        minBidIncrement: productData.min_bid_increment || '10',
        condition: productData.condition_status || 'new',
        status: productData.status || 'active',
        category: productData.category || productData.category_id || '',
        brand: productData.brand || '',
        shippingCost: productData.shipping_cost || '',
        location: productData.location || '',
        auction: {
          startTime: formatDateTime(productData.auction_start),
          endTime: formatDateTime(productData.auction_end)
        },
        images: imagesArray
      });

      setPreviewImages(imagesArray);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลสินค้าได้",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const uploadFormData = new FormData();
        uploadFormData.append('images', file);

        const response = await apiService.upload.images(uploadFormData);
        
        if (response.data.success && response.data.urls && response.data.urls.length > 0) {
          return response.data.urls[0];
        } else {
          throw new Error('Upload failed');
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
      setPreviewImages(prev => [...prev, ...uploadedUrls]);
      
      toast({
        title: "อัปโหลดสำเร็จ",
        description: `อัปโหลด ${uploadedUrls.length} รูปภาพแล้ว`,
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถอัปโหลดรูปภาพได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // ✅ แปลงเวลาจาก Bangkok timezone → UTC ISO string
      const auctionStartUTC = formData.auction.startTime 
        ? dayjs.tz(formData.auction.startTime, 'Asia/Bangkok').utc().format()
        : null;
      
      const auctionEndUTC = formData.auction.endTime 
        ? dayjs.tz(formData.auction.endTime, 'Asia/Bangkok').utc().format()
        : null;
      
      console.log('🕐 Auction Times (Edit):', {
        startTimeInput: formData.auction.startTime,
        endTimeInput: formData.auction.endTime,
        startTimeUTC: auctionStartUTC,
        endTimeUTC: auctionEndUTC
      });
      
      const productData = {
        name: formData.name,
        description: formData.description,
        starting_price: parseFloat(formData.startPrice),
        current_price: parseFloat(formData.startPrice),
        buy_now_price: formData.price ? parseFloat(formData.price) : null,
        min_bid_increment: formData.minBidIncrement ? parseFloat(formData.minBidIncrement) : 10,
        condition_status: formData.condition,
        status: formData.status,
        category_id: formData.category ? parseInt(formData.category) : null,
        brand: formData.brand || null,
        shipping_cost: formData.shippingCost ? parseFloat(formData.shippingCost) : null,
        location: formData.location || null,
        auction_start: auctionStartUTC,
        auction_end: auctionEndUTC,
        images: formData.images,
        image_url: formData.images[0] || null
      };

      const response = await apiService.products.update(id, productData);
      
      if (response.data.success) {
        toast({
          title: "อัปเดตสำเร็จ",
          description: "บันทึกข้อมูลสินค้าแล้ว",
        });
        navigate('/admin/products');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลได้",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">กำลังโหลด...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="relative bg-black rounded-2xl shadow-xl p-10 overflow-hidden border border-gray-800">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
        
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
              แก้ไขสินค้า
            </h1>
            <p className="text-gray-400 text-base">
              อัปเดตข้อมูลสินค้าในระบบ
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/admin/products')}
            className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับ
          </Button>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลสินค้า</CardTitle>
            <CardDescription>แก้ไขข้อมูลสินค้าที่ต้องการเปลี่ยนแปลง</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">ชื่อสินค้า *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="กรอกชื่อสินค้า"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">แบรนด์</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    placeholder="กรอกแบรนด์"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">รายละเอียดสินค้า</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="อธิบายรายละเอียดสินค้า"
                  rows={4}
                />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startPrice">ราคาเปิด *</Label>
                  <Input
                    id="startPrice"
                    type="number"
                    value={formData.startPrice}
                    onChange={(e) => handleInputChange('startPrice', e.target.value)}
                    placeholder="0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">ราคาซื้อทันที</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minBidIncrement">บิทขั้นต่ำ *</Label>
                  <Input
                    id="minBidIncrement"
                    type="number"
                    value={formData.minBidIncrement}
                    onChange={(e) => handleInputChange('minBidIncrement', e.target.value)}
                    placeholder="10"
                    required
                  />
                  <p className="text-xs text-gray-500">จำนวนเงินขั้นต่ำที่ต้องเพิ่มในแต่ละครั้งที่ประมูล</p>
                </div>
              </div>

              {/* Product Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="condition">สภาพสินค้า</Label>
                  <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกสภาพสินค้า" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">ใหม่</SelectItem>
                      <SelectItem value="like_new">เหมือนใหม่</SelectItem>
                      <SelectItem value="good">ดี</SelectItem>
                      <SelectItem value="fair">พอใช้</SelectItem>
                      <SelectItem value="poor">เก่า</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">หมวดหมู่</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    placeholder="กรอกหมวดหมู่"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">สถานะ</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกสถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">ใช้งาน</SelectItem>
                      <SelectItem value="inactive">ไม่ใช้งาน</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Shipping */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="shippingCost">ค่าจัดส่ง</Label>
                  <Input
                    id="shippingCost"
                    type="number"
                    value={formData.shippingCost}
                    onChange={(e) => handleInputChange('shippingCost', e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">สถานที่</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="กรอกสถานที่"
                  />
                </div>
              </div>

              {/* Auction Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startTime">วันที่เริ่มประมูล</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={formData.auction.startTime}
                    onChange={(e) => handleInputChange('auction.startTime', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">วันที่สิ้นสุดประมูล</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={formData.auction.endTime}
                    onChange={(e) => handleInputChange('auction.endTime', e.target.value)}
                  />
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <Label>รูปภาพสินค้า</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="images" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          คลิกเพื่ออัปโหลดรูปภาพ
                        </span>
                        <input
                          id="images"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e.target.files)}
                          className="sr-only"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Preview Images */}
                {previewImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {previewImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/products')}
                >
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={saving || uploading}>
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      กำลังบันทึก...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      บันทึกการแก้ไข
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ProductEdit;
