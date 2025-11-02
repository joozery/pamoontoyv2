import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Gavel, CreditCard, Package, Trophy, Clock, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const HowToBid = () => {
    const steps = [
        {
            icon: Gavel,
            title: '1. สมัครสมาชิก',
            description: 'สร้างบัญชีผู้ใช้ฟรี ใช้เวลาไม่ถึง 1 นาที',
            color: 'from-blue-500 to-blue-600'
        },
        {
            icon: Clock,
            title: '2. เลือกสินค้า',
            description: 'ค้นหาสินค้าที่คุณสนใจ ดูรายละเอียดและเวลาปิดประมูล',
            color: 'from-purple-500 to-purple-600'
        },
        {
            icon: TrendingUp,
            title: '3. เสนอราคา',
            description: 'คลิก "เสนอราคา" และใส่จำนวนเงินที่คุณต้องการเสนอ',
            color: 'from-green-500 to-green-600'
        },
        {
            icon: Trophy,
            title: '4. ชนะการประมูล',
            description: 'ถ้าคุณเสนอราคาสูงสุดเมื่อหมดเวลา คุณจะชนะการประมูล!',
            color: 'from-yellow-500 to-yellow-600'
        },
        {
            icon: CreditCard,
            title: '5. ชำระเงิน',
            description: 'ชำระเงินภายใน 24 ชั่วโมง พร้อมแนบหลักฐานการโอน',
            color: 'from-red-500 to-red-600'
        },
        {
            icon: Package,
            title: '6. รับสินค้า',
            description: 'รอรับสินค้าที่บ้าน ตรวจสอบเลขพัสดุได้ในระบบ',
            color: 'from-pink-500 to-pink-600'
        }
    ];

    const tips = [
        {
            icon: CheckCircle,
            title: 'ตั้งราคาสูงสุดที่ยอมจ่าย',
            description: 'ก่อนประมูล ควรกำหนดราคาสูงสุดที่คุณยินดีจ่ายไว้ล่วงหน้า'
        },
        {
            icon: CheckCircle,
            title: 'ติดตามประมูลอย่างใกล้ชิด',
            description: 'เช็คสถานะการประมูลเป็นประจำ โดยเฉพาะช่วง 5 นาทีสุดท้าย'
        },
        {
            icon: CheckCircle,
            title: 'อ่านรายละเอียดสินค้าให้ดี',
            description: 'ศึกษาสภาพสินค้า ขนาด สี และเงื่อนไขการจัดส่งก่อนประมูล'
        },
        {
            icon: AlertCircle,
            title: 'ระวังการเสนอราคาล่าสุด',
            description: 'ถ้ามีการเสนอราคาใน 5 นาทีสุดท้าย เวลาจะขยายออกไปอีก 5 นาที'
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
                        <Gavel className="w-10 h-10 md:w-12 md:h-12" />
                        วิธีการประมูล
                    </h1>
                    <p className="text-gray-300 text-lg">เรียนรู้วิธีการประมูลสินค้ากับเราอย่างง่ายดาย</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Steps */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">ขั้นตอนการประมูล</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6"
                                >
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4`}>
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                                    <p className="text-gray-600">{step.description}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Tips */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-white">
                    <h2 className="text-3xl font-bold mb-8 text-center">เคล็ดลับการประมูล</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {tips.map((tip, index) => {
                            const Icon = tip.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + index * 0.1 }}
                                    className="flex gap-4"
                                >
                                    <Icon className={`w-6 h-6 flex-shrink-0 mt-1 ${tip.icon === AlertCircle ? 'text-yellow-400' : 'text-green-400'}`} />
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">{tip.title}</h3>
                                        <p className="text-gray-300 text-sm">{tip.description}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-16 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">พร้อมเริ่มประมูลแล้วหรือยัง?</h2>
                    <p className="text-gray-600 mb-6">เริ่มต้นประมูลสินค้าที่คุณชื่นชอบได้เลยวันนี้</p>
                    <Link 
                        to="/" 
                        className="inline-block bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
                    >
                        เริ่มประมูลเลย
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HowToBid;

