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
  unreadCount?: number;
  role?: 'admin' | 'superadmin';
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpen,
  onClose,
  onLogout,
  language,
  t,
  unreadCount = 0,
  role = 'admin',
}) => {
  const { logout, profileImage } = useAuth();
  const [userProfile, setUserProfile] = useState<{ email: string; full_name?: string }>({ email: '' });
  const [storeName, setStoreName] = useState<string>('');
  const [storeLogo, setStoreLogo] = useState<string>('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        if (!userId || !token) return;
        const res = await fetch(`/api/users/${userId}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setUserProfile(await res.json());
      } catch {}
    };

    const fetchStoreName = async () => {
      try {
        const storeId = localStorage.getItem('storeId');
        if (storeId) {
          const res = await fetch(`/api/stores?id=${storeId}`);
          if (res.ok) { 
            const d = await res.json(); 
            setStoreName(d.name || ''); 
            setStoreLogo(d.logo_url || d.logo || '');
          }
        }
      } catch {}
    };

    fetchUserProfile();
    if (role === 'admin') fetchStoreName();
    window.addEventListener('storeUpdate', fetchStoreName);
    return () => window.removeEventListener('storeUpdate', fetchStoreName);
  }, [profileImage, role]);

  const adminMenuItems: { id: string; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: language === 'km' ? 'ផ្ទាំងគ្រប់គ្រង' : 'Dashboard', icon: <IconDashboard /> },
    { id: 'reports', label: language === 'km' ? 'របាយការណ៍' : 'Reports', icon: <IconReports /> },
    { id: 'orders', label: language === 'km' ? 'ការបញ្ជាទិញ' : 'Orders', icon: <IconOrders />, badge: unreadCount },
    { id: 'tables', label: language === 'km' ? 'ការគ្រប់គ្រងតុ' : 'Tables', icon: <IconTables /> },
    { id: 'menu', label: language === 'km' ? 'ម៉ឺនុយ' : 'Menu', icon: <IconMenu /> },
    { id: 'categories', label: language === 'km' ? 'ប្រភេទ' : 'Categories', icon: <IconCategories /> },
    { id: 'settings', label: language === 'km' ? 'ការកំណត់' : 'Settings', icon: <IconSettings /> },
    { id: 'billing', label: language === 'km' ? 'វិក័យប័ត្រ' : 'Billing', icon: <IconBilling /> },
  ];

  const superAdminMenuItems: { id: string; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: language === 'km' ? 'ផ្ទាំងគ្រប់គ្រង' : 'Dashboard', icon: <IconDashboard /> },
    { id: 'stores', label: language === 'km' ? 'ហាង' : 'Stores', icon: <IconStores /> },
    { id: 'users', label: language === 'km' ? 'អ្នកប្រើ' : 'Users', icon: <IconUsers /> },
    { id: 'audit', label: language === 'km' ? 'កំណត់ត្រា' : 'Audit Logs', icon: <IconAudit /> },
    { id: 'settings', label: language === 'km' ? 'ការកំណត់' : 'Settings', icon: <IconSettings /> },
  ];

  const menuItems = role === 'superadmin' ? superAdminMenuItems : adminMenuItems;
  const displayName = userProfile.full_name || (userProfile.email ? userProfile.email.split('@')[0] : 'User');
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: '260px', background: '#111827' }}
      >
        {/* Logo / Brand */}
        <div className="flex items-center gap-4 px-6 py-6 border-b border-white/5">
          {role === 'admin' && storeLogo ? (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden bg-white">
              <img src={storeLogo} alt="Store Logo" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg" style={{ background: '#e84c3d' }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          )}
          <div>
            <p className={`text-white font-black text-lg tracking-tight leading-none truncate max-w-[150px] ${language === 'km' ? 'font-khmer font-normal' : ''}`}>
              {role === 'admin' && storeName ? storeName : 'OrderHey!'}
            </p>
            <p className="text-[13px] mt-1 font-medium" style={{ color: '#9ca3af' }}>
              {role === 'superadmin' ? 'Super Admin' : (language === 'km' ? 'ផ្ទាំងគ្រប់គ្រងហាង' : 'Store Admin')}
            </p>
          </div>
        </div>


        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-5 px-4 space-y-1 custom-scrollbar">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] px-3 mb-4" style={{ color: '#6b7280' }}>
            {language === 'km' ? 'ម៉ឺនុយ' : 'Navigation'}
          </p>
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onTabChange(item.id); onClose(); }}
                className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 group relative"
                style={{
                  background: isActive ? 'rgba(232,76,61,0.15)' : 'transparent',
                  color: isActive ? '#e84c3d' : '#9ca3af',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; if (!isActive) e.currentTarget.style.color = '#e5e7eb'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; if (!isActive) e.currentTarget.style.color = '#9ca3af'; }}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full shadow-[0_0_10px_rgba(232,76,61,0.5)]" style={{ background: '#e84c3d' }} />
                )}
                <span className={`flex-shrink-0 transition-colors ${isActive ? 'text-[#e84c3d]' : ''}`}>
                  {item.icon}
                </span>
                <span className={`flex-1 text-left font-semibold tracking-wide ${language === 'km' ? 'font-khmer text-[16px]' : 'text-[15px]'}`}>
                  {item.label}
                </span>
                {item.badge && item.badge > 0 && (
                  <span className="flex-shrink-0 min-w-[24px] h-6 px-2 text-white text-[11px] font-black rounded-full flex items-center justify-center animate-pulse shadow-lg" style={{ background: '#e84c3d' }}>
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom: Language + Logout */}
        <div className="px-3 py-4 border-t border-white/5 space-y-1">
          <div className="lg:hidden px-3 py-2 mb-2">
            <LanguageSwitcher />
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group"
            style={{ color: '#6b7280' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280'; }}
          >
            <svg className="w-4 h-4 flex-shrink-0 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className={`text-sm font-medium ${language === 'km' ? 'font-khmer' : ''}`}>{t('common.logout')}</span>
          </button>
          <div className="px-3 pt-2">
            <p className="text-[10px] text-center" style={{ color: '#374151' }}>v1.01 · OrderHey! Platform</p>
          </div>
        </div>
      </aside>
    </>
  );
};

// ── Icons ──────────────────────────────────────────────
const IconDashboard = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
const IconOrders = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);
const IconTables = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);
const IconMenu = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);
const IconCategories = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
  </svg>
);
const IconSettings = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconBilling = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);
const IconStores = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);
const IconUsers = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);
const IconAudit = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
function IconReports() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

export default Sidebar;
