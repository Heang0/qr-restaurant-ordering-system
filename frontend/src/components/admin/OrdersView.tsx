'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface OrderItem {
  menuItemId: string;
  name: string;
  nameKm?: string;
  quantity: number;
  price: number;
  subtotal: number;
  notes?: string;
}

interface Order {
  _id: string;
  tableId: string;
  tableName: string;
  storeId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface OrdersViewProps {
  language: 'en' | 'km';
  t: (key: string) => string;
}

const kmText = {
  title: 'ការគ្រប់គ្រងការបញ្ជាទិញ',
  all: 'ទាំងអស់',
  pending: 'កំពុងរង់ចាំ',
  preparing: 'កំពុងរៀបចំ',
  ready: 'រួចរាល់',
  completed: 'បានបញ្ចប់',
  cancelled: 'បានលុបចោល',
  revenue: 'ប្រាក់ចំណូល',
  activeTables: 'តុសកម្ម',
  menuItems: 'មុខម្ហូប',
  newOrders: 'ការបញ្ជាទិញថ្មី',
  quickActions: 'សកម្មភាពរហ័ស',
  addItem: 'បន្ថែមមុខម្ហូប',
  confirmOrder: 'បញ្ជាក់ការបញ្ជា',
  reports: 'របាយការណ៍',
  settings: 'ការកំណត់',
  noOrders: 'មិនមានការបញ្ជាទិញទេ',
  table: 'តុ',
  items: 'មុខម្ហូប',
  status: 'ស្ថានភាព',
  time: 'ម៉ោង',
  actions: 'សកម្មភាព',
  viewDetails: 'មើលព័ត៌មានលម្អិត',
  accept: 'ទទួល',
  prepare: 'រៀបចំ',
  markReady: 'រួចរាល់',
  complete: 'បញ្ចប់',
};

const OrdersView: React.FC<OrdersViewProps> = ({ language, t }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundEnabledRef = useRef(false);
  const soundBlockedRef = useRef(false);
  const hasLoadedRef = useRef(false);
  const [soundBlocked, setSoundBlocked] = useState(false);

  useEffect(() => {
    const audio = new Audio('/sounds/new-order.mp3');
    audio.preload = 'auto';
    audio.volume = 0.7;
    audioRef.current = audio;

    const enableSound = async () => {
      if (soundEnabledRef.current) return;

      try {
        if (!audioContextRef.current && typeof window !== 'undefined') {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
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

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const storeId = localStorage.getItem('storeId') || undefined;
      const response = await fetch(`/api/orders?storeId=${storeId || ''}`);
      const data = await response.json();
      
      const nextOrders = Array.isArray(data) ? data : [];
      const nextPendingIds = new Set(
        nextOrders.filter((order: Order) => order.status === 'pending').map((order: Order) => order.id)
      );

      const hasNewPendingOrder =
        hasLoadedRef.current &&
        Array.from(nextPendingIds).some((id) => {
          return true;
        });

      if (hasNewPendingOrder && !soundBlockedRef.current) {
        playNotificationSound();
      }

      hasLoadedRef.current = true;
      setOrders(nextOrders);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const playNotificationSound = async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play();
      } catch {
        soundBlockedRef.current = true;
        setSoundBlocked(true);
      }
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      const updatedOrder = data?.order || null;

      if (updatedOrder) {
        setOrders((prev) =>
          prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
        );
        setSelectedOrder((prev) => (prev?.id === updatedOrder.id ? updatedOrder : prev));
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      preparing: 'bg-blue-100 text-blue-700',
      ready: 'bg-green-100 text-green-700',
      completed: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: language === 'km' ? kmText.pending : 'Pending',
      preparing: language === 'km' ? kmText.preparing : 'Preparing',
      ready: language === 'km' ? kmText.ready : 'Ready',
      completed: language === 'km' ? kmText.completed : 'Completed',
      cancelled: language === 'km' ? kmText.cancelled : 'Cancelled',
    };
    return texts[status] || status;
  };

  const getOrderTotal = (order: Order) => {
    return order.totalAmount || order.items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const getTableLabel = (order: Order) => order.tableName || order.tableId;

  const filteredOrders = filter === 'all' ? orders : orders.filter((order) => order.status === filter);

  const stats = [
    { status: 'all', label: language === 'km' ? kmText.all : 'Total', color: 'from-gray-500 to-gray-600' },
    { status: 'pending', label: language === 'km' ? kmText.pending : 'Pending', color: 'from-yellow-500 to-yellow-600' },
    { status: 'preparing', label: language === 'km' ? kmText.preparing : 'Preparing', color: 'from-blue-500 to-blue-600' },
    { status: 'ready', label: language === 'km' ? kmText.ready : 'Ready', color: 'from-green-500 to-green-600' },
    { status: 'completed', label: language === 'km' ? kmText.completed : 'Completed', color: 'from-purple-500 to-purple-600' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className={`text-xl sm:text-2xl font-black text-gray-900 ${language === 'km' ? 'font-khmer font-normal' : 'font-sans'}`}>
            {language === 'km' ? kmText.title : 'Live Orders'}
          </h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Real-time Kitchen Monitor</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-gray-50 shadow-sm overflow-x-auto no-scrollbar max-w-full">
           {stats.map((stat) => (
             <button
               key={stat.status}
               onClick={() => setFilter(stat.status)}
               className={`px-5 py-2.5 rounded-xl text-[10px] font-normal uppercase tracking-[0.15em] transition-all duration-300 whitespace-nowrap ${
                 filter === stat.status
                   ? 'bg-primary text-white shadow-lg shadow-primary/20'
                   : 'text-gray-400 hover:bg-gray-50'
               } ${language === 'km' ? 'font-khmer' : ''}`}
             >
               {stat.label}
             </button>
           ))}
        </div>
      </div>

      {/* Orders Grid/Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden animate-fadeIn relative">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className={`px-8 py-5 text-left text-[10px] text-gray-400 uppercase tracking-[0.2em] ${language === 'km' ? 'font-khmer font-normal' : 'font-sans font-black'}`}>
                  {language === 'km' ? kmText.table : 'Table'}
                </th>
                <th className={`px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? kmText.items : 'Summary'}
                </th>
                <th className={`px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? 'ទឹកប្រាក់' : 'Total'}
                </th>
                <th className={`px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? kmText.status : 'Status'}
                </th>
                <th className={`px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? kmText.actions : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-primary border-t-transparent"></div>
                      <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{language === 'km' ? 'កំពុងផ្ទុក...' : 'Updating...'}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="max-w-xs mx-auto">
                       <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                       </div>
                       <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                         {language === 'km' ? kmText.noOrders : 'No active orders'}
                       </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-primary/5 transition-all group duration-300">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-black text-lg shadow-lg group-hover:scale-110 transition-transform">
                          {getTableLabel(order)}
                        </div>
                        <div className="flex flex-col">
                           <span className={`text-sm text-gray-900 ${language === 'km' ? 'font-khmer font-normal' : 'font-bold'}`}>Table {getTableLabel(order)}</span>
                           <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">ID: {order.id.slice(-6)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                         <span className={`text-sm text-gray-700 ${language === 'km' ? 'font-khmer font-normal' : 'font-bold'}`}>{order.items.length} {language === 'km' ? 'មុខ' : 'items'}</span>
                         <span className="text-[10px] text-gray-400 font-medium truncate max-w-[150px]">
                            {order.items.map(i => i.name).join(', ')}
                         </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-lg font-black text-primary tracking-tight">${getOrderTotal(order).toFixed(2)}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                         <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                         <span className={language === 'km' ? 'font-khmer font-normal' : ''}>{getStatusText(order.status)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDetailsModal(true);
                          }}
                          className="w-10 h-10 rounded-xl bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        
                        {order.status === 'pending' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'preparing')}
                            className="h-10 px-4 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                          >
                            {language === 'km' ? kmText.accept : 'Accept'}
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'ready')}
                            className="h-10 px-4 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                          >
                            {language === 'km' ? kmText.ready : 'Mark Ready'}
                          </button>
                        )}
                        {order.status === 'ready' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                            className="h-10 px-4 rounded-xl bg-gray-900 text-white text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg"
                          >
                            {language === 'km' ? kmText.complete : 'Deliver'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden border border-white/40">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
               <div>
                  <h3 className={`text-2xl text-gray-900 tracking-tight ${language === 'km' ? 'font-khmer font-normal' : 'font-sans font-black'}`}>
                    Order Details
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Ticket # {selectedOrder.id.slice(-8)}</p>
               </div>
               <button
                onClick={() => setShowDetailsModal(false)}
                className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all group"
              >
                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-8 mb-10">
                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                  <p className={`text-[13px] text-gray-400 uppercase tracking-widest mb-1 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>{language === 'km' ? kmText.table : 'Dining Table'}</p>
                  <p className={`text-2xl text-gray-900 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>{getTableLabel(selectedOrder)}</p>
                </div>
                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
                  <p className={`text-[13px] text-gray-400 uppercase tracking-widest mb-1 ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>Status</p>
                  <p className={`text-lg text-primary uppercase tracking-tight ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>{getStatusText(selectedOrder.status)}</p>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className={`text-sm text-gray-900 uppercase tracking-[0.2em] border-b border-gray-100 pb-4 ${language === 'km' ? 'font-khmer font-normal' : 'font-sans font-black'}`}>
                  {language === 'km' ? kmText.items : 'Menu Selection'}
                </h4>
                <div className="space-y-4">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center font-black text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm border border-gray-100">
                             x{item.quantity}
                          </div>
                          <div>
                             <p className={`text-gray-900 ${language === 'km' ? 'font-khmer font-normal' : 'font-bold'}`}>
                                {language === 'km' && (item as any).nameKm ? (item as any).nameKm : item.name}
                             </p>
                             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Unit Price: ${item.price.toFixed(2)}</p>
                          </div>
                       </div>
                       <p className="font-black text-gray-900 tracking-tight">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10 p-6 rounded-[1.5rem] bg-gray-900 text-white flex items-center justify-between shadow-2xl shadow-gray-200">
                 <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Total Payable</p>
                    <p className="text-3xl font-black tracking-tighter">${getOrderTotal(selectedOrder).toFixed(2)}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Received at</p>
                    <p className="text-sm font-medium">{new Date(selectedOrder.createdAt).toLocaleTimeString()}</p>
                 </div>
              </div>
            </div>

            <div className="p-8 border-t border-gray-100 flex gap-4 bg-gray-50/50">
               <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-6 py-4 rounded-2xl border border-gray-200 bg-white text-xs uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-all shadow-sm font-normal"
               >
                  Close
               </button>
               {selectedOrder.status === 'pending' && (
                 <button
                   onClick={() => {
                     updateOrderStatus(selectedOrder.id, 'preparing');
                     setShowDetailsModal(false);
                   }}
                   className="flex-1 px-6 py-4 rounded-2xl bg-primary text-white text-xs uppercase tracking-widest hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 font-normal"
                 >
                   {language === 'km' ? kmText.accept : 'Process Order'}
                 </button>
               )}
               {selectedOrder.status === 'preparing' && (
                 <button
                   onClick={() => {
                     updateOrderStatus(selectedOrder.id, 'ready');
                     setShowDetailsModal(false);
                   }}
                   className="flex-1 px-6 py-4 rounded-2xl bg-emerald-600 text-white text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 font-normal"
                 >
                   {language === 'km' ? kmText.ready : 'Mark Ready'}
                 </button>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersView;
