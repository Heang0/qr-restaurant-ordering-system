'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-gray-950 text-white pt-24 pb-12 overflow-hidden relative">
      {/* Subtle top border gradient */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand Info */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-8 group">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform duration-500">
                <span className="text-white font-black text-2xl">O</span>
              </div>
              <span className="text-2xl font-bold tracking-tighter">OrderHey!</span>
            </Link>
            <p className={`text-gray-400 text-lg leading-relaxed mb-8 ${language === 'km' ? 'font-khmer font-normal' : 'font-sans text-gray-500'}`}>
              {language === 'km' 
                ? 'ប្រព័ន្ធម៉ឺនុយ QR ដ៏មានប្រសិទ្ធភាពសម្រាប់ភោជនីយដ្ឋានរបស់អ្នក ដើម្បីបង្កើនបទពិសោធន៍នៃការញ៉ាំអាហារ និងការលក់។'
                : 'Empowering restaurants with seamless QR ordering solutions to elevate guest experiences and drive growth.'}
            </p>
            <div className="flex gap-4">
              {['facebook', 'telegram', 'instagram'].map((platform) => (
                <Link 
                  key={platform}
                  href="https://t.me/Emma_Heang" 
                  target="_blank"
                  className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300"
                >
                  <div className="w-5 h-5 bg-gray-500 rounded-sm"></div>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-600 mb-8">Navigation</h3>
            <ul className="space-y-4">
              {['Features', 'Admin Control', 'Pricing', 'Documentation'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-600 mb-8">{t('footer.contact')}</h3>
            <div className="space-y-6">
              <a href="https://t.me/Emma_Heang" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.467 8.246l-1.98 9.33c-.144.664-.54 1.134-1.1.812l-3.02-2.225-1.457 1.401-.174.126-.262-.225 1.053-4.32-3.141-2.31c-.556-.41-.515-.712.18-.737l3.87-.563 1.731-3.504c.311-.63.76-.63 1.07 0l1.732 3.504 3.87.563c.695.1.735.4.18.737z"/></svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Telegram Support</div>
                  <div className="text-gray-300 group-hover:text-white transition-colors">@Emma_Heang</div>
                </div>
              </a>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Office</div>
                  <div className="text-gray-300">Phnom Penh, Cambodia</div>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter / CTA */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-600 mb-8">Newsletter</h3>
            <div className="p-1 rounded-2xl bg-gray-900 border border-gray-800 flex items-center focus-within:border-primary transition-colors">
              <input 
                type="email" 
                placeholder="Email address"
                className="bg-transparent border-0 focus:ring-0 text-sm px-4 flex-1 outline-none"
              />
              <button className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center hover:bg-primary-dark transition-colors">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7M3 12h18" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-gray-500 mt-4 px-2 italic">Join 1,000+ restaurant owners getting our weekly updates.</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-900 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-8 text-sm text-gray-500">
            <span>© {new Date().getFullYear()} OrderHey. {t('footer.rights')}</span>
          </div>
          <div className="flex gap-8 text-sm">
            <Link href="#" className="text-gray-500 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-gray-500 hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
