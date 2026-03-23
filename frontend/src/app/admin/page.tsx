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

    fetchStoreInfo();
  }, []);

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
          nextOrders.filter((order) => order.status === 'pending').map((order) => order._id)
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
        return <DashboardView language={language} t={t} />;
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
        return <DashboardView language={language} t={t} />;
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

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                <h1 className={`hidden text-2xl font-bold text-gray-800 capitalize sm:block ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {t(`admin.${activeTab}`)}
                </h1>
              </div>

              <div className="flex items-center gap-4 ml-auto">
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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fadeIn"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
