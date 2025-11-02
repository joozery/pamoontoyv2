import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Map, Home, ShoppingBag, Heart, Gavel, User, HelpCircle, FileText, Shield, Phone } from 'lucide-react';

const Sitemap = () => {
    const sections = [
        {
            title: 'หน้าหลัก',
            icon: Home,
            links: [
                { to: '/', label: 'หน้าแรก' },
                { to: '/search', label: 'ค้นหาสินค้า' }
            ]
        },
        {
            title: 'การประมูล',
            icon: Gavel,
            links: [
                { to: '/', label: 'สินค้าทั้งหมด' },
                { to: '/my-bids', label: 'รายการประมูลของฉัน' },
                { to: '/how-to-bid', label: 'วิธีการประมูล' }
            ]
        },
        {
            title: 'บัญชีผู้ใช้',
            icon: User,
            links: [
                { to: '/profile', label: 'โปรไฟล์' },
                { to: '/orders', label: 'คำสั่งซื้อ' },
                { to: '/favorites', label: 'รายการโปรด' }
            ]
        },
        {
            title: 'ช่วยเหลือ',
            icon: HelpCircle,
            links: [
                { to: '/faq', label: 'คำถามที่พบบ่อย' },
                { to: '/contact', label: 'ติดต่อเรา' }
            ]
        },
        {
            title: 'นโยบายและข้อกำหนด',
            icon: FileText,
            links: [
                { to: '/privacy-policy', label: 'นโยบายความเป็นส่วนตัว' },
                { to: '/terms', label: 'ข้อกำหนดการใช้งาน' }
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
                        <Map className="w-10 h-10 md:w-12 md:h-12" />
                        แผนผังเว็บไซต์
                    </h1>
                    <p className="text-gray-300 text-lg">รวมลิงก์ทั้งหมดของเว็บไซต์</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sections.map((section, index) => {
                        const Icon = section.icon;
                        return (
                            <div key={index} className="bg-white rounded-2xl shadow-lg p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center">
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                                </div>
                                <ul className="space-y-2">
                                    {section.links.map((link, linkIndex) => (
                                        <li key={linkIndex}>
                                            <Link 
                                                to={link.to}
                                                className="text-gray-600 hover:text-gray-900 hover:underline transition-colors text-sm"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Sitemap;

