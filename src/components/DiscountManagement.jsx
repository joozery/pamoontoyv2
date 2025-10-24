import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  ToggleLeft, 
  ToggleRight,
  Calendar,
  Percent,
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { apiService } from '@/services/api';

const DiscountManagement = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [usageData, setUsageData] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_amount: '',
    max_discount_amount: '',
    usage_limit: '',
    valid_from: '',
    valid_until: '',
    is_active: true
  });

  useEffect(() => {
    fetchDiscounts();
  }, [searchTerm, statusFilter]);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      
      const response = await apiService.discounts.getAll(params);
      setDiscounts(response.data.data);
    } catch (err) {
      console.error('Error fetching discounts:', err);
      setError('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsageData = async (discountId) => {
    try {
      const response = await apiService.discounts.getUsage(discountId);
      setUsageData(response.data.data);
    } catch (err) {
      console.error('Error fetching usage data:', err);
    }
  };

  const handleCreate = async () => {
    try {
      await apiService.discounts.create(formData);
      setIsCreateDialogOpen(false);
      resetForm();
      fetchDiscounts();
    } catch (err) {
      console.error('Error creating discount:', err);
    }
  };

  const handleUpdate = async () => {
    try {
      await apiService.discounts.update(selectedDiscount.id, formData);
      setIsEditDialogOpen(false);
      resetForm();
      fetchDiscounts();
    } catch (err) {
      console.error('Error updating discount:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบโค้ดส่วนลดนี้?')) {
      try {
        await apiService.discounts.delete(id);
        fetchDiscounts();
      } catch (err) {
        console.error('Error deleting discount:', err);
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await apiService.discounts.toggle(id);
      fetchDiscounts();
    } catch (err) {
      console.error('Error toggling discount:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      min_order_amount: '',
      max_discount_amount: '',
      usage_limit: '',
      valid_from: '',
      valid_until: '',
      is_active: true
    });
    setSelectedDiscount(null);
  };

  const openEditDialog = (discount) => {
    setSelectedDiscount(discount);
    setFormData({
      code: discount.code,
      description: discount.description,
      discount_type: discount.discount_type,
      discount_value: discount.discount_value,
      min_order_amount: discount.min_order_amount || '',
      max_discount_amount: discount.max_discount_amount || '',
      usage_limit: discount.usage_limit || '',
      valid_from: discount.valid_from ? discount.valid_from.split('T')[0] : '',
      valid_until: discount.valid_until ? discount.valid_until.split('T')[0] : '',
      is_active: discount.is_active
    });
    setIsEditDialogOpen(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH');
  };

  const getStatusBadge = (discount) => {
    const now = new Date();
    const validFrom = discount.valid_from ? new Date(discount.valid_from) : null;
    const validUntil = discount.valid_until ? new Date(discount.valid_until) : null;
    
    if (!discount.is_active) {
      return <Badge variant="secondary">ปิดใช้งาน</Badge>;
    }
    
    if (validFrom && now < validFrom) {
      return <Badge variant="outline">ยังไม่เริ่ม</Badge>;
    }
    
    if (validUntil && now > validUntil) {
      return <Badge variant="destructive">หมดอายุ</Badge>;
    }
    
    return <Badge variant="default">ใช้งานได้</Badge>;
  };

  const getDiscountText = (discount) => {
    if (discount.discount_type === 'percentage') {
      return `${discount.discount_value}%`;
    } else {
      return formatCurrency(discount.discount_value);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">จัดการโค้ดส่วนลด</h1>
          <p className="text-muted-foreground">
            จัดการโค้ดส่วนลดและโปรโมชั่นต่างๆ
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มโค้ดส่วนลด
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>เพิ่มโค้ดส่วนลดใหม่</DialogTitle>
              <DialogDescription>
                สร้างโค้ดส่วนลดใหม่สำหรับลูกค้า
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">รหัสโค้ด</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    placeholder="WELCOME10"
                  />
                </div>
                <div>
                  <Label htmlFor="discount_type">ประเภทส่วนลด</Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(value) => setFormData({...formData, discount_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">เปอร์เซ็นต์</SelectItem>
                      <SelectItem value="fixed">จำนวนเงินคงที่</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">คำอธิบาย</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="ส่วนลดต้อนรับลูกค้าใหม่"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount_value">
                    {formData.discount_type === 'percentage' ? 'เปอร์เซ็นต์ (%)' : 'จำนวนเงิน (฿)'}
                  </Label>
                  <Input
                    id="discount_value"
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
                    placeholder={formData.discount_type === 'percentage' ? '10' : '100'}
                  />
                </div>
                <div>
                  <Label htmlFor="min_order_amount">ยอดสั่งซื้อขั้นต่ำ (฿)</Label>
                  <Input
                    id="min_order_amount"
                    type="number"
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData({...formData, min_order_amount: e.target.value})}
                    placeholder="500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max_discount_amount">ส่วนลดสูงสุด (฿)</Label>
                  <Input
                    id="max_discount_amount"
                    type="number"
                    value={formData.max_discount_amount}
                    onChange={(e) => setFormData({...formData, max_discount_amount: e.target.value})}
                    placeholder="1000"
                  />
                </div>
                <div>
                  <Label htmlFor="usage_limit">จำนวนครั้งที่ใช้ได้</Label>
                  <Input
                    id="usage_limit"
                    type="number"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({...formData, usage_limit: e.target.value})}
                    placeholder="100"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valid_from">วันที่เริ่มต้น</Label>
                  <Input
                    id="valid_from"
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="valid_until">วันที่สิ้นสุด</Label>
                  <Input
                    id="valid_until"
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label htmlFor="is_active">เปิดใช้งาน</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button onClick={handleCreate}>
                สร้างโค้ดส่วนลด
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาโค้ดส่วนลด..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="สถานะทั้งหมด" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">สถานะทั้งหมด</SelectItem>
                <SelectItem value="active">ใช้งานได้</SelectItem>
                <SelectItem value="inactive">ปิดใช้งาน</SelectItem>
                <SelectItem value="expired">หมดอายุ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Discount Codes List */}
      <div className="grid gap-4">
        {discounts.map((discount) => (
          <Card key={discount.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-lg font-semibold">{discount.code}</h3>
                    {getStatusBadge(discount)}
                    <div className="flex items-center gap-2">
                      {discount.discount_type === 'percentage' ? (
                        <Percent className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="font-medium">{getDiscountText(discount)}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {discount.description}
                  </p>
                  
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    {discount.min_order_amount && (
                      <span>ยอดขั้นต่ำ: {formatCurrency(discount.min_order_amount)}</span>
                    )}
                    {discount.usage_limit && (
                      <span>ใช้ได้: {discount.usage_count}/{discount.usage_limit} ครั้ง</span>
                    )}
                    {discount.valid_until && (
                      <span>หมดอายุ: {formatDate(discount.valid_until)}</span>
                    )}
                    <span>ใช้แล้ว: {discount.usage_count} ครั้ง</span>
                    <span>ส่วนลดรวม: {formatCurrency(discount.total_discount_given)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedDiscount(discount);
                      fetchUsageData(discount.id);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(discount)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(discount.id)}
                  >
                    {discount.is_active ? (
                      <ToggleRight className="h-4 w-4" />
                    ) : (
                      <ToggleLeft className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(discount.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>แก้ไขโค้ดส่วนลด</DialogTitle>
            <DialogDescription>
              แก้ไขข้อมูลโค้ดส่วนลด
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Same form fields as create dialog */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_code">รหัสโค้ด</Label>
                <Input
                  id="edit_code"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_discount_type">ประเภทส่วนลด</Label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(value) => setFormData({...formData, discount_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">เปอร์เซ็นต์</SelectItem>
                    <SelectItem value="fixed">จำนวนเงินคงที่</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit_description">คำอธิบาย</Label>
              <Input
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_discount_value">
                  {formData.discount_type === 'percentage' ? 'เปอร์เซ็นต์ (%)' : 'จำนวนเงิน (฿)'}
                </Label>
                <Input
                  id="edit_discount_value"
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_min_order_amount">ยอดสั่งซื้อขั้นต่ำ (฿)</Label>
                <Input
                  id="edit_min_order_amount"
                  type="number"
                  value={formData.min_order_amount}
                  onChange={(e) => setFormData({...formData, min_order_amount: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_max_discount_amount">ส่วนลดสูงสุด (฿)</Label>
                <Input
                  id="edit_max_discount_amount"
                  type="number"
                  value={formData.max_discount_amount}
                  onChange={(e) => setFormData({...formData, max_discount_amount: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_usage_limit">จำนวนครั้งที่ใช้ได้</Label>
                <Input
                  id="edit_usage_limit"
                  type="number"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({...formData, usage_limit: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_valid_from">วันที่เริ่มต้น</Label>
                <Input
                  id="edit_valid_from"
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_valid_until">วันที่สิ้นสุด</Label>
                <Input
                  id="edit_valid_until"
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="edit_is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
              <Label htmlFor="edit_is_active">เปิดใช้งาน</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleUpdate}>
              บันทึกการเปลี่ยนแปลง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DiscountManagement;
