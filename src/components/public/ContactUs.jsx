import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Clock, Facebook, Mail } from 'lucide-react';

const ContactUs = () => {

    const contactInfo = [
        {
            icon: MessageCircle,
            title: 'Line Official',
            detail: '@pamoon',
            link: 'https://line.me/R/ti/p/@pamoon'
        },
        {
            icon: Facebook,
            title: 'Facebook',
            detail: 'Pamoontoy',
            link: 'https://www.facebook.com/share/1AsxQCYE5A/?mibextid=wwXIfr'
        },
        {
            icon: Mail,
            title: 'อีเมล',
            detail: 'support@pamoontoy.site',
            link: 'mailto:support@pamoontoy.site'
        },
        {
            icon: Clock,
            title: 'เวลาทำการ',
            detail: 'จันทร์-อาทิตย์ 9:00-21:00 น.',
            link: null
        }
    ];

    const socialMedia = [
        { icon: Facebook, name: 'Facebook', link: 'https://www.facebook.com/share/1AsxQCYE5A/?mibextid=wwXIfr', color: 'from-blue-600 to-blue-700' },
        { icon: MessageCircle, name: 'Line OA', link: 'https://line.me/R/ti/p/@pamoon', color: 'from-green-500 to-green-600' }
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
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">ติดต่อเรา</h1>
                    <p className="text-gray-300 text-lg">มีคำถามหรือต้องการความช่วยเหลือ? ติดต่อเราได้ตลอดเวลา</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="space-y-8">
                        {/* Contact Details */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-lg p-8 text-white">
                            <h2 className="text-2xl font-bold mb-6">ข้อมูลติดต่อ</h2>
                            <div className="space-y-6">
                                {contactInfo.map((info, index) => {
                                    const Icon = info.icon;
                                    return (
                                        <div key={index} className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold mb-1">{info.title}</h3>
                                                {info.link ? (
                                                    <a href={info.link} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                                                        {info.detail}
                                                    </a>
                                                ) : (
                                                    <p className="text-gray-300">{info.detail}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Social Media */}
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">ติดตามเราได้ที่</h2>
                            <div className="flex justify-center gap-6">
                                {socialMedia.map((social, index) => {
                                    const Icon = social.icon;
                                    return (
                                        <a
                                            key={index}
                                            href={social.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`w-32 h-32 rounded-xl bg-gradient-to-br ${social.color} flex flex-col items-center justify-center text-white hover:scale-105 transition-transform shadow-lg`}
                                        >
                                            <Icon className="w-10 h-10 mb-2" />
                                            <span className="text-sm font-medium text-center">{social.name}</span>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;

