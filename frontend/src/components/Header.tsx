'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, language } = useLanguage();

  const navLinks = [
    { href: '#features', label: t('home.whyChooseUs') },
    { href: '#admin-control', label: t('home.adminControl') },
    { href: '#pricing', label: t('pricing.title') },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/20 shadow-premium">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center shadow-primary/20 shadow-xl group-hover:rotate-6 transition-all duration-500">
              <span className="text-white font-black text-2xl">O</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-gray-900 leading-none">
                OrderHey!
              </span>
              <span className="text-[10px] font-medium text-primary tracking-[0.2em] uppercase mt-0.5">
                Elevate Dining
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-gray-600 hover:text-primary transition-all duration-300 text-sm tracking-wide relative group ${
                  language === 'km' ? 'font-khmer font-normal' : 'font-sans font-medium'
                }`}
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
            <div className="h-6 w-[1px] bg-gray-200 mx-2"></div>
            <LanguageSwitcher />
            <Link
              href="/login"
              className={`btn-primary py-2.5 px-7 shadow-primary/20 shadow-xl ${language === 'km' ? 'font-khmer font-normal' : 'font-sans font-bold'}`}
            >
              {t('common.login')}
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-3 rounded-2xl bg-primary/5 border border-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white/95 backdrop-blur-xl border-b border-gray-100 ${
          isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-10 space-y-8 flex flex-col items-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-2xl text-gray-800 hover:text-primary transition-colors ${
                language === 'km' ? 'font-khmer font-normal' : 'font-sans font-bold'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="w-full h-px bg-gray-100"></div>
          <div className="flex flex-col items-center gap-8 w-full">
            <LanguageSwitcher />
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`btn-primary w-full max-w-[280px] text-center py-4 text-xl ${
                language === 'km' ? 'font-khmer font-normal' : 'font-sans font-bold'
              }`}
            >
              {t('common.login')}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
