'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

import UsersView from '@/components/admin/UsersView';
import StoresView from '@/components/admin/StoresView';
import AuditLogsView from '@/components/admin/AuditLogsView';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import Sidebar from '@/components/admin/Sidebar';

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
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const hasLoadedNotifs = useRef(false);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/audit', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return;
      const logs = await res.json();
      if (!Array.isArray(logs)) return;

      // Map audit logs to notification format, show last 20
      const mapped: Notification[] = logs.slice(0, 20).map((log: any) => {
        const userEmail = log.users?.email || log.user_email || 'System';
        let title = log.action.replace(/_/g, ' ');
        let message = `By: ${userEmail}`;
        let type: Notification['type'] = 'system';
        let targetTab: Tab | undefined = undefined;

        if (log.action === 'USER_LOGIN') {
          title = language === 'km' ? 'អ្នកប្រើចូលប្រព័ន្ធ' : 'User Login';
          message = language === 'km' ? `${userEmail} បានចូលប្រព័ន្ធ` : `${userEmail} logged in`;
          type = 'user';
          targetTab = 'audit';
        } else if (log.entity_type === 'store') {
          title = language === 'km' ? 'ហាងថ្មីបានចុះឈ្មោះ' : 'Store Activity';
          message = language === 'km' ? `ហាង ${userEmail} បានធ្វើបច្ចុប្បន្នភាព` : `Store updated by ${userEmail}`;
          type = 'store';
          targetTab = 'stores';
        } else if (log.entity_type === 'users' || log.action.includes('USER')) {
          title = language === 'km' ? 'ការគ្រប់គ្រងអ្នកប្រើ' : 'User Activity';
          message = language === 'km' ? `${userEmail} ធ្វើការផ្លាស់ប្ដូរ` : `${userEmail} made a change`;
          type = 'user';
          targetTab = 'users';
        }

        // Smart relative time
        const logDate = new Date(log.created_at);
        const diffMs = Date.now() - logDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        let time = '';
        if (diffMins < 1) time = language === 'km' ? 'ទើបតែ' : 'Just now';
        else if (diffMins < 60) time = language === 'km' ? `${diffMins} នាទីមុន` : `${diffMins}m ago`;
        else if (diffHours < 24) time = language === 'km' ? `${diffHours} ម៉ោងមុន` : `${diffHours}h ago`;
        else time = language === 'km' ? `${diffDays} ថ្ងៃមុន` : `${diffDays}d ago`;

        // Preserve read state from localStorage if exists
        const savedRead = localStorage.getItem(`notif_read_${log.id}`) === 'true';

        return {
          id: log.id,
          title,
          message,
          time,
          type,
          read: savedRead,
          targetTab
        };
      });

      setNotifications(mapped);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const clearNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    notifications.forEach(n => localStorage.setItem(`notif_read_${n.id}`, 'true'));
  };

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
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // refresh every 30s
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      clearInterval(interval);
    };
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
    localStorage.setItem(`notif_read_${id}`, 'true');
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className={`text-xl font-bold mb-8 ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'ការកំណត់គណនី' : 'Account Settings'}</h2>
              <div className="flex flex-col lg:flex-row items-start gap-12">
                <div className="relative group mx-auto lg:mx-0">
                  <div className="w-48 h-48 rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 relative z-10 transition-transform duration-500 group-hover:scale-105">
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
                      <label className={`text-sm font-semibold text-gray-700 block mb-1.5 ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'ឈ្មោះពេញ' : 'Full Name'}</label>
                      <input type="text" value={userProfile.full_name || ''} onChange={(e) => setUserProfile({ ...userProfile, full_name: e.target.value })} className={`w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-primary outline-none transition-all text-sm text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`} placeholder={language === 'km' ? 'បញ្ជាក់ឈ្មោះរបស់អ្នក' : 'e.g. John Doe'} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email Address</label>
                      <input type="email" disabled value={userProfile.email} className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-400 cursor-not-allowed" />
                    </div>
                  </div>
                  <button type="submit" disabled={isSaving} className={`bg-primary text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 ${language === 'km' ? 'font-khmer' : ''}`}>
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
    <div className="min-h-screen flex" style={{ background: '#f3f4f6' }}>
      {/* Unified POS Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => handleTabChange(tab as Tab)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
        language={language}
        t={t}
        unreadCount={unreadCount}
        role="superadmin"
      />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-[260px] w-full max-w-full overflow-x-hidden">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <div>
                <h1 className={`text-sm font-bold text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}>
                  {menuItems.find(item => item.id === activeTab)?.label || 'Super Admin'}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden lg:block"><LanguageSwitcher /></div>
              
              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-white text-[9px] font-bold rounded-full flex items-center justify-center" style={{ background: '#e84c3d' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {isNotificationsOpen && (
                  <div className="fixed inset-x-4 top-16 lg:absolute lg:inset-auto lg:right-0 lg:top-full lg:mt-2 w-auto lg:w-[22rem] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-scaleIn z-50">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-xs font-bold text-gray-900 uppercase tracking-wider ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'ការជូនដំណឹង' : 'Notifications'}</h4>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 text-white text-[9px] font-bold rounded-full" style={{ background: '#e84c3d' }}>{unreadCount}</span>
                        )}
                      </div>
                      {notifications.some(n => n.read === false) && (
                        <button onClick={clearNotifications} className={`text-[10px] font-semibold text-gray-400 hover:text-gray-600 ${language === 'km' ? 'font-khmer' : ''}`}>
                          {language === 'km' ? 'សម្អាតទាំងអស់' : 'Mark all read'}
                        </button>
                      )}
                    </div>
                    <div className="max-h-[60vh] lg:max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className={`py-10 text-center text-gray-400 font-medium text-xs ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'មិនមានការជូនដំណឹងទេ' : 'No notifications yet'}</div>
                      ) : (
                        notifications.map((notif) => (
                          <div key={notif.id} onClick={() => handleNotificationClick(notif)} className={`px-5 py-3.5 border-b border-gray-50 flex gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-orange-50/50' : ''}`}>
                            <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-xs`} style={{ background: !notif.read ? '#e84c3d' : '#d1d5db' }}>
                              {notif.type === 'store' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                              {notif.type === 'user' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                              {notif.type === 'system' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold text-gray-900 leading-none mb-1 ${!notif.read ? 'font-bold' : ''} ${language === 'km' ? 'font-khmer' : ''}`}>{notif.title}</p>
                              <p className={`text-[11px] text-gray-500 line-clamp-2 ${language === 'km' ? 'font-khmer' : ''}`}>{notif.message}</p>
                              <p className={`text-[10px] text-gray-300 mt-1 ${language === 'km' ? 'font-khmer' : ''}`}>{notif.time}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Avatar */}
              <div className="relative" ref={profileDropdownRef}>
                <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} className="flex items-center gap-2 pl-2 border-l border-gray-100 hover:opacity-80 transition-opacity">
                  <div className="text-right hidden sm:block">
                    <p className={`text-xs font-semibold text-gray-700 leading-none ${language === 'km' ? 'font-khmer' : ''}`}>{userProfile.full_name || (userProfile.email ? userProfile.email.split('@')[0] : 'User')}</p>
                  </div>
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full overflow-hidden ring-2" style={{ '--tw-ring-color': '#e84c3d' } as React.CSSProperties}>
                      {profileImage ? <img src={profileImage} alt="PF" className="w-full h-full object-cover" /> : <div className="w-full h-full text-white flex items-center justify-center text-xs font-bold" style={{ background: '#e84c3d' }}>{userProfile.email ? userProfile.email.charAt(0).toUpperCase() : '?'}</div>}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  </div>
                </button>
                
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-scaleIn z-50 py-2">
                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                      <p className="text-sm font-bold text-gray-900 truncate">{userProfile.full_name || (userProfile.email ? userProfile.email.split('@')[0] : 'User')}</p>
                      <p className="text-xs text-gray-500 truncate">{userProfile.email}</p>
                    </div>
                    <button 
                      onClick={() => { handleTabChange('settings'); setIsProfileDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors flex items-center gap-2 ${language === 'km' ? 'font-khmer' : ''}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {language === 'km' ? 'ការកំណត់' : 'Settings'}
                    </button>
                    <button 
                      onClick={handleLogout}
                      className={`w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 ${language === 'km' ? 'font-khmer' : ''}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      {language === 'km' ? 'ចាកចេញ' : 'Logout'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 animate-fadeIn overflow-x-hidden">{renderContent()}</main>
      </div>
      {isSidebarOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity" onClick={() => setIsSidebarOpen(false)} />}
    </div>
  );
}
