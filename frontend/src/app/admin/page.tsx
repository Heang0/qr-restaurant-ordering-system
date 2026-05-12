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
import { Order } from '@/types';

type Tab = 'dashboard' | 'categories' | 'menu' | 'orders' | 'tables' | 'settings';

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
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ email: string; full_name?: string; profile_image?: string }>({ email: '' });
  const { profileImage } = useAuth();
  
  const [notifications] = useState([
    { id: '1', title: 'New Order Received', message: 'Table A1 has placed a new order.', time: 'Just now', type: 'order', read: false },
    { id: '2', title: 'Table Request', message: 'Table B2 is requesting assistance.', time: '10 mins ago', type: 'system', read: true },
  ]);
  const unreadCount = notifications.filter(n => !n.read).length;

  React.useEffect(() => {
    const savedTab = localStorage.getItem('adminTab') as Tab;
    if (savedTab && ['dashboard', 'categories', 'menu', 'orders', 'tables', 'settings'].includes(savedTab)) {
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
        const response = await fetch(`/api/orders?storeId=${storeId || ''}`);
        const data = await response.json();
        if (cancelled) return;

        const nextOrders = Array.isArray(data) ? (data as Order[]) : [];
        const nextPendingIds = new Set(
          nextOrders.filter((order) => order.status === 'pending').map((order) => order.id)
        );

        const hasNewPendingOrder =
          hasLoadedRef.current &&
          Array.from(nextPendingIds).some((id) => !pendingOrderIdsRef.current.has(id));

        pendingOrderIdsRef.current = nextPendingIds;
        hasLoadedRef.current = true;

        if (hasNewPendingOrder) {
          void playNotification();
        }
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
      default:
        return <DashboardView language={language} t={t} onTabChange={handleTabChange as (tab: string) => void} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => handleTabChange(tab as Tab)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
        language={language}
        t={t}
      />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-72 w-full max-w-full overflow-x-hidden">
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-50 sticky top-0 z-30">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-3 rounded-2xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className={`text-2xl font-black text-gray-900 tracking-tight capitalize ${language === 'km' ? 'font-khmer font-normal text-3xl' : 'font-sans'}`}>
                  {language === 'km' ? (
                    activeTab === 'dashboard' ? 'ផ្ទាំងគ្រប់គ្រង' :
                    activeTab === 'categories' ? 'ការគ្រប់គ្រងប្រភេទ' :
                    activeTab === 'menu' ? 'ការគ្រប់គ្រងម៉ឺនុយ' :
                    activeTab === 'orders' ? 'ការគ្រប់គ្រងការបញ្ជាទិញ' :
                    activeTab === 'tables' ? 'ការគ្រប់គ្រងតុ' :
                    activeTab === 'settings' ? 'ការកំណត់ហាង' :
                    t(`admin.${activeTab}`)
                  ) : t(`admin.${activeTab}`)}
                </h1>
              </div>

              <div className="flex items-center gap-2 sm:gap-6">
                <div className="hidden lg:block">
                  <LanguageSwitcher />
                </div>

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
                        {notifications.map((notif) => (
                          <div key={notif.id} className={`p-5 border-b border-gray-50 flex gap-4 cursor-pointer hover:bg-gray-50 transition-all ${!notif.read ? 'bg-blue-50/30' : ''}`}>
                            <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center bg-blue-100 text-blue-600`}>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-xs font-black text-gray-900 mb-0.5">{notif.title}</p>
                              <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{notif.message}</p>
                              <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-2">{notif.time}</p>
                            </div>
                          </div>
                        ))}
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
                      {(userProfile.profile_image || profileImage) ? (
                        <img src={userProfile.profile_image || profileImage || ''} alt="PF" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 text-gray-400 flex items-center justify-center font-black text-xs">
                          {userProfile.email ? userProfile.email.charAt(0).toUpperCase() : '?'}
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 lg:p-10 animate-fadeIn overflow-x-hidden">
          {soundBlocked && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
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
