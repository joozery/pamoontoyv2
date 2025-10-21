
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = () => {
    const stored = JSON.parse(localStorage.getItem('reviews') || '[]');
    if (stored.length === 0) {
      const sampleReviews = [
        {
          id: '1',
          productName: 'iPhone 15 Pro',
          customerName: 'สมชาย ใจดี',
          rating: 5,
          comment: 'สินค้าดีมาก ตรงตามที่โฆษณา จัดส่งเร็ว',
          status: 'approved',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          productName: 'MacBook Pro',
          customerName: 'สมหญิง รักสวย',
          rating: 4,
          comment: 'ใช้งานดี แต่ราคาค่อนข้างสูง',
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('reviews', JSON.stringify(sampleReviews));
      setReviews(sampleReviews);
    } else {
      setReviews(stored);
    }
  };

  const handleToggleStatus = (id) => {
    const updated = reviews.map(r =>
      r.id === id ? { ...r, status: r.status === 'approved' ? 'hidden' : 'approved' } : r
    );
    localStorage.setItem('reviews', JSON.stringify(updated));
    setReviews(updated);
    toast({ title: "อัปเดตสถานะสำเร็จ" });
  };

  const handleDelete = (id) => {
    const updated = reviews.filter(r => r.id !== id);
    localStorage.setItem('reviews', JSON.stringify(updated));
    setReviews(updated);
    toast({ title: "ลบรีวิวสำเร็จ" });
  };

  const filteredReviews = reviews.filter(r =>
    r.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.comment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหารีวิว..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {filteredReviews.map((review) => (
            <motion.div
              key={review.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {review.productName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">โดย {review.customerName}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    review.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400' :
                    review.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                  }`}>
                    {review.status === 'approved' ? 'อนุมัติแล้ว' :
                     review.status === 'pending' ? 'รออนุมัติ' : 'ซ่อน'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString('th-TH')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                {renderStars(review.rating)}
              </div>

              <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">{review.comment}</p>

              <div className="flex gap-2">
                <Button onClick={() => handleToggleStatus(review.id)} variant="outline" size="sm">
                  {review.status === 'approved' ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {review.status === 'approved' ? 'ซ่อน' : 'อนุมัติ'}
                </Button>
                <Button onClick={() => handleDelete(review.id)} variant="outline" size="sm" className="text-red-500 hover:text-red-500">
                  <Trash2 className="w-4 h-4 mr-2" />
                  ลบ
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReviewManagement;
