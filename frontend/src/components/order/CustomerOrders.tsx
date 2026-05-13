'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Order } from '@/types';

interface CustomerOrdersProps {
  orders: Order[];
  language: 'en' | 'km';
  t: (key: string) => string;
}

const CustomerOrders: React.FC<CustomerOrdersProps> = ({ orders, language, t }) => {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      preparing: 'bg-blue-100 text-blue-700',
      ready: 'bg-green-100 text-green-700',
      completed: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: language === 'km' ? 'កំពុងរង់ចាំ' : 'Pending',
      preparing: language === 'km' ? 'កំពុងរៀបចំ' : 'Preparing',
      ready: language === 'km' ? 'រួចរាល់' : 'Ready',
      completed: language === 'km' ? 'បានបញ្ចប់' : 'Completed',
      cancelled: language === 'km' ? 'បានលុបចោល' : 'Cancelled'
    };
    return texts[status] || status;
  };

  const getOrderTotal = (order: Order) => {
    const amount = Number(order.totalAmount || 0);
    if (!isNaN(amount) && amount > 0) return amount;
    return order.items.reduce((sum, item) => sum + (Number(item.price || 0) * item.quantity), 0);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
      <h2 className={`text-xl font-semibold mb-6 text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}>
        {language === 'km' ? 'ប្រវត្តិនៃការកុម្ម៉ង់' : 'Order History'}
      </h2>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className={`text-[12px] font-medium text-gray-400 uppercase tracking-widest ${language === 'km' ? 'font-khmer' : ''}`}>
            {language === 'km' ? 'មិនទាន់មានការកុម្ម៉ង់ទេ' : 'No orders yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm transition-all active:scale-[0.99]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-md">
                      #{order.id.slice(-6).toUpperCase()}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium">
                    {new Date(order.createdAt).toLocaleString(language === 'km' ? 'km-KH' : 'en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-5">
                {order.items.map((item, index) => (
                  <div key={`${order.id}-${index}`} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 flex-shrink-0 overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[12px] font-bold text-gray-400">{item.quantity}x</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-medium text-[14px] text-gray-900 truncate ${language === 'km' ? 'font-khmer' : ''}`}>
                          {item.name}
                        </p>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">x{item.quantity}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[14px] font-semibold text-gray-900 tracking-tight">
                      ${(Number(item.price || 0) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <span className={`text-[12px] font-medium text-gray-500 uppercase tracking-widest ${language === 'km' ? 'font-khmer' : ''}`}>
                  {language === 'km' ? 'សរុប' : 'Total'}
                </span>
                <span className="text-[17px] font-semibold text-primary tracking-tight">
                  ${getOrderTotal(order).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
