'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Order } from '@/types';

interface CustomerOrdersProps {
  orders: Order[];
  language: 'en' | 'km';
  t: (key: string) => string;
  onRequestBill?: () => void;
}

const CustomerOrders: React.FC<CustomerOrdersProps> = ({ orders, language, t, onRequestBill }) => {
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
            <div key={order.id} className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)] transition-all active:scale-[0.99] mb-8 animate-fadeIn">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[11px] font-black text-primary uppercase tracking-[0.2em] bg-primary/5 px-3 py-1.5 rounded-xl">
                      #{order.id.slice(-6).toUpperCase()}
                    </span>
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] shadow-sm ${getStatusColor(order.status)} ${language === 'km' ? 'font-khmer' : ''}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <p className={`text-[11px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-2 ${language === 'km' ? 'font-khmer' : ''}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {new Date(order.createdAt).toLocaleString(language === 'km' ? 'km-KH' : 'en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Status Stepper */}
              <div className="mb-10 px-2">
                 <div className="relative flex justify-between">
                    {/* Background Line */}
                    <div className="absolute top-4 left-0 w-full h-[2px] bg-gray-100 -z-10"></div>
                    {/* Active Progress Line */}
                    <div 
                      className="absolute top-4 left-0 h-[2px] bg-primary -z-10 transition-all duration-1000 ease-out"
                      style={{ 
                        width: order.status === 'pending' ? '0%' : 
                               order.status === 'preparing' ? '50%' : 
                               (order.status === 'ready' || order.status === 'completed') ? '100%' : '0%' 
                      }}
                    ></div>

                    {/* Steps */}
                    {[
                      { key: 'pending', label: language === 'km' ? 'បានដាក់' : 'Placed' },
                      { key: 'preparing', label: language === 'km' ? 'កំពុងធ្វើ' : 'Kitchen' },
                      { key: 'completed', label: language === 'km' ? 'រួចរាល់' : 'Ready' }
                    ].map((step, idx) => {
                      const isActive = 
                        (order.status === 'pending' && idx === 0) ||
                        (order.status === 'preparing' && idx <= 1) ||
                        ((order.status === 'ready' || order.status === 'completed') && idx <= 2);
                      
                      const isCompleted = 
                        (order.status === 'preparing' && idx < 1) ||
                        ((order.status === 'ready' || order.status === 'completed') && idx < 2);

                      return (
                        <div key={step.key} className="flex flex-col items-center">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 border-4 border-white shadow-md ${
                             isActive ? 'bg-primary text-white scale-110' : 'bg-gray-100 text-gray-300'
                           }`}>
                              {isCompleted || (idx === 2 && (order.status === 'ready' || order.status === 'completed')) ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                              ) : (
                                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-gray-300'}`}></div>
                              )}
                           </div>
                           <span className={`text-[10px] font-black uppercase tracking-widest mt-3 transition-colors ${isActive ? 'text-primary' : 'text-gray-300'} ${language === 'km' ? 'font-khmer' : ''}`}>
                              {step.label}
                           </span>
                        </div>
                      )
                    })}
                 </div>
              </div>

              <div className="space-y-5 mb-8">
                {order.items.map((item, index) => (
                  <div key={`${order.id}-${index}`} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 flex-shrink-0 overflow-hidden shadow-sm">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[12px] font-bold text-gray-400">{item.quantity}x</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-black text-[15px] text-gray-900 truncate leading-tight ${language === 'km' ? 'font-khmer' : ''}`}>
                          {language === 'km' && item.nameKm ? item.nameKm : item.name}
                        </p>
                         <div className="flex flex-col gap-1 mt-1">
                           <div className="flex items-center gap-3">
                             <span className="text-[10px] text-primary font-black uppercase tracking-[0.2em] bg-primary/5 px-2 py-0.5 rounded-md">x{item.quantity}</span>
                             {item.remark && (
                               <span className="text-[10px] text-gray-400 font-medium italic truncate max-w-[150px]">"{item.remark}"</span>
                             )}
                           </div>
                           {(item as any).options && (item as any).options.length > 0 && (
                             <div className="flex flex-wrap gap-1">
                               {(item as any).options.map((opt: any, idx: number) => (
                                 <span key={idx} className={`text-[8px] bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded border border-gray-100 ${language === 'km' ? 'font-khmer' : ''}`}>
                                   {language === 'km' && opt.nameKm ? opt.nameKm : opt.name}
                                 </span>
                               ))}
                             </div>
                           )}
                         </div>
                      </div>
                    </div>
                    <p className="text-[15px] font-black text-gray-900 tracking-tight">
                      ${(Number(item.price || 0) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                <span className={`text-[12px] font-black text-gray-400 uppercase tracking-[0.2em] ${language === 'km' ? 'font-khmer' : ''}`}>
                  {language === 'km' ? 'សរុប' : 'Subtotal'}
                </span>
                <span className="text-2xl font-black text-primary tracking-tighter">
                  ${getOrderTotal(order).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {orders.length > 0 && onRequestBill && (
        <div className="fixed bottom-24 left-0 right-0 px-5 max-w-screen-xl mx-auto flex justify-center z-40 animate-slideUp">
           <button 
             onClick={onRequestBill}
             className={`bg-orange-500 text-white px-8 py-3.5 rounded-full font-black text-sm shadow-[0_8px_30px_rgba(249,115,22,0.3)] hover:bg-orange-600 active:scale-95 transition-all flex items-center gap-2 ${language === 'km' ? 'font-khmer' : 'tracking-widest uppercase'}`}
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
             {language === 'km' ? 'សុំគិតលុយ' : 'Request Bill'}
           </button>
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
