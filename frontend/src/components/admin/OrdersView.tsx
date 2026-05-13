'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface OrderItem {
  _id?: string;
  menuItemId?: string;
  name: string;
  nameKm?: string;
  quantity: number;
  price: number;
  subtotal?: number;
  notes?: string;
  image?: string;
}

interface Order {
  id: string;
  _id?: string;
  tableId: string;
  tableName: string;
  storeId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

type ApiOrder = Order & {
  table_id?: string;
  table_name?: string;
  store_id?: string;
  total_price?: number | string;
  total_amount?: number | string;
  created_at?: string;
  updated_at?: string;
  tables?: {
    table_number?: string;
    name?: string;
  };
};

type ApiOrderItem = OrderItem & {
  menu_item_id?: string;
  remark?: string;
};

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

  const toNumber = (value: unknown) => {
    const nextValue = Number(value);
    return Number.isFinite(nextValue) ? nextValue : 0;
  };

  const getItemSubtotal = (item: OrderItem) => {
    const subtotal = toNumber(item.subtotal);
    if (subtotal > 0) return subtotal;
    return toNumber(item.price) * toNumber(item.quantity);
  };

  const normalizeOrder = (order: ApiOrder): Order => ({
    ...order,
    id: order.id || order._id || '',
    tableId: order.tableId || order.table_id || '',
    tableName: order.tableName || order.table_name || order.tables?.table_number || order.tables?.name || '',
    storeId: order.storeId || order.store_id || '',
    totalAmount:
      toNumber(order.totalAmount) ||
      toNumber(order.total_price) ||
      toNumber(order.total_amount) ||
      (Array.isArray(order.items) ? order.items.reduce((sum, item) => sum + getItemSubtotal(item), 0) : 0),
    createdAt: order.createdAt || order.created_at || '',
    updatedAt: order.updatedAt || order.updated_at || '',
    items: Array.isArray(order.items)
      ? order.items.map((item: ApiOrderItem) => ({
          ...item,
          menuItemId: item.menuItemId || item.menu_item_id || '',
          quantity: toNumber(item.quantity),
          price: toNumber(item.price),
          subtotal: getItemSubtotal(item),
          notes: item.notes || item.remark || '',
        }))
      : [],
  });

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
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const storeId = localStorage.getItem('storeId') || undefined;
      const response = await fetch(`/api/orders?storeId=${storeId || ''}`);
      const data = await response.json();
      
