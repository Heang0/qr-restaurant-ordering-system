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
    return order.totalAmount || order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
      <h2 className={`text-2xl font-bold mb-6 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
        {language === 'km' ? 'ការបញ្ជាទិញរបស់អ្នក' : 'Your Orders'}
      </h2>

      {orders.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className={language === 'km' ? 'font-khmer' : 'font-sans'}>
            {language === 'km' ? 'មិនមានការបញ្ជាទិញទេ' : 'No orders yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-500">
                    {language === 'km' ? 'លេខកូដ' : 'Order'} #{order._id.slice(-6)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>

              <div className="border-t border-gray-100 pt-3 mb-3">
                {order.items.map((item, index) => (
                  <div key={`${order._id}-${index}`} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary-dark/10 overflow-hidden border border-primary/20 flex-shrink-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-primary">x{item.quantity}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`font-medium text-sm truncate ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className={`text-sm font-medium ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? 'សរុប' : 'Total'}:
                </span>
                <span className="text-lg font-bold text-primary">
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
