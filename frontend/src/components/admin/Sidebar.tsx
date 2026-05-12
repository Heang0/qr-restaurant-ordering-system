'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  language: 'en' | 'km';
  t: (key: string) => string;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpen,
  onClose,
  onLogout,
  language,
  t,
}) => {
  const { logout, profileImage } = useAuth();
  const [userProfile, setUserProfile] = useState<{ email: string; full_name?: string; profile_image?: string }>({ email: '' });
  const [storeName, setStoreName] = useState<string>('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        if (!userId || !token) return;

        const res = await fetch(`/api/users/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUserProfile(data);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    const fetchStoreName = async () => {
      try {
        const storeId = localStorage.getItem('storeId');
        if (storeId) {
          const response = await fetch(`/api/stores?id=${storeId}`);
          if (response.ok) {
            const data = await response.json();
            setStoreName(data.name || '');
          }
        }
      } catch (error) {
        console.error('Failed to fetch store name:', error);
      }
    };

    fetchUserProfile();
    fetchStoreName();

    window.addEventListener('storeUpdate', fetchStoreName);
    return () => window.removeEventListener('storeUpdate', fetchStoreName);
  }, [profileImage]);

  const menuItems = [
    { id: 'dashboard', icon: 'dashboard', label: language === 'km' ? 'ផ្ទាំងគ្រប់គ្រង' : t('admin.dashboard') },
    { id: 'categories', icon: 'categories', label: language === 'km' ? 'ការគ្រប់គ្រងប្រភេទ' : 'Categories' },
    { id: 'menu', icon: 'menu', label: language === 'km' ? 'ការគ្រប់គ្រងម៉ឺនុយ' : t('admin.menu') },
    { id: 'orders', icon: 'orders', label: language === 'km' ? 'ការគ្រប់គ្រងការបញ្ជាទិញ' : t('admin.orders') },
    { id: 'tables', icon: 'table', label: language === 'km' ? 'ការគ្រប់គ្រងតុ' : t('admin.tables') },
    { id: 'settings', icon: 'settings', label: language === 'km' ? 'ការកំណត់ហាង' : t('admin.settings') },
  ];

  const getIcon = (iconName: string) => {
    const icons: Record<string, JSX.Element> = {
      'dashboard': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      'categories': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      'menu': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      'orders': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      'table': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
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

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-500 ease-in-out lg:translate-x-0 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-8 border-b border-gray-50 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg bg-gray-100 flex-shrink-0 ring-2 ring-white ring-offset-2 ring-offset-gray-900/5">
            {profileImage ? (
              <img src={profileImage} alt="PF" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary text-white flex items-center justify-center font-black text-xl">
                {userProfile.email ? userProfile.email.charAt(0).toUpperCase() : '?'}
              </div>
            )}
          </div>
          <div className="overflow-hidden">
            <span className={`text-sm font-black text-gray-900 block truncate ${language === 'km' ? 'font-khmer font-bold text-[15px]' : 'font-sans'}`}>
              {userProfile.full_name || (userProfile.email ? userProfile.email.split('@')[0] : 'User')}
            </span>
            <span className={`text-[12px] font-black text-primary uppercase tracking-[0.1em] drop-shadow-md ${language === 'km' ? 'font-khmer text-[13px]' : 'font-sans'}`}>
              {storeName || (language === 'km' ? 'អ្នកគ្រប់គ្រងហាង' : 'Store Manager')}
            </span>
          </div>
        </div>
      </div>

      <nav className="p-6 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onTabChange(item.id);
              onClose();
            }}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
              activeTab === item.id
                ? 'bg-primary text-white shadow-xl shadow-primary/20'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            } ${language === 'km' ? 'font-khmer font-normal text-[16px]' : 'font-sans font-bold text-sm'}`}
          >
            <div className={activeTab === item.id ? 'text-white' : ''}>
              {getIcon(item.icon)}
            </div>
            <span className="tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-gray-50 space-y-1 bg-white flex-shrink-0">
        <div className="lg:hidden mb-4">
          <LanguageSwitcher />
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className={`font-black uppercase tracking-widest ${language === 'km' ? 'font-khmer font-bold text-[16px]' : 'font-sans text-xs'}`}>
            {t('common.logout')}
          </span>
        </button>
        
        <div className="px-5 py-1">
          <span className={`text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] block text-center ${language === 'km' ? 'font-khmer text-[11px] font-bold tracking-normal opacity-60' : 'font-sans'}`}>
            {language === 'km' ? 'ជំនាន់ v1.01' : 'v1.01 Enterprise'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
