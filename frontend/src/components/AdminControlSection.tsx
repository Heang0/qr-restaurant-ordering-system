'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const AdminControlSection: React.FC = () => {
  const { t, language } = useLanguage();

  const features = [
    {
      icon: 'dashboard',
      title: t('home.adminFeatures.dashboard'),
      description: t('home.adminFeatures.dashboardDesc'),
    },
    {
      icon: 'menu',
      title: t('home.adminFeatures.menuManagement'),
      description: t('home.adminFeatures.menuManagementDesc'),
    },
    {
      icon: 'orders',
      title: t('home.adminFeatures.orderTracking'),
      description: t('home.adminFeatures.orderTrackingDesc'),
    },
    {
      icon: 'staff',
      title: t('home.adminFeatures.staffManagement'),
      description: t('home.adminFeatures.staffManagementDesc'),
    },
    {
      icon: 'table',
      title: t('home.adminFeatures.tableManagement'),
      description: t('home.adminFeatures.tableManagementDesc'),
    },
    {
      icon: 'reports',
      title: t('home.adminFeatures.reports'),
      description: t('home.adminFeatures.reportsDesc'),
    },
  ];

  const getIconClass = (iconName: string) => {
    const iconMap: Record<string, JSX.Element> = {
      'dashboard': (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      'menu': (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      'orders': (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      'staff': (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      'table': (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      'reports': (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    };
    return iconMap[iconName] || null;
  };

  return (
    <section id="admin-control" className="py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16 mb-20">
          <div className="lg:w-1/2">
            <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-6">
              Control Center
            </div>
            <h2 className={`text-4xl md:text-5xl text-gray-900 mb-8 leading-tight ${
              language === 'km' ? 'font-khmer text-khmer font-normal' : 'font-sans font-extrabold'
            }`}>
              {t('home.adminControl')}
            </h2>
            <p className={`text-gray-500 text-lg leading-relaxed mb-10 ${
              language === 'km' ? 'font-khmer font-normal' : 'font-sans'
            }`}>
              {t('home.adminControlDesc')}
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className={`text-2xl font-bold text-gray-900 mb-1 ${language === 'km' ? 'font-khmer font-normal' : 'font-sans'}`}>
                  {language === 'km' ? 'ភ្លាមៗ' : 'Instant'}
                </div>
                <div className={`text-sm text-gray-500 ${language === 'km' ? 'font-khmer font-normal' : 'font-sans'}`}>
                  {language === 'km' ? 'បច្ចុប្បន្នភាពម៉ឺនុយ' : 'Menu Updates'}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className={`text-2xl font-bold text-gray-900 mb-1 ${language === 'km' ? 'font-khmer font-normal' : 'font-sans'}`}>
                  {language === 'km' ? 'ពេលវេលាជាក់ស្តែង' : 'Real-time'}
                </div>
                <div className={`text-sm text-gray-500 ${language === 'km' ? 'font-khmer font-normal' : 'font-sans'}`}>
                  {language === 'km' ? 'របាយការណ៍លក់' : 'Sales Reports'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2 relative">
             <div className="absolute -inset-4 bg-gradient-to-tr from-primary/10 to-primary/5 rounded-[2.5rem] blur-2xl"></div>
             <div className="relative glass p-4 rounded-[2rem] shadow-premium-lg border border-white/40">
                <div className="bg-gray-900 rounded-[1.5rem] overflow-hidden shadow-2xl">
                   <div className="p-4 border-b border-gray-800 flex items-center gap-2">
                      <div className="flex gap-1.5">
                         <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                         <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                         <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                      </div>
                      <div className="flex-1 text-center">
                         <div className="inline-block px-3 py-1 rounded-md bg-gray-800 text-[10px] text-gray-400 font-mono">admin.orderhey.online</div>
                      </div>
                   </div>
                   <div className="aspect-[16/10] bg-gray-900 p-6">
                      <div className="grid grid-cols-3 gap-4 mb-6">
                         {[1,2,3].map(i => (
                            <div key={i} className="h-20 rounded-xl bg-gray-800/50 border border-gray-700/50 animate-pulse"></div>
                         ))}
                      </div>
                      <div className="space-y-3">
                         {[1,2,3,4].map(i => (
                            <div key={i} className="h-4 w-full rounded bg-gray-800/50 animate-pulse"></div>
                         ))}
                         <div className="h-4 w-2/3 rounded bg-gray-800/50 animate-pulse"></div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card-premium flex items-start gap-6 group"
            >
              <div className="shrink-0 w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                {getIconClass(feature.icon)}
              </div>
              <div>
                <h3 className={`text-xl font-bold text-gray-900 mb-2 ${language === 'km' ? 'font-khmer font-normal' : 'font-sans'}`}>
                  {feature.title}
                </h3>
                <p className={`text-gray-500 text-sm leading-relaxed ${language === 'km' ? 'font-khmer font-normal' : 'font-sans'}`}>
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdminControlSection;
