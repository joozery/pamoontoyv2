import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            category: 'การประมูล',
            items: [
                {
                    question: 'การประมูลทำงานอย่างไร?',
                    answer: 'เมื่อคุณเสนอราคาสินค้า ระบบจะเปรียบเทียบกับราคาปัจจุบัน หากคุณเสนอราคาสูงสุดจะได้เป็นผู้นำการประมูล เมื่อหมดเวลาประมูล ผู้ที่เสนอราคาสูงสุดจะเป็นผู้ชนะ'
                },
                {
                    question: 'ต้องเสนอราคาขั้นต่ำเท่าไหร่?',
                    answer: 'แต่ละสินค้าจะมีราคาขั้นต่ำที่ต้องเพิ่มแตกต่างกัน โดยจะแสดงไว้ที่หน้ารายละเอียดสินค้า ปกติจะอยู่ระหว่าง 10-100 บาท'
                },
                {
                    question: 'ถ้ามีคนเสนอราคาในนาทีสุดท้ายจะเกิดอะไรขึ้น?',
                    answer: 'หากมีการเสนอราคาในช่วง 5 นาทีสุดท้าย ระบบจะขยายเวลาประมูลออกไปอีก 5 นาทีโดยอัตโนมัติ เพื่อให้ผู้เข้าร่วมมีโอกาสเสนอราคาได้อย่างเป็นธรรม'
                },
                {
                    question: 'สามารถยกเลิกการเสนอราคาได้หรือไม่?',
                    answer: 'เมื่อเสนอราคาแล้วจะไม่สามารถยกเลิกได้ กรุณาพิจารณาให้รอบคอบก่อนเสนอราคา'
                }
            ]
        },
        {
            category: 'การชำระเงิน',
            items: [
                {
                    question: 'มีวิธีการชำระเงินอะไรบ้าง?',
                    answer: 'รับชำระผ่านการโอนเงินธนาคาร โดยต้องแนบหลักฐานการโอนเงิน (สลิป) เข้ามาในระบบ'
                },
                {
                    question: 'ต้องชำระเงินภายในกี่วัน?',
                    answer: 'ผู้ชนะการประมูลต้องชำระเงินภายใน 24 ชั่วโมง หลังจากการประมูลสิ้นสุด หากไม่ชำระภายในเวลาที่กำหนด คำสั่งซื้อจะถูกยกเลิกโดยอัตโนมัติ'
                },
                {
                    question: 'ชำระเงินแล้ว ต้องทำอะไรต่อ?',
                    answer: 'หลังชำระเงินและแนบสลิปแล้ว รอให้ผู้ขายตรวจสอบการชำระเงิน จากนั้นจะได้รับหมายเลขพัสดุสำหรับติดตามสถานะการจัดส่ง'
                }
            ]
        },
        {
            category: 'การจัดส่ง',
            items: [
                {
                    question: 'ค่าจัดส่งคิดอย่างไร?',
                    answer: 'ค่าจัดส่งจะแสดงไว้ในหน้ารายละเอียดสินค้า ซึ่งจะขึ้นอยู่กับขนาดและน้ำหนักของสินค้า'
                },
                {
                    question: 'ใช้เวลาจัดส่งนานแค่ไหน?',
                    answer: 'โดยปกติใช้เวลา 3-7 วันทำการ หลังจากผู้ขายตรวจสอบการชำระเงินแล้ว คุณสามารถติดตามสถานะพัสดุได้ผ่านหมายเลขพัสดุที่ได้รับ'
                },
                {
                    question: 'รับสินค้าไม่ตรงตามที่สั่งต้องทำอย่างไร?',
                    answer: 'หากสินค้าไม่ตรงตามที่อธิบายไว้หรือเสียหาย กรุณาติดต่อเราทันทีพร้อมภาพถ่าย เราจะประสานงานกับผู้ขายเพื่อแก้ไขปัญหาให้'
                }
            ]
        },
        {
            category: 'บัญชีผู้ใช้',
            items: [
                {
                    question: 'การสมัครสมาชิกฟรีหรือไม่?',
                    answer: 'ใช่ การสมัครสมาชิกไม่มีค่าใช้จ่ายใดๆ และใช้เวลาไม่ถึง 1 นาที'
                },
                {
                    question: 'ลืมรหัสผ่านต้องทำอย่างไร?',
                    answer: 'กรุณาติดต่อเราผ่าน Line Official @pamoon หรืออีเมล support@pamoontoy.site พร้อมแจ้งอีเมลที่ใช้สมัคร เราจะช่วยรีเซ็ตรหัสผ่านให้'
                },
                {
                    question: 'สามารถแก้ไขข้อมูลส่วนตัวได้หรือไม่?',
                    answer: 'ได้ คุณสามารถแก้ไขข้อมูลส่วนตัวได้ที่หน้า "โปรไฟล์" โดยคลิกปุ่ม "แก้ไขโปรไฟล์"'
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 py-12 md:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link 
                        to="/" 
                        className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-6 transition-colors text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        กลับหน้าหลัก
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center gap-4">
                        <HelpCircle className="w-10 h-10 md:w-12 md:h-12" />
                        คำถามที่พบบ่อย (FAQ)
                    </h1>
                    <p className="text-gray-300 text-lg">คำตอบสำหรับคำถามที่มักพบบ่อย</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {faqs.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">{category.category}</h2>
                        <div className="space-y-4">
                            {category.items.map((faq, index) => {
                                const globalIndex = `${categoryIndex}-${index}`;
                                const isOpen = openIndex === globalIndex;
                                
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                                    >
                                        <button
                                            onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                                            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                                        >
                                            <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                                            <ChevronDown className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        
                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-6 pb-4 text-gray-600 border-t border-gray-100 pt-4">
                                                        {faq.answer}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {/* Contact CTA */}
                <div className="mt-12 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-center text-white">
                    <h3 className="text-2xl font-bold mb-4">ยังหาคำตอบไม่เจอ?</h3>
                    <p className="text-gray-300 mb-6">ติดต่อเราได้ตลอดเวลา เรายินดีช่วยเหลือ</p>
                    <Link 
                        to="/contact" 
                        className="inline-block bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                        ติดต่อเรา
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default FAQ;

