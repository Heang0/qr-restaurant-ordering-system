'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

interface DashboardViewProps {
  language: 'en' | 'km';
  t: (key: string) => string;
  onTabChange: (tab: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ language, t, onTabChange }) => {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalOrders: 0,
    revenue: 0,
    activeTables: 0,
    menuItems: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const storeId = localStorage.getItem('storeId');
      
      if (!storeId) {
        setIsLoading(false);
        return;
      }

      const [ordersRes, menuRes, tablesRes] = await Promise.all([
        fetch(`/api/orders?storeId=${storeId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`/api/menu?storeId=${storeId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`/api/tables?storeId=${storeId}`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const orders = await ordersRes.json();
      const menu = await menuRes.json();
      const tables = await tablesRes.json();

      const revenue = Array.isArray(orders) 
        ? orders.filter((o: any) => o.status === 'completed').reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0)
        : 0;

      setStats({
        totalOrders: Array.isArray(orders) ? orders.length : 0,
        revenue: revenue,
        activeTables: Array.isArray(tables) ? tables.filter((t: any) => t.isActive).length : 0,
        menuItems: Array.isArray(menu) ? menu.length : 0
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statsData = [
    { label: language === 'km' ? 'ការបញ្ជាទិញសរុប' : 'Total Orders', value: stats.totalOrders, icon: 'orders', color: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-50' },
    { label: language === 'km' ? 'ប្រាក់ចំណូល' : 'Revenue', value: `$${stats.revenue.toFixed(2)}`, icon: 'revenue', color: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: language === 'km' ? 'តុសកម្ម' : 'Active Tables', value: stats.activeTables, icon: 'table', color: 'bg-violet-500', text: 'text-violet-600', bg: 'bg-violet-50' },
    { label: language === 'km' ? 'មុខម្ហូប' : 'Menu Items', value: stats.menuItems, icon: 'menu', color: 'bg-orange-500', text: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const getIcon = (iconName: string) => {
    const icons: Record<string, JSX.Element> = {
      'orders': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      'revenue': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      'table': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
      'menu': <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    };
    return icons[iconName] || null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statsData.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold ${language === 'km' ? 'font-khmer' : ''}`}>{stat.label}</p>
                <p className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.bg} ${stat.text}`}>
                {getIcon(stat.icon)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
           <h2 className={`text-xl font-bold text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}>
             {language === 'km' ? 'សកម្មភាពរហ័ស' : 'Quick Operations'}
           </h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button onClick={() => onTabChange('menu')} className="p-5 rounded-xl bg-gray-50 border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-all group text-left flex flex-col">
            <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center mb-4 text-gray-600 group-hover:text-primary group-hover:border-primary/30 transition-colors">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </div>
            <span className={`text-sm font-semibold text-gray-700 group-hover:text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'បន្ថែមមុខម្ហូប' : 'New Menu Item'}</span>
          </button>

          <button onClick={() => onTabChange('orders')} className="p-5 rounded-xl bg-gray-50 border border-gray-100 hover:border-emerald-500/30 hover:bg-emerald-50 transition-all group text-left flex flex-col">
            <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center mb-4 text-gray-600 group-hover:text-emerald-600 group-hover:border-emerald-500/30 transition-colors">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className={`text-sm font-semibold text-gray-700 group-hover:text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'បញ្ជាក់ការបញ្ជា' : 'Order Queue'}</span>
          </button>

          <button onClick={() => onTabChange('tables')} className="p-5 rounded-xl bg-gray-50 border border-gray-100 hover:border-violet-500/30 hover:bg-violet-50 transition-all group text-left flex flex-col">
            <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center mb-4 text-gray-600 group-hover:text-violet-600 group-hover:border-violet-500/30 transition-colors">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" /></svg>
            </div>
            <span className={`text-sm font-semibold text-gray-700 group-hover:text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'តុសកម្ម' : 'Manage Tables'}</span>
          </button>

          <button onClick={() => onTabChange('settings')} className="p-5 rounded-xl bg-gray-50 border border-gray-100 hover:border-orange-500/30 hover:bg-orange-50 transition-all group text-left flex flex-col">
            <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center mb-4 text-gray-600 group-hover:text-orange-600 group-hover:border-orange-500/30 transition-colors">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066" /></svg>
            </div>
            <span className={`text-sm font-semibold text-gray-700 group-hover:text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'ការកំណត់' : 'System Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
