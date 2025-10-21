
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mail, Trash2, Reply, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = () => {
    const stored = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    if (stored.length === 0) {
      const sampleMessages = [
        {
          id: '1',
          name: 'สมชาย ใจดี',
          email: 'somchai@example.com',
          subject: 'สอบถามเกี่ยวกับสินค้า',
          message: 'อยากทราบรายละเอียดเพิ่มเติมเกี่ยวกับ iPhone 15 Pro ครับ',
          status: 'unread',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'สมหญิง รักสวย',
          email: 'somying@example.com',
          subject: 'ติดตามสถานะการจัดส่ง',
          message: 'ต้องการติดตามสถานะการจัดส่งสินค้าค่ะ',
          status: 'read',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('contactMessages', JSON.stringify(sampleMessages));
      setMessages(sampleMessages);
    } else {
      setMessages(stored);
    }
  };

  const handleDelete = (id) => {
    const updated = messages.filter(m => m.id !== id);
    localStorage.setItem('contactMessages', JSON.stringify(updated));
    setMessages(updated);
    toast({
      title: "ลบข้อความสำเร็จ",
    });
  };

  const handleReply = () => {
    toast({
      title: "🚧 ฟีเจอร์นี้ยังไม่พร้อมใช้งาน",
      description: "แต่ไม่ต้องกังวล! คุณสามารถขอเพิ่มฟีเจอร์นี้ในข้อความถัดไปได้! 🚀",
    });
  };

  const handleMarkAsRead = (id) => {
    const updated = messages.map(m =>
      m.id === id ? { ...m, status: 'read' } : m
    );
    localStorage.setItem('contactMessages', JSON.stringify(updated));
    setMessages(updated);
  };

  const filteredMessages = messages.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาข้อความ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {filteredMessages.map((message) => (
            <motion.div
              key={message.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl"
              onClick={() => handleMarkAsRead(message.id)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {message.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {message.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{message.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {message.status === 'unread' && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(message.createdAt).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{message.subject}</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{message.message}</p>
                </div>
              </div>
              <div className="flex gap-2 border-t border-gray-200 dark:border-gray-800 px-6 py-3 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl">
                <Button onClick={handleReply} variant="ghost" size="sm">
                  <Reply className="w-4 h-4 mr-2" />
                  ตอบกลับ
                </Button>
                <Button onClick={() => handleDelete(message.id)} variant="ghost" size="sm" className="text-red-500 hover:text-red-500">
                  <Trash2 className="w-4 h-4 mr-2" />
                  ลบ
                </Button>
                <Button variant="ghost" size="sm" className="ml-auto">
                  <Archive className="w-4 h-4 mr-2" />
                  จัดเก็บ
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredMessages.length === 0 && (
        <div className="text-center py-12">
          <Mail className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">ไม่พบข้อความ</p>
        </div>
      )}
    </div>
  );
};

export default ContactMessages;