      const nextOrders = Array.isArray(data) ? data.map((order: ApiOrder) => normalizeOrder(order)) : [];
      const nextPendingIds = new Set(
        nextOrders.filter((order: Order) => order.status === 'pending').map((order: Order) => getOrderId(order))
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
          prev.map((order) => {
            const currentId = getOrderId(order);
            const updatedId = updatedOrder.id || updatedOrder._id;
            return currentId === updatedId ? updatedOrder : order;
          })
        );
        setSelectedOrder((prev) => {
          const currentId = prev ? getOrderId(prev) : '';
          const updatedId = updatedOrder.id || updatedOrder._id;
          return currentId === updatedId ? updatedOrder : prev;
        });
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
    return toNumber(order.totalAmount) || order.items.reduce((sum, item) => sum + getItemSubtotal(item), 0);
  };

  const getOrderId = (order: Order) => order.id || order._id || '';

  const getTableLabel = (order: Order) => order.tableName || order.tableId || '-';

  const filteredOrders = filter === 'all'
    ? orders.filter((o) => o.status !== 'cancelled' && o.status !== 'completed')
    : orders.filter((order) => order.status === filter);

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
                  <tr key={getOrderId(order)} className="hover:bg-primary/5 transition-all group duration-300">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-black text-lg shadow-lg group-hover:scale-110 transition-transform">
                          {getTableLabel(order)}
                        </div>
                        <div className="flex flex-col">
                           <span className={`text-sm text-gray-900 ${language === 'km' ? 'font-khmer font-normal' : 'font-bold'}`}>Table {getTableLabel(order)}</span>
                           <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">ID: {getOrderId(order).slice(-6)}</span>
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
                            onClick={() => updateOrderStatus(getOrderId(order), 'preparing')}
                            className="h-10 px-4 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                          >
                            {language === 'km' ? kmText.accept : 'Accept'}
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button
                            onClick={() => updateOrderStatus(getOrderId(order), 'completed')}
                            className="h-10 px-4 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                          >
                            {language === 'km' ? kmText.ready : 'Mark Ready'}
                          </button>
                        )}
                        {order.status === 'completed' && (
                          <div className="h-10 px-4 flex items-center justify-center text-emerald-600 font-bold uppercase text-[10px] tracking-widest bg-emerald-50 rounded-xl border border-emerald-100">
                             {language === 'km' ? kmText.completed : 'Delivered'}
                          </div>
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
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 overflow-y-auto p-4 py-8 animate-fadeIn">
          <div className="flex min-h-full items-center justify-center">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden border border-white/40 animate-scaleIn">
              {/* Modal Header - Fixed */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  </div>
                  <div>
                    <h3 className={`text-xl text-gray-900 tracking-tight ${language === 'km' ? 'font-khmer font-normal' : 'font-sans font-black'}`}>
                      {language === 'km' ? 'ព័ត៌មានលម្អិតនៃការបញ្ជាទិញ' : 'Order Specification'}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-0.5">#{getOrderId(selectedOrder).slice(-8)} • Table {getTableLabel(selectedOrder)}</p>
                  </div>
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

            {/* Modal Body - Scrollable */}
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/50">
              <div className="space-y-6">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-colors">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-lg font-black text-primary border border-gray-100 group-hover:bg-primary group-hover:text-white transition-all">
                        {item.quantity}
                      </div>
                      <div>
                        <p className={`text-base text-gray-900 tracking-tight ${language === 'km' ? 'font-khmer font-normal' : 'font-sans font-bold'}`}>
                          {language === 'km' && item.nameKm ? item.nameKm : item.name}
                        </p>
                        {item.notes && (
                          <p className={`text-xs text-amber-600 mt-1 italic flex items-center gap-1.5 ${language === 'km' ? 'font-khmer font-normal' : ''}`}>
                             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                             {item.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-black text-gray-900">${getItemSubtotal(item).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200/60">
                 <div className="flex items-center justify-between mb-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span>${getOrderTotal(selectedOrder).toFixed(2)}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-gray-900 font-black uppercase tracking-widest text-sm">Total Amount</span>
                    <span className="text-2xl font-black text-primary">${getOrderTotal(selectedOrder).toFixed(2)}</span>
                 </div>
              </div>
            </div>

            {/* Modal Footer - Fixed */}
            <div className="p-6 border-t border-gray-100 bg-white flex gap-4 shrink-0">
               {selectedOrder.status === 'pending' && (
                 <button
                   onClick={() => {
                     updateOrderStatus(getOrderId(selectedOrder), 'preparing');
                     setShowDetailsModal(false);
                   }}
                   className="flex-1 py-4 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-[0.15em] hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 transition-all active:scale-95"
                 >
                   {language === 'km' ? kmText.accept : 'Accept Order'}
                 </button>
               )}
               {selectedOrder.status === 'preparing' && (
                 <button
                   onClick={() => {
                     updateOrderStatus(getOrderId(selectedOrder), 'completed');
                     setShowDetailsModal(false);
                   }}
                   className="flex-1 py-4 bg-green-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.15em] hover:shadow-xl hover:shadow-green-600/20 hover:-translate-y-0.5 transition-all active:scale-95"
                 >
                   {language === 'km' ? kmText.markReady : 'Mark as Ready'}
                 </button>
               )}
               <button
                 onClick={() => setShowDetailsModal(false)}
                 className={`px-8 py-4 border border-gray-100 bg-gray-50 text-gray-400 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-all ${selectedOrder.status === 'completed' ? 'flex-1' : ''}`}
               >
                 {language === 'km' ? 'បិទ' : 'Close'}
               </button>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default OrdersView;
