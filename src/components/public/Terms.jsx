import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

const Terms = () => {
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
                        <FileText className="w-10 h-10 md:w-12 md:h-12" />
                        ข้อกำหนดการใช้งาน
                    </h1>
                    <p className="text-gray-300 text-lg">ปรับปรุงล่าสุด: 27 ตุลาคม 2025</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. การยอมรับข้อกำหนด</h2>
                        <p className="text-gray-600">
                            การใช้งานเว็บไซต์ PAMOONTOY ถือว่าคุณยอมรับและตกลงปฏิบัติตามข้อกำหนดและเงื่อนไขการใช้งานทั้งหมด
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. การสมัครสมาชิกและบัญชีผู้ใช้</h2>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                            <li>คุณต้องมีอายุ 18 ปีขึ้นไปจึงจะสามารถสมัครสมาชิกได้</li>
                            <li>ข้อมูลที่ให้ไว้ต้องเป็นข้อมูลที่ถูกต้องและเป็นปัจจุบัน</li>
                            <li>คุณมีหน้าที่รักษาความปลอดภัยของรหัสผ่าน</li>
                            <li>ห้ามให้ผู้อื่นใช้บัญชีของคุณ</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. กฎการประมูล</h2>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                            <li>การเสนอราคาถือเป็นข้อตกลงที่มีผลผูกพัน ไม่สามารถยกเลิกได้</li>
                            <li>ผู้ชนะการประมูลต้องชำระเงินภายใน 24 ชั่วโมง</li>
                            <li>หากไม่ชำระเงินตามกำหนด คำสั่งซื้อจะถูกยกเลิก</li>
                            <li>ห้ามใช้บัญชีหลายบัญชีเพื่อยกราคาให้ตัวเอง</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. การชำระเงิน</h2>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                            <li>ยอมรับการชำระเงินผ่านการโอนธนาคารเท่านั้น</li>
                            <li>ต้องแนบหลักฐานการโอนเงินที่ชัดเจน</li>
                            <li>ราคารวมค่าจัดส่งจะถูกระบุในคำสั่งซื้อ</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. การจัดส่งและการคืนสินค้า</h2>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                            <li>สินค้าจะถูกจัดส่งภายใน 3-7 วันทำการหลังยืนยันการชำระเงิน</li>
                            <li>ผู้ซื้อต้องตรวจสอบสินค้าทันทีเมื่อได้รับ</li>
                            <li>หากสินค้าไม่ตรงตามที่อธิบาย ต้องแจ้งภายใน 48 ชั่วโมง</li>
                            <li>สินค้าที่ซื้อจากการประมูลไม่สามารถคืนได้ ยกเว้นสินค้าชำรุดหรือไม่ตรงตามที่อธิบาย</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. การระงับบัญชี</h2>
                        <p className="text-gray-600 mb-4">เราสงวนสิทธิ์ในการระงับหรือยกเลิกบัญชีผู้ใช้ในกรณีดังต่อไปนี้:</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                            <li>ละเมิดข้อกำหนดการใช้งาน</li>
                            <li>ใช้บัญชีหลายบัญชีเพื่อการฉ้อโกง</li>
                            <li>ไม่ชำระเงินซ้ำ 3 ครั้ง</li>
                            <li>มีพฤติกรรมที่ไม่เหมาะสม</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. การติดต่อ</h2>
                        <p className="text-gray-600">
                            หากมีคำถามเกี่ยวกับข้อกำหนดการใช้งาน กรุณาติดต่อเราที่ support@pamoontoy.site หรือผ่าน Line OA @pamoon
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Terms;

