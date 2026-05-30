'use client';

import React from 'react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  status: string;
  image?: string;
  itemName?: string;
  quantity?: number;
}

interface CustomerNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  language: 'en' | 'km';
  t: (key: string) => string;
}

const CustomerNotification: React.FC<CustomerNotificationProps> = ({ 
  isOpen, 
  onClose, 
  notifications, 
  language,
  t 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center sm:justify-end sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/5 backdrop-blur-[2px] animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Panel - Dropdown style */}
      <div className="relative w-[92%] sm:w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden animate-slideDown mt-24 sm:mt-0 flex flex-col max-h-[80vh] ring-1 ring-black/5">
        {/* Header */}
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
          <div>
            <h2 className={`text-base font-black text-gray-900 tracking-tight ${language === 'km' ? 'font-khmer' : ''}`}>
              {language === 'km' ? 'ការជូនដំណឹង' : 'Notifications'}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Live Updates</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 shadow-sm border border-gray-100 transition-all active:scale-90"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-5 text-gray-200">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <p className={`text-[11px] font-black text-gray-400 uppercase tracking-widest ${language === 'km' ? 'font-khmer' : ''}`}>
                {language === 'km' ? 'មិនទាន់មានការជូនដំណឹង' : 'No notifications'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div 
                  key={notif.id}
                  className="bg-white border border-gray-50 rounded-[2.2rem] p-5 hover:bg-gray-50/50 transition-all group active:scale-[0.98] shadow-sm mb-4"
                >
                  <div className="flex gap-5">
                    {/* Item Image with Status Badge */}
                    <div className="relative flex-shrink-0">
                      <div className="w-16 h-16 rounded-[1.5rem] overflow-hidden shadow-md border border-gray-100">
                        {notif.image ? (
                          <img src={notif.image} alt={notif.itemName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-primary/5 flex items-center justify-center text-primary">
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                          </div>
                        )}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center shadow-lg border-2 border-white ${
                        notif.status === 'ready' ? 'bg-green-500 text-white' :
                        notif.status === 'preparing' ? 'bg-blue-500 text-white' :
                        notif.status === 'completed' ? 'bg-purple-500 text-white' :
                        'bg-primary text-white'
                      }`}>
                        {notif.status === 'ready' ? (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        ) : notif.status === 'preparing' ? (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                          notif.status === 'ready' ? 'text-green-600' :
                          notif.status === 'preparing' ? 'text-blue-600' :
                          notif.status === 'completed' ? 'text-purple-600' :
                          'text-primary'
                        } ${language === 'km' ? 'font-khmer' : ''}`}>
                          {notif.title}
                        </span>
                        <span className={`text-[9px] font-bold text-gray-300 uppercase tracking-widest leading-none ${language === 'km' ? 'font-khmer' : ''}`}>{notif.time}</span>
                      </div>
                      
                      <div className="flex items-baseline gap-2 mb-1.5">
                        <h4 className={`text-[14px] font-black text-gray-900 truncate ${language === 'km' ? 'font-khmer' : ''}`}>
                          {notif.itemName || 'Your Order'}
                        </h4>
                        <span className="text-[11px] font-black text-primary/40 uppercase tracking-widest flex-shrink-0">
                          x{notif.quantity || 1}
                        </span>
                      </div>

                      <p className={`text-[12px] text-gray-800 leading-snug font-black ${language === 'km' ? 'font-khmer' : ''}`}>
                        {notif.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-50 bg-gray-50/30 flex justify-center">
           <button 
             onClick={onClose}
             className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-gray-600 transition-colors"
           >
             Close Panel
           </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerNotification;
