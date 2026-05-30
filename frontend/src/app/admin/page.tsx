'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/admin/Sidebar';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import DashboardView from '@/components/admin/DashboardView';
import CategoriesView from '@/components/admin/CategoriesView';
import MenuView from '@/components/admin/MenuView';
import OrdersView from '@/components/admin/OrdersView';
import TablesView from '@/components/admin/TablesView';
import SettingsView from '@/components/admin/SettingsView';
import BillingView from '@/components/admin/BillingView';
import ReportsView from '@/components/admin/ReportsView';
import { Order } from '@/types';

type Tab = 'dashboard' | 'categories' | 'menu' | 'orders' | 'tables' | 'settings' | 'billing' | 'reports';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'order' | 'system';
  read: boolean;
  orderId?: string;
}

const kmText = {
  soundHint: 'ចុចកន្លែងណាមួយលើទំព័រ Admin ម្តង ដើម្បីអនុញ្ញាតសំឡេងជូនដំណឹង។',
};

export default function AdminPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [soundBlocked, setSoundBlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const hasLoadedRef = useRef(false);
  const pendingOrderIdsRef = useRef<Set<string>>(new Set());
  const soundEnabledRef = useRef(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ email: string; full_name?: string; profile_image?: string }>({ email: '' });
  const { profileImage } = useAuth();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    const saved = localStorage.getItem('admin_notifications');
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse notifications', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('admin_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  React.useEffect(() => {
    const savedTab = localStorage.getItem('adminTab') as Tab;
    if (savedTab && ['dashboard', 'categories', 'menu', 'orders', 'tables', 'settings', 'billing'].includes(savedTab)) {
      setActiveTab(savedTab);
    }
  }, []);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    localStorage.setItem('adminTab', tab);
  };

  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        const storeId = localStorage.getItem('storeId');
        if (storeId) {
          const response = await fetch(`/api/stores?id=${storeId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.slug) {
              localStorage.setItem('storeSlug', data.slug);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch store info:', error);
      }
    };

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

    const handleClickOutside = (e: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    fetchStoreInfo();
    fetchUserProfile();
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileImage]);

  useEffect(() => {
    const audio = new Audio('/sounds/new-order.mp3');
    audio.preload = 'auto';
    audio.volume = 0.7;
    audioRef.current = audio;

    const enableSound = async () => {
      if (soundEnabledRef.current) {
        return;
      }

      try {
        if (!audioContextRef.current && typeof window !== 'undefined') {
          const AudioContextClass =
            window.AudioContext ||
            (window as typeof window & { webkitAudioContext?: typeof AudioContext })
              .webkitAudioContext;

          if (AudioContextClass) {
            audioContextRef.current = new AudioContextClass();
          }
        }

        if (audioContextRef.current?.state === 'suspended') {
          await audioContextRef.current.resume();
        }

        if (audioRef.current) {
          audioRef.current.muted = true;
          await audioRef.current.play();
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current.muted = false;
        }

        soundEnabledRef.current = true;
        setSoundBlocked(false);
      } catch {
        if (audioRef.current) {
          audioRef.current.muted = false;
        }
      }
    };

    window.addEventListener('pointerdown', enableSound);
    window.addEventListener('keydown', enableSound);

    return () => {
      window.removeEventListener('pointerdown', enableSound);
      window.removeEventListener('keydown', enableSound);
      audioRef.current?.pause();
      audioContextRef.current?.close().catch(() => {});
    };
  }, []);

  const playBeepFallback = async () => {
    const audioContext = audioContextRef.current;
    if (!audioContext) {
      throw new Error('Audio context unavailable');
    }

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.18, audioContext.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.45);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.45);
  };

  const playNotification = async () => {
    if (!soundEnabledRef.current) {
      setSoundBlocked(true);
      return;
    }

    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      } else {
        await playBeepFallback();
      }
      setSoundBlocked(false);
    } catch {
      try {
        await playBeepFallback();
        setSoundBlocked(false);
      } catch {
        setSoundBlocked(true);
      }
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchOrdersForSound = async () => {
      try {
        const storeId = localStorage.getItem('storeId') || undefined;
        const response = await fetch(`/api/orders?storeId=${storeId || ''}`, { cache: 'no-store' });
        const data = await response.json();
        if (cancelled) return;

        const nextOrders = Array.isArray(data) ? (data as Order[]) : [];
        const nextPendingIds = new Set(
          nextOrders.filter((order) => order.status === 'pending').map((order) => order.id)
        );

        const hasNewPendingOrder =
          hasLoadedRef.current &&
          Array.from(nextPendingIds).some((id) => !pendingOrderIdsRef.current.has(id));

        if (hasNewPendingOrder) {
          const newOrders = nextOrders.filter(o => 
            o.status === 'pending' && !pendingOrderIdsRef.current.has(o.id)
          );

          newOrders.forEach(order => {
            const tableName = (order as any).tables?.table_number || order.tableId || 'Unknown';
            const newNotif: Notification = {
              id: Date.now() + Math.random().toString(36).substr(2, 9),
              title: language === 'km' ? 'មានការកុម្ម៉ង់ថ្មី' : 'New Order Received',
              message: language === 'km' 
                ? `តុ ${tableName} បានដាក់ការកុម្ម៉ង់ថ្មី។`
                : `Table ${tableName} has placed a new order.`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: 'order',
              read: false,
              orderId: order.id
            };
            setNotifications(prev => [newNotif, ...prev].slice(0, 50));
          });

          void playNotification();
        }

        pendingOrderIdsRef.current = nextPendingIds;
        hasLoadedRef.current = true;
      } catch (error) {
        console.error('Failed to poll admin order notifications:', error);
      }
    };

    fetchOrdersForSound();
    const interval = setInterval(fetchOrdersForSound, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView language={language} t={t} onTabChange={handleTabChange as (tab: string) => void} />;
      case 'reports':
        return <ReportsView language={language} t={t} />;
      case 'categories':
        return <CategoriesView language={language} t={t} />;
      case 'menu':
        return <MenuView language={language} t={t} />;
      case 'orders':
        return <OrdersView language={language} t={t} />;
      case 'tables':
        return <TablesView language={language} t={t} />;
      case 'settings':
        return <SettingsView language={language} t={t} />;
      case 'billing':
        return <BillingView language={language} t={t} />;
      default:
        return <DashboardView language={language} t={t} onTabChange={handleTabChange as (tab: string) => void} />;
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#f3f4f6' }}>
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => handleTabChange(tab as Tab)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
        language={language}
        t={t}
        unreadCount={unreadCount}
        role="admin"
      />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-[260px] w-full max-w-full overflow-x-hidden">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className={`text-sm font-bold text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}>
                  {language === 'km' ? (
                    activeTab === 'dashboard' ? 'ផ្ទាំងគ្រប់គ្រង' :
                    activeTab === 'categories' ? 'ប្រភេទ' :
                    activeTab === 'menu' ? 'ម៉ឺនុយ' :
                    activeTab === 'orders' ? 'ការបញ្ជាទិញ' :
                    activeTab === 'tables' ? 'តុ' :
                    activeTab === 'settings' ? 'ការកំណត់' :
                    activeTab === 'billing' ? 'វិក័យប័ត្រ' : activeTab
                  ) : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden lg:block">
                <LanguageSwitcher />
              </div>

              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
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
                      {notifications.length > 0 && (
                        <button onClick={clearNotifications} className={`text-[10px] font-semibold text-gray-400 hover:text-gray-600 ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'សម្អាតទាំងអស់' : 'Clear all'}</button>
                      )}
                    </div>
                    <div className="max-h-[60vh] lg:max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-10 text-center">
                          <p className={`text-xs text-gray-400 font-medium ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'មិនមានការជូនដំណឹងទេ' : 'No notifications yet'}</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => { markAsRead(notif.id); if (notif.orderId) { handleTabChange('orders'); setIsNotificationsOpen(false); } }}
                            className={`px-5 py-3.5 border-b border-gray-50 flex gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-orange-50/50' : ''}`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-xs`} style={{ background: !notif.read ? '#e84c3d' : '#d1d5db' }}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold text-gray-900 leading-none mb-1 ${!notif.read ? 'font-bold' : ''} ${language === 'km' ? 'font-khmer' : ''}`}>{notif.title}</p>
                              <p className={`text-[11px] text-gray-500 line-clamp-2 ${language === 'km' ? 'font-khmer' : ''}`}>{notif.message}</p>
                              <p className={`text-[10px] text-gray-300 mt-1 ${language === 'km' ? 'font-khmer' : ''}`}>{notif.time}</p>
                            </div>
                            {!notif.read && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 self-center" style={{ background: '#e84c3d' }} />}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Avatar */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 pl-2 border-l border-gray-100 hover:opacity-80 transition-opacity"
                >
                  <div className="text-right hidden sm:block">
                    <p className={`text-xs font-semibold text-gray-700 leading-none ${language === 'km' ? 'font-khmer' : ''}`}>
                      {userProfile.full_name || (userProfile.email ? userProfile.email.split('@')[0] : 'User')}
                    </p>
                  </div>
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full overflow-hidden ring-2" style={{ '--tw-ring-color': '#e84c3d' } as React.CSSProperties}>
                      {(userProfile.profile_image || profileImage) ? (
                        <img src={userProfile.profile_image || profileImage || ''} alt="PF" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full text-white flex items-center justify-center text-xs font-bold" style={{ background: '#e84c3d' }}>
                          {userProfile.email ? userProfile.email.charAt(0).toUpperCase() : '?'}
                        </div>
                      )}
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
                      onClick={() => { logout(); router.push('/login'); }}
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

        <main className="flex-1 p-4 sm:p-6 animate-fadeIn overflow-x-hidden">
          {soundBlocked && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {language === 'km'
                ? kmText.soundHint
                : 'Click once anywhere on the Admin page to enable the order notification sound.'}
            </div>
          )}
          {renderContent()}
        </main>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
