import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Package, MoreHorizontal, ExternalLink, ChevronLeft, ChevronRight, Image as ImageIcon, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import Swal from 'sweetalert2';
import { apiService } from '@/services/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ProductManagement = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    loadProducts();
  }, [currentPage, searchTerm]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.products.getAll({ 
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: 'all' // ✅ Admin เห็นทุก status (active, scheduled, ended, sold)
      });
      
      const data = response.data.data || [];
      const pagination = response.data.pagination || {};
      
      setProducts(data);
      setTotalPages(pagination.totalPages || 1);
      setTotalProducts(pagination.total || data.length);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลสินค้าได้",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, productName) => {
    const result = await Swal.fire({
      title: 'ยืนยันการลบ',
      text: `คุณต้องการลบสินค้า "${productName}" หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        await apiService.products.delete(id);
        await loadProducts();
        toast({
          title: "ลบสินค้าสำเร็จ",
          description: "ลบสินค้าออกจากระบบแล้ว",
        });
      } catch (error) {
        console.error('Error deleting product:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: error.response?.data?.message || "ไม่สามารถลบสินค้าได้",
          variant: "destructive"
        });
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus, productName) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const action = currentStatus === 'active' ? 'ซ่อน' : 'แสดง';
    
    const result = await Swal.fire({
      title: `${action}สินค้า`,
      text: `คุณต้องการ${action}สินค้า "${productName}" หรือไม่?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: action,
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        await apiService.products.update(id, { status: newStatus });
        await loadProducts();
        toast({
          title: "อัปเดตสถานะสำเร็จ",
          description: `${action}สินค้าแล้ว`,
        });
      } catch (error) {
        console.error('Error updating status:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถอัปเดตสถานะได้",
          variant: "destructive"
        });
      }
    }
  };

  const getImageUrl = (product) => {
    if (product.image_url) return product.image_url;
    if (product.primary_image) return product.primary_image;
    if (product.images) {
      try {
        const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
        if (Array.isArray(images) && images.length > 0) return images[0];
      } catch (e) {
        console.error('Error parsing images:', e);
      }
    }
    return null;
  };

  const isAuctionEnded = (product) => {
    if (!product.auction_end_time) return false;
    return new Date(product.auction_end_time) < new Date();
  };

  const getAuctionStatusBadge = (product) => {
    const ended = isAuctionEnded(product);
    const noBids = !product.bid_count || product.bid_count === 0;
    
    if (ended && noBids) {
      return (
        <div className="flex gap-1 flex-wrap">
          <Badge variant="destructive" className="gap-1 text-xs">
            <Clock className="w-3 h-3" />
            หมดเวลา
          </Badge>
          <Badge variant="secondary" className="gap-1 text-xs">
            <Users className="w-3 h-3" />
            ไม่มีผู้ประมูล
          </Badge>
        </div>
      );
    } else if (ended) {
      return (
        <Badge variant="destructive" className="gap-1 text-xs">
          <Clock className="w-3 h-3" />
          หมดเวลา
        </Badge>
      );
    } else if (noBids && product.status === 'active') {
      return (
        <Badge variant="secondary" className="gap-1 text-xs">
          <Users className="w-3 h-3" />
          ไม่มีผู้ประมูล
        </Badge>
      );
    }
    return null;
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">จัดการสินค้า</h2>
          <p className="text-muted-foreground">
            จัดการและติดตามสินค้าทั้งหมด ({totalProducts} รายการ)
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/admin/products/add')} size="default" className="gap-2">
            <Plus className="w-4 h-4" />
            เพิ่มสินค้าใหม่
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="ค้นหาสินค้า ชื่อ, หมวดหมู่, หรือรายละเอียด..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={loadProducts}>
              รีเฟรช
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-3 text-muted-foreground">กำลังโหลดสินค้า...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'ไม่พบสินค้าที่ค้นหา' : 'ยังไม่มีสินค้า'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm ? 'ลองค้นหาด้วยคำอื่น' : 'เริ่มต้นโดยการเพิ่มสินค้าแรกของคุณ'}
              </p>
              {!searchTerm && (
                <Button onClick={() => navigate('/admin/products/add')}>
                  <Plus className="w-4 h-4 mr-2" />
                  เพิ่มสินค้าแรก
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">ID</TableHead>
                      <TableHead className="w-24">รูปภาพ</TableHead>
                      <TableHead>ชื่อสินค้า</TableHead>
                      <TableHead className="w-32">หมวดหมู่</TableHead>
                      <TableHead className="w-40">สถานะ</TableHead>
                      <TableHead className="w-32 text-right">ราคาปัจจุบัน</TableHead>
                      <TableHead className="w-32 text-right">ซื้อทันที</TableHead>
                      <TableHead className="w-24 text-center">ประมูล</TableHead>
                      <TableHead className="w-20 text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {products.map((product) => {
                        const imageUrl = getImageUrl(product);
                        const currentPrice = parseFloat(product.current_price || product.starting_price || 0);
                        const buyNowPrice = parseFloat(product.buy_now_price || 0);
                        
                        return (
                          <motion.tr
                            key={product.id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="group hover:bg-muted/50 transition-colors"
                          >
                            <TableCell className="font-mono text-sm text-muted-foreground">
                              #{product.id}
                            </TableCell>
                            <TableCell>
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted">
                                {imageUrl ? (
                                  <img 
                                    src={imageUrl} 
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    onError={(e) => {
                                      e.target.src = 'https://placehold.co/100x100/e5e7eb/9ca3af?text=No+Image';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs">
                                <p className="font-medium truncate">{product.name}</p>
                                {product.description && (
                                  <p className="text-sm text-muted-foreground truncate">
                                    {product.description.replace(/<[^>]*>/g, '').substring(0, 50)}...
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="font-normal">
                                {product.category || 'ไม่ระบุ'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1.5">
                                <Badge 
                                  variant={
                                    product.status === 'active' ? 'default' :
                                    product.status === 'sold' ? 'destructive' :
                                    'secondary'
                                  }
                                  className="gap-1.5 w-fit"
                                >
                                  <span className={`h-2 w-2 rounded-full ${
                                    product.status === 'active' ? 'bg-green-400' :
                                    product.status === 'sold' ? 'bg-red-400' :
                                    'bg-gray-400'
                                  }`}></span>
                                  {product.status === 'active' ? 'พร้อมขาย' :
                                   product.status === 'sold' ? 'ขายแล้ว' : 
                                   product.status === 'inactive' ? 'ซ่อน' : 'ไม่ทราบ'}
                                </Badge>
                                {getAuctionStatusBadge(product)}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              ฿{currentPrice.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              {buyNowPrice > 0 ? (
                                <span className="text-sm font-medium text-muted-foreground">
                                  ฿{buyNowPrice.toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="font-mono">
                                {product.bid_count || 0}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem onClick={() => window.open(`/product/${product.id}`, '_blank')}>
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    ดูหน้าสินค้า
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => navigate(`/admin/products/edit/${product.id}`)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    แก้ไขสินค้า
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleToggleStatus(product.id, product.status, product.name)}>
                                    {product.status === 'active' ? (
                                      <>
                                        <EyeOff className="w-4 h-4 mr-2" />
                                        ซ่อนสินค้า
                                      </>
                                    ) : (
                                      <>
                                        <Eye className="w-4 h-4 mr-2" />
                                        แสดงสินค้า
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDelete(product.id, product.name)} 
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    ลบสินค้า
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="border-t p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      แสดง {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalProducts)} จาก {totalProducts} รายการ
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        ก่อนหน้า
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className="w-10"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        ถัดไป
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สินค้าทั้งหมด</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">รายการ</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">กำลังประมูล</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {products.filter(p => p.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">สินค้าพร้อมขาย</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ขายแล้ว</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {products.filter(p => p.status === 'sold').length}
            </div>
            <p className="text-xs text-muted-foreground">สินค้า</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ซ่อนอยู่</CardTitle>
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {products.filter(p => p.status === 'inactive').length}
            </div>
            <p className="text-xs text-muted-foreground">สินค้า</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductManagement;
