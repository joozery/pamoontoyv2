import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  Check, 
  X, 
  Package as PackageIcon, 
  Calendar,
  User,
  CreditCard,
  Truck,
  Download,
  Search,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

const PaymentVerification = () => {
  const [payments, setPayments] = useState([
    {
      id: 'PAY-001',
      orderId: 'ORD-001',
      customer: 'สมชาย ใจดี',
      product: 'ฟิกเกอร์ Iron Man Mark V (Limited Edition)',
      amount: 6800,
      status: 'pending',
      paymentDate: '2024-10-21 14:30',
      slipImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=400&q=80',
      trackingNumber: '',
      note: ''
    },
    {
      id: 'PAY-002',
      orderId: 'ORD-002',
      customer: 'สมหญิง รักดี',
      product: 'โมเดล Batman Limited Edition (Signed)',
      amount: 4800,
      status: 'pending',
      paymentDate: '2024-10-21 15:45',
      slipImage: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=400&q=80',
      trackingNumber: '',
      note: ''
    },
    {
      id: 'PAY-003',
      orderId: 'ORD-003',
      customer: 'วิชัย มีสุข',
      product: 'การ์ดโปเกมอน Charizard Holo',
      amount: 25000,
      status: 'approved',
      paymentDate: '2024-10-20 10:15',
      slipImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
      trackingNumber: 'TH1234567890',
      note: 'ตรวจสอบแล้ว ยอดถูกต้อง'
    },
    {
      id: 'PAY-004',
      orderId: 'ORD-004',
      customer: 'นภา สวยงาม',
      product: 'ชุด Lego Star Wars Millennium Falcon',
      amount: 12000,
      status: 'shipped',
      paymentDate: '2024-10-19 16:20',
      slipImage: 'https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&w=400&q=80',
      trackingNumber: 'TH0987654321',
      note: 'จัดส่งแล้ว'
    },
    {
      id: 'PAY-005',
      orderId: 'ORD-005',
      customer: 'ประสิทธิ์ ดีมาก',
      product: 'ของสะสม Transformers Vintage G1',
      amount: 9500,
      status: 'pending',
      paymentDate: '2024-10-21 09:30',
      slipImage: 'https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&w=400&q=80',
      trackingNumber: '',
      note: ''
    },
    {
      id: 'PAY-006',
      orderId: 'ORD-006',
      customer: 'สุดา ใจงาม',
      product: 'ฟิกเกอร์ Spider-Man Rare Edition',
      amount: 5200,
      status: 'rejected',
      paymentDate: '2024-10-18 11:45',
      slipImage: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=400&q=80',
      trackingNumber: '',
      note: 'ยอดเงินไม่ถูกต้อง'
    },
  ]);

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleApprove = () => {
    if (!selectedPayment) return;

    setPayments(payments.map(p => 
      p.id === selectedPayment.id 
        ? { ...p, status: 'approved', note: adminNote || 'อนุมัติการชำระเงินแล้ว' }
        : p
    ));

    toast({
      title: "อนุมัติสำเร็จ",
      description: `อนุมัติการชำระเงินสำหรับคำสั่งซื้อ ${selectedPayment.orderId}`,
    });

    setSelectedPayment(null);
    setAdminNote('');
  };

  const handleReject = () => {
    if (!selectedPayment) return;

    setPayments(payments.map(p => 
      p.id === selectedPayment.id 
        ? { ...p, status: 'rejected', note: adminNote || 'ปฏิเสธการชำระเงิน' }
        : p
    ));

    toast({
      title: "ปฏิเสธสำเร็จ",
      description: `ปฏิเสธการชำระเงินสำหรับคำสั่งซื้อ ${selectedPayment.orderId}`,
      variant: "destructive",
    });

    setSelectedPayment(null);
    setAdminNote('');
  };

  const handleUpdateTracking = () => {
    if (!selectedPayment || !trackingNumber) {
      toast({
        title: "กรุณากรอกเลขพัสดุ",
        variant: "destructive",
      });
      return;
    }

    setPayments(payments.map(p => 
      p.id === selectedPayment.id 
        ? { 
            ...p, 
            status: 'shipped', 
            trackingNumber,
            note: adminNote || `จัดส่งแล้ว เลขพัสดุ: ${trackingNumber}`
          }
        : p
    ));

    toast({
      title: "อัปเดทสำเร็จ",
      description: `อัปเดทเลขพัสดุสำหรับคำสั่งซื้อ ${selectedPayment.orderId}`,
    });

    setSelectedPayment(null);
    setTrackingNumber('');
    setAdminNote('');
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { variant: 'secondary', label: 'รอตรวจสอบ', color: 'bg-yellow-100 text-yellow-800' },
      approved: { variant: 'default', label: 'อนุมัติแล้ว', color: 'bg-green-100 text-green-800' },
      rejected: { variant: 'destructive', label: 'ปฏิเสธ', color: 'bg-red-100 text-red-800' },
      shipped: { variant: 'outline', label: 'จัดส่งแล้ว', color: 'bg-blue-100 text-blue-800' },
    };

    const { label, color } = config[status] || config.pending;

    return (
      <Badge className={`${color} border-0`}>
        {label}
      </Badge>
    );
  };

  const filteredPayments = payments.filter(payment => {
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesSearch = 
      payment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.product.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const stats = {
    pending: payments.filter(p => p.status === 'pending').length,
    approved: payments.filter(p => p.status === 'approved').length,
    shipped: payments.filter(p => p.status === 'shipped').length,
    rejected: payments.filter(p => p.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">รอตรวจสอบ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-gray-500 mt-1">รายการ</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">อนุมัติแล้ว</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <p className="text-xs text-gray-500 mt-1">รายการ</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">จัดส่งแล้ว</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.shipped}</div>
              <p className="text-xs text-gray-500 mt-1">รายการ</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">ปฏิเสธ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <p className="text-xs text-gray-500 mt-1">รายการ</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>รายการชำระเงิน</CardTitle>
                <CardDescription>ตรวจสอบสลิปโอนเงินและอัปเดทเลขพัสดุ</CardDescription>
              </div>

              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="ค้นหา..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 pl-9 h-9"
                  />
                </div>

                {/* Filter */}
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[160px] h-9">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="สถานะ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="pending">รอตรวจสอบ</SelectItem>
                    <SelectItem value="approved">อนุมัติแล้ว</SelectItem>
                    <SelectItem value="shipped">จัดส่งแล้ว</SelectItem>
                    <SelectItem value="rejected">ปฏิเสธ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>รหัสการชำระ</TableHead>
                  <TableHead>คำสั่งซื้อ</TableHead>
                  <TableHead>ลูกค้า</TableHead>
                  <TableHead>สินค้า</TableHead>
                  <TableHead>ยอดเงิน</TableHead>
                  <TableHead>วันที่โอน</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>เลขพัสดุ</TableHead>
                  <TableHead className="text-right">การจัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                      ไม่พบข้อมูล
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.id}</TableCell>
                      <TableCell>{payment.orderId}</TableCell>
                      <TableCell>{payment.customer}</TableCell>
                      <TableCell className="max-w-[250px] truncate">{payment.product}</TableCell>
                      <TableCell>฿{payment.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-gray-500">{payment.paymentDate}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        {payment.trackingNumber ? (
                          <span className="text-sm font-mono text-gray-900">{payment.trackingNumber}</span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedPayment(payment);
                                setTrackingNumber(payment.trackingNumber || '');
                                setAdminNote(payment.note || '');
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              ดูรายละเอียด
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="sm:max-w-[540px] overflow-y-auto">
                            {selectedPayment && (
                              <>
                                <SheetHeader>
                                  <SheetTitle>รายละเอียดการชำระเงิน</SheetTitle>
                                  <SheetDescription>
                                    ตรวจสอบสลิปและจัดการการชำระเงิน
                                  </SheetDescription>
                                </SheetHeader>

                                <div className="space-y-6 py-6">
                                  {/* Payment Info */}
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-600">รหัสการชำระ</span>
                                      <span className="font-semibold">{selectedPayment.id}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-600">รหัสคำสั่งซื้อ</span>
                                      <span className="font-semibold">{selectedPayment.orderId}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-600">ลูกค้า</span>
                                      <span className="font-semibold">{selectedPayment.customer}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-600">ยอดเงิน</span>
                                      <span className="text-lg font-bold text-gray-900">
                                        ฿{selectedPayment.amount.toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-600">วันที่โอน</span>
                                      <span className="text-sm">{selectedPayment.paymentDate}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-600">สถานะ</span>
                                      {getStatusBadge(selectedPayment.status)}
                                    </div>
                                  </div>

                                  <div className="border-t pt-4">
                                    <p className="text-sm font-medium text-gray-900 mb-2">สินค้า</p>
                                    <p className="text-sm text-gray-600">{selectedPayment.product}</p>
                                  </div>

                                  {/* Slip Image */}
                                  <div className="border-t pt-4">
                                    <p className="text-sm font-medium text-gray-900 mb-3">สลิปโอนเงิน</p>
                                    <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden border">
                                      <img 
                                        src={selectedPayment.slipImage} 
                                        alt="Payment Slip"
                                        className="w-full h-full object-contain"
                                      />
                                    </div>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="w-full mt-2"
                                      onClick={() => window.open(selectedPayment.slipImage, '_blank')}
                                    >
                                      <Download className="h-4 w-4 mr-2" />
                                      ดาวน์โหลดสลิป
                                    </Button>
                                  </div>

                                  {/* Tracking Number */}
                                  {selectedPayment.status !== 'rejected' && (
                                    <div className="border-t pt-4">
                                      <Label htmlFor="tracking" className="text-sm font-medium">
                                        เลขพัสดุ
                                      </Label>
                                      <div className="mt-2 space-y-2">
                                        <Input
                                          id="tracking"
                                          placeholder="กรอกเลขพัสดุ เช่น TH1234567890"
                                          value={trackingNumber}
                                          onChange={(e) => setTrackingNumber(e.target.value)}
                                          disabled={selectedPayment.status === 'rejected'}
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {/* Admin Note */}
                                  <div className="border-t pt-4">
                                    <Label htmlFor="note" className="text-sm font-medium">
                                      หมายเหตุ
                                    </Label>
                                    <Textarea
                                      id="note"
                                      placeholder="เพิ่มหมายเหตุ (ถ้ามี)"
                                      value={adminNote}
                                      onChange={(e) => setAdminNote(e.target.value)}
                                      className="mt-2"
                                      rows={3}
                                    />
                                    {selectedPayment.note && (
                                      <p className="text-xs text-gray-500 mt-2">
                                        หมายเหตุเดิม: {selectedPayment.note}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Actions */}
                                <SheetFooter className="border-t pt-4">
                                  <div className="flex flex-col gap-2 w-full">
                                    {selectedPayment.status === 'pending' && (
                                      <div className="flex gap-2">
                                        <Button 
                                          variant="outline" 
                                          className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                          onClick={handleReject}
                                        >
                                          <X className="h-4 w-4 mr-2" />
                                          ปฏิเสธ
                                        </Button>
                                        <Button 
                                          className="flex-1 bg-green-600 hover:bg-green-700"
                                          onClick={handleApprove}
                                        >
                                          <Check className="h-4 w-4 mr-2" />
                                          อนุมัติ
                                        </Button>
                                      </div>
                                    )}

                                    {(selectedPayment.status === 'approved' || selectedPayment.status === 'shipped') && (
                                      <Button 
                                        className="w-full"
                                        onClick={handleUpdateTracking}
                                        disabled={!trackingNumber}
                                      >
                                        <Truck className="h-4 w-4 mr-2" />
                                        {selectedPayment.status === 'shipped' ? 'อัปเดทเลขพัสดุ' : 'บันทึกเลขพัสดุและจัดส่ง'}
                                      </Button>
                                    )}
                                  </div>
                                </SheetFooter>
                              </>
                            )}
                          </SheetContent>
                        </Sheet>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentVerification;

