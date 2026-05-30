'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Order {
  id: string;
  _id?: string;
  status: string;
  totalAmount?: number;
  total_price?: number;
  items: Array<{
    id: string;
    name: string;
    nameKm?: string;
    price: number;
    quantity: number;
  }>;
  createdAt: string;
  created_at?: string;
}

interface ReportsViewProps {
  language: 'en' | 'km';
  t: (key: string) => string;
}

const ReportsView: React.FC<ReportsViewProps> = ({ language, t }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'today' | '7days' | '30days' | 'all'>('today');

  useEffect(() => {
    fetchReportData();
  }, [timeframe]);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const storeId = localStorage.getItem('storeId');
      if (!storeId) return;

      const response = await fetch(`/api/orders?storeId=${storeId}&timeframe=${timeframe}`, { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Analytics Calculations
  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalOrders = completedOrders.length;
  
  const totalRevenue = completedOrders.reduce((sum, order) => {
    const amount = Number(order.totalAmount || order.total_price || 0);
    if (!isNaN(amount) && amount > 0) return sum + amount;
    return sum + order.items.reduce((itemSum, item) => itemSum + (Number(item.price || 0) * item.quantity), 0);
  }, 0);

  const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

  // Item Popularity Calculation
  const itemCounts: Record<string, { name: string; nameKm: string; quantity: number; revenue: number }> = {};
  completedOrders.forEach(order => {
    order.items?.forEach(item => {
      if (!itemCounts[item.name]) {
        itemCounts[item.name] = { name: item.name, nameKm: item.nameKm || item.name, quantity: 0, revenue: 0 };
      }
      itemCounts[item.name].quantity += item.quantity;
      itemCounts[item.name].revenue += (Number(item.price || 0) * item.quantity);
    });
  });

  const topItems = Object.values(itemCounts).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  const timeframes = [
    { id: 'today', labelEn: 'Today', labelKm: 'ថ្ងៃនេះ' },
    { id: '7days', labelEn: '7 Days', labelKm: '៧ ថ្ងៃ' },
    { id: '30days', labelEn: '30 Days', labelKm: '៣០ ថ្ងៃ' },
    { id: 'all', labelEn: 'All Time', labelKm: 'ទាំងអស់' },
  ];

  if (isLoading && orders.length === 0) {
    return (
      <div className="flex-1 p-6 md:p-8 space-y-8 animate-pulse bg-gray-50/50">
        <div className="h-10 bg-gray-200 rounded-xl w-48 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="h-32 bg-gray-200 rounded-2xl"></div>
           <div className="h-32 bg-gray-200 rounded-2xl"></div>
           <div className="h-32 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8 bg-gray-50/50 min-h-screen">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className={`text-2xl font-black text-gray-900 tracking-tight ${language === 'km' ? 'font-khmer' : ''}`}>
            {language === 'km' ? 'របាយការណ៍លក់' : 'Sales Reports'}
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">
            {language === 'km' ? 'ទិន្នន័យនៃការលក់ និងការកុម្ម៉ង់' : 'Store analytics and revenue data'}
          </p>
        </div>

        <div className="flex bg-gray-100/80 p-1.5 rounded-xl self-start overflow-x-auto custom-scrollbar max-w-full">
          {timeframes.map((tf) => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id as any)}
              className={`px-4 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                timeframe === tf.id
                  ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
              } ${language === 'km' ? 'font-khmer font-medium' : ''}`}
            >
              {language === 'km' ? tf.labelKm : tf.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="relative">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">
              {language === 'km' ? 'ចំណូលសរុប' : 'Total Revenue'}
            </p>
            <h3 className="text-4xl font-black text-gray-900 tracking-tight">
              ${totalRevenue.toFixed(2)}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="relative">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            </div>
            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">
              {language === 'km' ? 'ការបញ្ជាទិញសរុប' : 'Total Orders'}
            </p>
            <h3 className="text-4xl font-black text-gray-900 tracking-tight">
              {totalOrders}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all sm:col-span-2 lg:col-span-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="relative">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            </div>
            <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">
              {language === 'km' ? 'តម្លៃមធ្យម / បញ្ជាទិញ' : 'Average Order Value'}
            </p>
            <h3 className="text-4xl font-black text-gray-900 tracking-tight">
              ${averageOrderValue.toFixed(2)}
            </h3>
          </div>
        </div>
      </div>

      {/* Top Items Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className={`text-lg font-bold text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}>
              {language === 'km' ? 'មុខម្ហូបលក់ដាច់បំផុត' : 'Top Selling Items'}
            </h2>
          </div>
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
        </div>
        
        {topItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className={`px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500 ${language === 'km' ? 'font-khmer font-medium' : ''}`}>
                    {language === 'km' ? 'ឈ្មោះមុខម្ហូប' : 'Item Name'}
                  </th>
                  <th className={`px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500 text-right ${language === 'km' ? 'font-khmer font-medium' : ''}`}>
                    {language === 'km' ? 'ចំនួនលក់បាន' : 'Quantity Sold'}
                  </th>
                  <th className={`px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-500 text-right ${language === 'km' ? 'font-khmer font-medium' : ''}`}>
                    {language === 'km' ? 'ចំណូលសរុប' : 'Revenue'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topItems.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`font-bold text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}>
                        {language === 'km' ? item.nameKm || item.name : item.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-sm">
                        {item.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-emerald-600">
                        ${item.revenue.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
            </div>
            <p className="text-gray-500 font-medium">{language === 'km' ? 'មិនទាន់មានទិន្នន័យការលក់នៅឡើយទេ' : 'No sales data available for this timeframe'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsView;
