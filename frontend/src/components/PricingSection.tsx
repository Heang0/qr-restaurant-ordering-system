'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

const PricingSection: React.FC = () => {
  const { t, language } = useLanguage();

  const features = t('pricing.features');

  return (
    <section id="pricing" className="py-16 md:py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${
            language === 'km' ? 'font-khmer' : 'font-sans'
          }`}>
            <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
              {t('pricing.title')}
            </span>
          </h2>
          <p className={`text-gray-600 text-base md:text-lg ${
            language === 'km' ? 'font-khmer' : 'font-sans'
          }`}>
            {t('pricingDesc')}
          </p>
        </div>

        {/* Pricing Card */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 group hover:shadow-3xl transition-all duration-300 card-hover-lift">
              {/* Featured Badge */}
              <div className="absolute top-4 right-4 bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-1.5 rounded-full text-xs md:text-sm font-bold shadow-lg">
                {language === 'km' ? 'ពេញនិយម' : 'POPULAR'}
              </div>

              <div className="p-6 md:p-10">
                {/* Header */}
                <div className="text-center mb-8">
                  <h3 className={`text-xl md:text-2xl font-bold text-gray-800 mb-3 ${
                    language === 'km' ? 'font-khmer' : 'font-sans'
                  }`}>
                    {language === 'km' ? 'គម្រោងអាជីវកម្ម' : 'Business Plan'}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                      $9.99
                    </span>
                    <span className="text-gray-500 text-sm md:text-base">/{t('pricing.period')}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 md:space-y-4 mb-8">
                  {Array.isArray(features) && features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className={`text-gray-700 text-sm md:text-base ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link
                  href="https://t.me/Emma_Heang"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white py-3.5 md:py-4 rounded-2xl font-bold text-base md:text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 btn-hover-lift block text-center"
                >
                  {t('pricing.signup')}
                </Link>

                {/* Guarantee */}
                <p className={`text-center text-gray-500 text-xs md:text-sm mt-5 ${
                  language === 'km' ? 'font-khmer' : 'font-sans'
                }`}>
                  {language === 'km' ? 'ធានាសងប្រាក់វិញក្នុងរយៈពេល ៣០ ថ្ងៃ' : '30-day money-back guarantee'}
                </p>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-red-50 rounded-full blur-3xl"></div>
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-orange-50 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
