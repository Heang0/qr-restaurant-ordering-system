'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface DashboardViewProps {
  language: 'en' | 'km';
  t: (key: string) => string;
}

const DashboardView: React.FC<DashboardViewProps> = ({ language, t }) => {
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
    { label: language === 'km' ? 'ការបញ្ជាទិញសរុប' : 'Total Orders', value: stats.totalOrders, icon: 'orders', color: 'from-blue-500 to-blue-600' },
    { label: language === 'km' ? 'ប្រាក់ចំណូល' : 'Revenue', value: `$${stats.revenue.toFixed(2)}`, icon: 'revenue', color: 'from-green-500 to-green-600' },
    { label: language === 'km' ? 'តុសកម្ម' : 'Active Tables', value: stats.activeTables, icon: 'table', color: 'from-purple-500 to-purple-600' },
    { label: language === 'km' ? 'មុខម្ហូប' : 'Menu Items', value: stats.menuItems, icon: 'menu', color: 'from-orange-500 to-orange-600' },
  ];

  const getIcon = (iconName: string) => {
    const icons: Record<string, JSX.Element> = {
      'orders': <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      'revenue': <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      'table': <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
      'menu': <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    };
    return icons[iconName] || null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className={`text-xl font-bold mb-4 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
          {language === 'km' ? 'សកម្មភាពរហ័ស' : 'Quick Actions'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button onClick={() => handleTabChange('menu')} className="p-4 bg-gradient-to-br from-primary/10 to-primary-dark/10 rounded-xl hover:shadow-md transition-all text-center">
            <svg className="w-8 h-8 mx-auto mb-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            <span className={`text-sm font-medium ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>{language === 'km' ? 'បន្ថែមមុខម្ហូប' : 'Add Item'}</span>
          </button>
          <button onClick={() => handleTabChange('orders')} className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl hover:shadow-md transition-all text-center">
            <svg className="w-8 h-8 mx-auto mb-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className={`text-sm font-medium ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>{language === 'km' ? 'បញ្ជាក់ការបញ្ជា' : 'Confirm Order'}</span>
          </button>
          <button className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl hover:shadow-md transition-all text-center">
            <svg className="w-8 h-8 mx-auto mb-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <span className={`text-sm font-medium ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>{language === 'km' ? 'របាយការណ៍' : 'Reports'}</span>
          </button>
          <button onClick={() => handleTabChange('settings')} className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl hover:shadow-md transition-all text-center">
            <svg className="w-8 h-8 mx-auto mb-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span className={`text-sm font-medium ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>{language === 'km' ? 'ការកំណត់' : 'Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
