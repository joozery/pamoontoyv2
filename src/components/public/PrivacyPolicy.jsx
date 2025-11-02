import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const PrivacyPolicy = () => {
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
                        <Shield className="w-10 h-10 md:w-12 md:h-12" />
                        นโยบายความเป็นส่วนตัว
                    </h1>
                    <p className="text-gray-300 text-lg">ปรับปรุงล่าสุด: 27 ตุลาคม 2025</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. ข้อมูลที่เราเก็บรวบรวม</h2>
                        <p className="text-gray-600 mb-4">เราเก็บรวบรวมข้อมูลดังต่อไปนี้:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                            <li>ข้อมูลส่วนตัว (ชื่อ, อีเมล, เบอร์โทรศัพท์, ที่อยู่)</li>
                            <li>ข้อมูลการใช้งาน (ประวัติการประมูล, รายการโปรด)</li>
                            <li>ข้อมูลการชำระเงิน</li>
                            <li>ข้อมูลการเข้าใช้งานเว็บไซต์</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. การใช้ข้อมูล</h2>
                        <p className="text-gray-600 mb-4">เราใช้ข้อมูลของคุณเพื่อ:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                            <li>ดำเนินการประมูลและการซื้อขาย</li>
                            <li>ติดต่อสื่อสารเกี่ยวกับคำสั่งซื้อ</li>
                            <li>ปรับปรุงการให้บริการ</li>
                            <li>ส่งข้อมูลโปรโมชั่นและข่าวสาร (หากคุณยินยอม)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. การรักษาความปลอดภัย</h2>
                        <p className="text-gray-600">
                            เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อป้องกันข้อมูลของคุณจากการเข้าถึง การใช้งาน หรือการเปิดเผยโดยไม่ได้รับอนุญาต
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. การแบ่งปันข้อมูล</h2>
                        <p className="text-gray-600">
                            เราจะไม่แบ่งปันข้อมูลส่วนตัวของคุณให้กับบุคคลที่สาม ยกเว้นในกรณีที่จำเป็นเพื่อดำเนินการตามคำสั่งซื้อ (เช่น ที่อยู่จัดส่งให้ผู้ขาย) หรือตามที่กฎหมายกำหนด
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. สิทธิของคุณ</h2>
                        <p className="text-gray-600 mb-4">คุณมีสิทธิ์:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                            <li>เข้าถึงและขอสำเนาข้อมูลส่วนตัว</li>
                            <li>แก้ไขข้อมูลที่ไม่ถูกต้อง</li>
                            <li>ขอลบข้อมูลส่วนตัว</li>
                            <li>คัดค้านการประมวลผลข้อมูล</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. ติดต่อเรา</h2>
                        <p className="text-gray-600">
                            หากคุณมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัว กรุณาติดต่อเราที่ support@pamoontoy.site
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;

