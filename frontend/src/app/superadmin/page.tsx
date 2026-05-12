'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

import UsersView from '@/components/admin/UsersView';
import StoresView from '@/components/admin/StoresView';
import AuditLogsView from '@/components/admin/AuditLogsView';
import LanguageSwitcher from '@/components/LanguageSwitcher';

type Tab = 'dashboard' | 'stores' | 'users' | 'audit' | 'settings';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'user' | 'store' | 'system';
  read: boolean;
  targetTab?: Tab;
}

export default function SuperAdminPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { logout, profileImage, updateProfileImage } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ email: string; full_name?: string; profile_image?: string }>({ email: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'New Store Registered', message: 'The "Riverside Bistro" has just registered.', time: '2 mins ago', type: 'store', read: false, targetTab: 'stores' },
    { id: '2', title: 'Admin Account Created', message: 'A new store manager (Dara) was added.', time: '1 hour ago', type: 'user', read: false, targetTab: 'users' },
    { id: '3', title: 'System Update', message: 'System updated to version 2.1.0', time: '5 hours ago', type: 'system', read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const savedTab = localStorage.getItem('superAdminTab') as Tab;
    if (savedTab && ['dashboard', 'stores', 'users', 'audit', 'settings'].includes(savedTab)) {
      setActiveTab(savedTab);
    }
    fetchUserProfile();

    const handleClickOutside = (e: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileImage]);

  const fetchUserProfile = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
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

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    localStorage.setItem('superAdminTab', tab);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ full_name: userProfile.full_name })
      });
      if (res.ok) {
        alert(language === 'km' ? 'ព័ត៌មានត្រូវបានរក្សាទុក!' : 'Profile updated!');
      }
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleNotificationClick = (notif: Notification) => {
    markAsRead(notif.id);
    if (notif.targetTab) {
      handleTabChange(notif.targetTab);
    }
    setIsNotificationsOpen(false);
  };

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('token');
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const uploadData = await uploadRes.json();
      if (uploadData.url) {
        const userId = localStorage.getItem('userId');
        const updateRes = await fetch(`/api/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ profile_image: uploadData.url })
        });
        if (updateRes.ok) {
          updateProfileImage(uploadData.url);
          setUserProfile(prev => ({ ...prev, profile_image: uploadData.url }));
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: t('admin.dashboard'), icon: 'dashboard' },
    { id: 'stores', label: language === 'km' ? 'ហាង' : 'Stores', icon: 'stores' },
    { id: 'users', label: language === 'km' ? 'អ្នកប្រើប្រាស់' : 'Users', icon: 'users' },
    { id: 'audit', label: language === 'km' ? 'កំណត់ត្រា' : 'Audit Logs', icon: 'audit' },
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
      'audit': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: language === 'km' ? 'ហាងសរុប' : 'Total Stores', value: '0', color: 'from-blue-500 to-blue-600', icon: 'stores' },
                { label: language === 'km' ? 'អ្នកប្រើប្រាស់សរុប' : 'Total Users', value: '1', color: 'from-green-500 to-green-600', icon: 'users' },
                { label: language === 'km' ? 'ការបញ្ជាទិញសរុប' : 'Total Orders', value: '0', color: 'from-purple-500 to-purple-600', icon: 'orders' },
                { label: language === 'km' ? 'ប្រាក់ចំណូលសរុប' : 'Total Revenue', value: '$0.00', color: 'from-orange-500 to-orange-600', icon: 'revenue' },
              ].map((stat, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm text-gray-600 mb-1 font-normal ${language === 'km' ? 'font-khmer text-base' : 'font-sans'}`}>{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                    </div>
                    <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white`}>
                      {getIcon(stat.icon)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'stores': return <StoresView language={language} t={t} />;
      case 'users': return <UsersView language={language} t={t} />;
      case 'audit': return <AuditLogsView language={language} t={t} />;
      case 'settings':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-10">
              <h2 className={`text-2xl font-black mb-10 ${language === 'km' ? 'font-khmer font-normal' : 'font-sans'}`}>{language === 'km' ? 'ការកំណត់គណនី' : 'Account Settings'}</h2>
              <div className="flex flex-col lg:flex-row items-start gap-12">
                <div className="relative group mx-auto lg:mx-0">
                  <div className="w-48 h-48 rounded-full overflow-hidden border-8 border-white shadow-2xl bg-gray-50 relative z-10 transition-transform duration-500 group-hover:scale-105">
                    {profileImage ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-200"><svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>}
                    {isUploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]"><div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div></div>}
                  </div>
                  <div className="absolute inset-0 bg-primary/20 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-2 right-2 z-20 bg-primary text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform active:scale-95 border-4 border-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg></button>
                  <input type="file" ref={fileInputRef} onChange={handleProfileUpload} className="hidden" accept="image/*" />
                </div>
                <form onSubmit={handleUpdateProfile} className="flex-1 w-full space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className={`text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 ${language === 'km' ? 'font-khmer text-[12px]' : 'font-sans'}`}>{language === 'km' ? 'ឈ្មោះពេញ' : 'Full Name'}</label>
                      <input type="text" value={userProfile.full_name || ''} onChange={(e) => setUserProfile({ ...userProfile, full_name: e.target.value })} className={`w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-gray-900 ${language === 'km' ? 'font-khmer text-lg' : 'font-sans'}`} placeholder={language === 'km' ? 'បញ្ជាក់ឈ្មោះរបស់អ្នក' : 'e.g. John Doe'} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                      <input type="email" disabled value={userProfile.email} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold text-gray-400 cursor-not-allowed" />
                    </div>
                  </div>
                  <button type="submit" disabled={isSaving} className={`bg-primary text-white px-10 py-5 rounded-2xl font-black text-[13px] uppercase tracking-widest hover:shadow-2xl hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 ${language === 'km' ? 'font-khmer font-bold text-[16px]' : 'font-sans'}`}>
                    {isSaving ? (language === 'km' ? 'កំពុងរក្សាទុក...' : 'Saving...') : (language === 'km' ? 'រក្សាទុកការផ្លាស់ប្តូរ' : 'Save Changes')}
                  </button>
                </form>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-500 ease-in-out lg:translate-x-0 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 border-b border-gray-50 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg bg-gray-100 flex-shrink-0 ring-2 ring-white ring-offset-2 ring-offset-gray-900/5">
              {profileImage ? <img src={profileImage} alt="PF" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-primary text-white flex items-center justify-center font-black text-xl">{userProfile.email ? userProfile.email.charAt(0).toUpperCase() : '?'}</div>}
            </div>
            <div className="overflow-hidden">
              <span className={`text-sm font-black text-gray-900 block truncate ${language === 'km' ? 'font-khmer font-bold text-[15px]' : 'font-sans'}`}>{userProfile.full_name || (userProfile.email ? userProfile.email.split('@')[0] : 'User')}</span>
              <span className={`text-[12px] font-black text-primary uppercase tracking-[0.1em] drop-shadow-md ${language === 'km' ? 'font-khmer text-[13px]' : 'font-sans'}`}>{language === 'km' ? 'អ្នកគ្រប់គ្រងជាន់ខ្ពស់' : 'Super Admin'}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Nav Area */}
        <nav className="p-6 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => { handleTabChange(item.id as Tab); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${activeTab === item.id ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'} ${language === 'km' ? 'font-khmer font-normal text-[16px]' : 'font-sans font-bold text-sm'}`}>
              <div className={activeTab === item.id ? 'text-white' : ''}>{getIcon(item.icon)}</div>
              <span className="tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* STICKY BOTTOM AREA: Language, Logout & Version */}
        <div className="p-6 border-t border-gray-50 space-y-1 bg-white flex-shrink-0">
          <div className="lg:hidden mb-4"><LanguageSwitcher /></div>
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all group">
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span className={`font-black uppercase tracking-widest ${language === 'km' ? 'font-khmer font-bold text-[16px]' : 'font-sans text-xs'}`}>{t('common.logout')}</span>
          </button>
          
          {/* VERSION BADGE */}
          <div className="px-5 py-1">
             <span className={`text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] block text-center ${language === 'km' ? 'font-khmer text-[11px] font-bold tracking-normal opacity-60' : 'font-sans'}`}>
                {language === 'km' ? 'ជំនាន់ v1.01' : 'v1.01 Enterprise'}
             </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-screen lg:ml-72 w-full max-w-full overflow-x-hidden">
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-50 sticky top-0 z-30">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 rounded-2xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
                <h1 className={`text-2xl font-black text-gray-900 tracking-tight capitalize ${language === 'km' ? 'font-khmer font-normal text-3xl' : 'font-sans'}`}>{menuItems.find(item => item.id === activeTab)?.label}</h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-6">
                <div className="hidden lg:block"><LanguageSwitcher /></div>
                <div className="relative" ref={notificationsRef}>
                  <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="p-3 rounded-2xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all relative group">
                    <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    {unreadCount > 0 && <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>}
                  </button>
                  {isNotificationsOpen && (
                    <div className="fixed inset-x-4 top-24 lg:absolute lg:inset-auto lg:right-0 lg:mt-4 w-auto lg:w-[24rem] bg-white rounded-[2rem] shadow-2xl border border-gray-50 overflow-hidden animate-scaleIn z-50">
                      <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Notifications</h4>
                        <span className="px-3 py-1 bg-primary text-white text-[9px] font-black rounded-lg uppercase tracking-widest">{unreadCount} New</span>
                      </div>
                      <div className="max-h-[60vh] lg:max-h-[30rem] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="p-10 text-center text-gray-400 font-bold">No notifications yet</div>
                        ) : (
                          notifications.map((notif) => (
                            <div key={notif.id} onClick={() => handleNotificationClick(notif)} className={`p-5 border-b border-gray-50 flex gap-4 cursor-pointer hover:bg-gray-50 transition-all ${!notif.read ? 'bg-blue-50/30' : ''}`}>
                              <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${notif.type === 'store' ? 'bg-blue-100 text-blue-600' : notif.type === 'user' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                {notif.type === 'store' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                                {notif.type === 'user' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                                {notif.type === 'system' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                              </div>
                              <div className="overflow-hidden">
                                <p className="text-xs font-black text-gray-900 mb-0.5">{notif.title}</p>
                                <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{notif.message}</p>
                                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-2">{notif.time}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-4 text-center bg-gray-50/50">
                        <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Mark all as read</button>
                      </div>
                    </div>
                  )}
                </div>
                <div onClick={() => handleTabChange('settings')} className="flex items-center gap-3 sm:pl-6 sm:border-l sm:border-gray-100 cursor-pointer group">
                  <div className="text-right hidden sm:block">
                    <p className={`text-[12px] font-black text-gray-900 leading-tight ${language === 'km' ? 'font-khmer text-sm' : 'font-sans'}`}>{userProfile.full_name || (userProfile.email ? userProfile.email.split('@')[0] : 'User')}</p>
                    <p className={`text-[10px] font-black text-gray-400 uppercase tracking-widest ${language === 'km' ? 'font-khmer text-[11px]' : 'font-sans'}`}>{language === 'km' ? 'ប្រវត្តិរូប' : 'View Profile'}</p>
                  </div>
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full overflow-hidden shadow-sm bg-gray-50 ring-2 ring-white ring-offset-2 ring-offset-gray-50 group-hover:ring-primary/20 transition-all">
                      {profileImage ? <img src={profileImage} alt="PF" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-100 text-gray-400 flex items-center justify-center font-black text-xs">{userProfile.email ? userProfile.email.charAt(0).toUpperCase() : '?'}</div>}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-8 lg:p-10 animate-fadeIn overflow-x-hidden">{renderContent()}</main>
      </div>
      {isSidebarOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity" onClick={() => setIsSidebarOpen(false)} />}
    </div>
  );
}
