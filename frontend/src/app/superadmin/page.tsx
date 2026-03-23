'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

import UsersView from '@/components/admin/UsersView';
import StoresView from '@/components/admin/StoresView';
import LanguageSwitcher from '@/components/LanguageSwitcher';

type Tab = 'dashboard' | 'stores' | 'users' | 'settings';

export default function SuperAdminPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [storeLogo, setStoreLogo] = useState<string>('');
  const [storeName, setStoreName] = useState<string>('');

  // Load saved tab
  React.useEffect(() => {
    const savedTab = localStorage.getItem('superAdminTab') as Tab;
    if (savedTab && ['dashboard', 'stores', 'users', 'settings'].includes(savedTab)) {
      setActiveTab(savedTab);
    }
  }, []);

  // Save tab when it changes
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    localStorage.setItem('superAdminTab', tab);
  };

  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        const storeId = localStorage.getItem('storeId');
        if (storeId) {
          const response = await fetch(`/api/stores?id=${storeId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.logo || data.logoUrl) {
              setStoreLogo(data.logo || data.logoUrl);
            }
            if (data.name) {
              setStoreName(data.name);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch store info:', error);
      }
    };

    fetchStoreInfo();
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
    { id: 'dashboard', label: t('admin.dashboard'), icon: 'dashboard' },
    { id: 'stores', label: language === 'km' ? 'ហាង' : 'Stores', icon: 'stores' },
    { id: 'users', label: language === 'km' ? 'អ្នកប្រើប្រាស់' : 'Users', icon: 'users' },
    { id: 'settings', label: t('admin.settings'), icon: 'settings' },
  ];

  const getIcon = (iconName: string) => {
    const icons: Record<string, JSX.Element> = {
      'dashboard': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      'stores': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      'users': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      'settings': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    };
    return icons[iconName] || null;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: language === 'km' ? 'ហាងសរុប' : 'Total Stores', value: '0', color: 'from-blue-500 to-blue-600', icon: 'stores' },
                { label: language === 'km' ? 'អ្នកប្រើប្រាស់សរុប' : 'Total Users', value: '0', color: 'from-green-500 to-green-600', icon: 'users' },
                { label: language === 'km' ? 'ការបញ្ជាទិញសរុប' : 'Total Orders', value: '0', color: 'from-purple-500 to-purple-600', icon: 'orders' },
                { label: language === 'km' ? 'ប្រាក់ចំណូលសរុប' : 'Total Revenue', value: '$0.00', color: 'from-orange-500 to-orange-600', icon: 'revenue' },
              ].map((stat, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm text-gray-600 mb-1 font-normal ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                    </div>
                    <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white`}>
                      {getIcon(stat.icon)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className={`text-xl font-bold mb-4 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                {language === 'km' ? 'សកម្មភាពរហ័ស' : 'Quick Actions'}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button onClick={() => setActiveTab('stores')} className="p-4 bg-gradient-to-br from-primary/10 to-primary-dark/10 rounded-xl hover:shadow-md transition-all text-center">
                  <svg className="w-8 h-8 mx-auto mb-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className={`text-sm font-medium ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                    {language === 'km' ? 'បន្ថែមហាង' : 'Add Store'}
                  </span>
                </button>
                <button onClick={() => setActiveTab('users')} className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl hover:shadow-md transition-all text-center">
                  <svg className="w-8 h-8 mx-auto mb-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span className={`text-sm font-medium ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                    {language === 'km' ? 'បន្ថែមអ្នកប្រើ' : 'Add User'}
                  </span>
                </button>
                <button className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl hover:shadow-md transition-all text-center">
                  <svg className="w-8 h-8 mx-auto mb-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className={`text-sm font-medium ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                    {language === 'km' ? 'របាយការណ៍' : 'Reports'}
                  </span>
                </button>
                <button className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl hover:shadow-md transition-all text-center">
                  <svg className="w-8 h-8 mx-auto mb-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className={`text-sm font-medium ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                    {language === 'km' ? 'ការកំណត់' : 'Settings'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        );
      case 'stores':
        return <StoresView language={language} t={t} />;
      case 'users':
        return <UsersView language={language} t={t} />;
      case 'settings':
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className={`text-xl font-bold mb-6 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
              {language === 'km' ? 'ការកំណត់' : 'Settings'}
            </h2>
            <p className={`text-gray-600 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
              {language === 'km' ? 'ទំព័រនេះនឹងត្រូវបានបន្ថែមនាពេលអនាគត' : 'This page will be added in the future'}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {storeLogo ? (
              <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-gray-200">
                <img src={storeLogo} alt="Store Logo" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">O</span>
              </div>
            )}
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent block">
                {storeName || 'OrderHey!'}
              </span>
              <p className="text-xs text-gray-500">{language === 'km' ? 'Super Admin' : 'Super Admin'}</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                handleTabChange(item.id as Tab);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              } ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
            >
              {getIcon(item.icon)}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className={`font-medium ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
              {t('common.logout')}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <h1 className={`text-2xl font-bold text-gray-800 capitalize ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                {menuItems.find(item => item.id === activeTab)?.label}
              </h1>

              <div className="flex items-center gap-4">
                
                <LanguageSwitcher />
                <button
                  onClick={handleLogout}
                  className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors"
                >
                  {t('common.logout')}
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fadeIn"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
