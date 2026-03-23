'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

const PricingSection: React.FC = () => {
  const { t, language } = useLanguage();

  const features = t('pricing.features');

  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className={`text-4xl md:text-5xl font-bold text-center mb-4 ${
          language === 'km' ? 'font-khmer text-khmer' : 'font-sans'
        }`}>
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('pricing.title')}
          </span>
        </h2>
        <p className={`text-center text-gray-600 text-lg mb-16 ${
          language === 'km' ? 'font-khmer' : 'font-sans'
        }`}>
          {t('pricingDesc')}
        </p>

        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 group hover:shadow-3xl transition-all duration-300 card-hover-lift">
              {/* Featured Badge */}
              <div className="absolute top-6 right-6 bg-gradient-to-r from-primary to-primary-dark text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                {language === 'km' ? 'ពេញនិយម' : 'POPULAR'}
              </div>

              <div className="p-8 md:p-10">
                {/* Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {language === 'km' ? 'គម្រោងអាជីវកម្ម' : 'Business Plan'}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                      $9.99
                    </span>
                    <span className="text-gray-500 text-lg">{t('pricing.period')}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {Array.isArray(features) && features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className={`text-gray-700 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
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
                  className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 btn-hover-lift block text-center"
                >
                  {t('pricing.signup')}
                </Link>

                {/* Guarantee */}
                <p className="text-center text-gray-500 text-sm mt-6">
                  {language === 'km' ? 'ធានាសងប្រាក់វិញក្នុងរយៈពេល ៣០ ថ្ងៃ' : '30-day money-back guarantee'}
                </p>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-secondary/5 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
