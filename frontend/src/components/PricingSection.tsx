'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

const PricingSection: React.FC = () => {
  const { t, language } = useLanguage();

  const features = t('pricing.features');

  return (
    <section id="pricing" className="py-32 bg-[#fcfcfd]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className={`text-4xl md:text-5xl text-gray-900 mb-6 tracking-tight ${
            language === 'km' ? 'font-khmer text-khmer font-normal' : 'font-sans font-extrabold'
          }`}>
            {t('pricing.title')}
          </h2>
          <div className="w-20 h-1.5 bg-primary mx-auto rounded-full mb-8"></div>
          <p className={`text-lg text-gray-500 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
            One simple price for everything. No hidden fees.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-lg">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary-dark rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white rounded-[2rem] shadow-premium-lg overflow-hidden border border-gray-100 p-8 md:p-12">
                {/* Popular Badge */}
                <div className="absolute top-8 right-8">
                  <div className="bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-lg shadow-primary/20">
                    Most Popular
                  </div>
                </div>

                {/* Header */}
                <div className="mb-10">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    {language === 'km' ? 'គម្រោងអាជីវកម្ម' : 'Full Access'}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-6xl font-black text-gray-900 tracking-tighter">
                      $9.99
                    </span>
                    <span className="text-gray-400 font-medium text-lg">{t('pricing.period')}</span>
                  </div>
                  <p className="text-gray-500 mt-4 text-sm font-medium">Perfect for restaurants of any size.</p>
                </div>

                {/* Features */}
                <div className="space-y-5 mb-12">
                  {Array.isArray(features) && features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className={`text-gray-600 font-medium ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Link
                  href="https://t.me/Emma_Heang"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`btn-primary w-full text-center py-5 text-xl shadow-primary/20 shadow-2xl block ${language === 'km' ? 'font-khmer font-normal' : 'font-sans font-bold'}`}
                >
                  {t('pricing.signup')}
                </Link>

                {/* Guarantee */}
                <div className="mt-8 flex items-center justify-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-widest">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  {language === 'km' ? 'ធានាសងប្រាក់វិញក្នុងរយៈពេល ៣០ ថ្ងៃ' : 'Secure 30-Day Money Back'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
