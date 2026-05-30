'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import ModalPortal from '@/components/Portal';
import { OrderSkeleton } from '@/components/admin/Skeletons';
import { EmptyState } from '@/components/admin/EmptyState';

interface OrderItem {
  name: string;
  nameKm?: string;
  price: number;
  quantity: number;
  options?: Array<{ name: string; nameKm?: string; price: number }>;
  remark?: string;
  image?: string;
}

interface Order {
  id: string;
  _id?: string;
  tableId: string;
  tableName?: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  createdAt: string;
  tables?: { name: string };
}

interface OrdersViewProps {
  language: 'en' | 'km';
  t: (key: string) => string;
}

const OrdersView: React.FC<OrdersViewProps> = ({ language, t }) => {
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [storeName, setStoreName] = useState<string>('');

  const kmText = {
    all: 'ទាំងអស់',
    pending: 'ថ្មី',
    preparing: 'កំពុងធ្វើ',
    ready: 'រួចរាល់',
    completed: 'បានបញ្ចប់',
    cancelled: 'បានបោះបង់',
    accept: 'ទទួលយក',
    markReady: 'រួចរាល់',
    markCompleted: 'បញ្ចប់',
    details: 'ព័ត៌មានលម្អិត',
    table: 'តុ',
    items: 'មុខម្ហូប',
    total: 'សរុប',
    status: 'ស្ថានភាព',
    close: 'បិទ'
  };

  useEffect(() => {
    const isAnyModalOpen = showDetailsModal;
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
    };
  }, [showDetailsModal]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const storeId = localStorage.getItem('storeId');
    if (storeId) {
      fetch(`/api/stores?id=${storeId}`)
        .then(res => res.json())
        .then(data => setStoreName(data.name || ''));
    }
  }, []);

  const fetchOrders = async () => {
    try {
      const storeId = localStorage.getItem('storeId');
      const response = await fetch(`/api/orders?storeId=${storeId}`, { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    // Optimistic update
    setOrders(prev => prev.map(o => getOrderId(o) === orderId ? { ...o, status: status as any } : o));

    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        toast.success(language === 'km' ? 'ស្ថានភាពត្រូវបានផ្លាស់ប្តូរ!' : 'Status updated!');
        fetchOrders();
      } else {
        fetchOrders();
        toast.error('Failed to update status');
      }
    } catch (error) {
      fetchOrders();
      toast.error('Failed to update status');
    }
  };

  const getOrderId = (order: Order) => order.id || order._id || '';
  const getTableLabel = (order: Order) => order.tableName || order.tables?.table_number || order.tables?.name || order.tableId || order.table_id || 'N/A';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'preparing': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'ready': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all') return ['pending', 'preparing', 'ready'].includes(order.status);
    return order.status === filterStatus;
  }).sort((a, b) => new Date(b.createdAt || b.created_at || new Date()).getTime() - new Date(a.createdAt || a.created_at || new Date()).getTime());

  const getOrderTotal = (order: Order) => {
    return order.items.reduce((sum, item) => {
      const itemBase = item.price * item.quantity;
      const optionsExtra = (item.options || []).reduce((optSum, opt) => optSum + (opt.price * item.quantity), 0);
      return sum + itemBase + optionsExtra;
    }, 0);
  };

  const getItemSubtotal = (item: OrderItem) => {
    const base = item.price * item.quantity;
    const extras = (item.options || []).reduce((sum, opt) => sum + (opt.price * item.quantity), 0);
    return base + extras;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <h2 className={`text-xl font-bold text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}>
            {language === 'km' ? 'ការគ្រប់គ្រងការបញ្ជាទិញ' : 'Live Order Flow'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['all', 'pending', 'preparing', 'ready'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors border ${
                filterStatus === status 
                  ? 'bg-primary border-primary text-white' 
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              } ${language === 'km' ? 'font-khmer' : ''}`}
            >
              {language === 'km' ? kmText[status as keyof typeof kmText] : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className={`px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'តុ' : 'Table'}</th>
                <th className={`px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'មុខម្ហូប' : 'Items'}</th>
                <th className={`px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'សរុប' : 'Total'}</th>
                <th className={`px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'ស្ថានភាព' : 'Status'}</th>
                <th className={`px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'សកម្មភាព' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <OrderSkeleton />
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={4} className="py-24"><EmptyState type="orders" /></td></tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={getOrderId(order)} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center font-bold text-gray-700">{getTableLabel(order)}</div>
                          <span className="text-xs font-medium text-gray-500">{new Date(order.createdAt || order.created_at || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-col gap-3 max-h-[160px] overflow-y-auto custom-scrollbar pr-2">
                         {order.items.map((item, idx) => (
                           <div key={idx} className="flex items-start gap-3">
                             {item.image ? (
                               <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg border border-gray-100 object-cover shrink-0 bg-white" />
                             ) : (
                               <div className="w-10 h-10 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center text-[9px] text-gray-400 font-bold shrink-0">N/A</div>
                             )}
                             <div className="flex flex-col flex-1 min-w-0 pt-0.5">
                               <span className={`text-[13px] font-bold text-gray-800 truncate leading-tight ${language === 'km' ? 'font-khmer' : ''}`}>
                                 <span className="text-primary mr-1">{item.quantity}x</span>{item.name}
                               </span>
                               {item.remark && <span className={`text-[11px] text-amber-600 font-semibold truncate mt-0.5 ${language === 'km' ? 'font-khmer' : ''}`}>{item.remark}</span>}
                             </div>
                           </div>
                         ))}
                       </div>
                    </td>
                    <td className="px-6 py-4 font-black text-gray-900 text-right align-top">${getOrderTotal(order).toFixed(2)}</td>
                    <td className="px-6 py-4 text-center align-top">
                       <span className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                         {language === 'km' ? kmText[order.status as keyof typeof kmText] : order.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right align-top">
                       <button onClick={() => { setSelectedOrder(order); setShowDetailsModal(true); }} className={`px-4 py-2 bg-gray-900 text-white hover:bg-black rounded-xl text-xs font-bold transition-all shadow-md shadow-gray-900/10 active:scale-[0.98] ${language === 'km' ? 'font-khmer' : ''}`}>
                         {language === 'km' ? 'លម្អិត' : 'Details'}
                       </button>
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
        <ModalPortal>
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm animate-fadeIn" onClick={() => setShowDetailsModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4 relative pointer-events-none">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col animate-scaleIn pointer-events-auto overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
                 <div className="flex items-center gap-4">
                    <span className="w-10 h-10 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center font-bold">{getTableLabel(selectedOrder)}</span>
                    <div>
                       <h3 className={`text-lg font-bold text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}>
                         {language === 'km' ? `តុ ${getTableLabel(selectedOrder)}` : `Table ${getTableLabel(selectedOrder)}`}
                       </h3>
                       <p className="text-xs text-gray-500">INV: #{getOrderId(selectedOrder).slice(-8)}</p>
                    </div>
                 </div>
                 <button type="button" onClick={() => setShowDetailsModal(false)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-200 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>

              <div className="p-6 space-y-4">
                 {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center group">
                        <div className="flex items-center gap-4">
                           {item.image ? (
                             <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl border border-gray-100 object-cover shadow-sm bg-white" />
                           ) : (
                             <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">N/A</div>
                           )}
                           <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-sm font-black text-gray-800">{item.quantity}</div>
                          <div>
                             <p className={`text-sm font-semibold text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}>{item.name}</p>
                             {item.remark && <p className={`text-xs text-amber-600 mt-1 ${language === 'km' ? 'font-khmer' : ''}`}>{item.remark}</p>}
                          </div>
                       </div>
                       <span className="font-semibold text-gray-900">${getItemSubtotal(item).toFixed(2)}</span>
                    </div>
                 ))}
                 
                 <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mt-6">
                    <div className="flex items-center justify-between mb-2">
                       <span className={`text-sm font-semibold text-gray-500 ${language === 'km' ? 'font-khmer' : ''}`}>
                         {language === 'km' ? 'សរុប' : 'Grand Total'}
                       </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">${getOrderTotal(selectedOrder).toFixed(2)}</div>
                 </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3 flex-shrink-0">
                 {selectedOrder.status === 'pending' && (
                    <button onClick={() => { updateOrderStatus(getOrderId(selectedOrder), 'preparing'); setShowDetailsModal(false); }} className={`flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors ${language === 'km' ? 'font-khmer' : ''}`}>
                      {language === 'km' ? 'ទទួលយក' : 'Accept Order'}
                    </button>
                 )}
                 {selectedOrder.status === 'preparing' && (
                    <button onClick={() => { updateOrderStatus(getOrderId(selectedOrder), 'ready'); setShowDetailsModal(false); }} className={`flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors ${language === 'km' ? 'font-khmer' : ''}`}>
                      {language === 'km' ? 'រួចរាល់' : 'Mark Ready'}
                    </button>
                 )}
                 <button onClick={() => setShowDetailsModal(false)} className={`flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors ${language === 'km' ? 'font-khmer' : ''}`}>
                   {language === 'km' ? 'បិទ' : 'Close'}
                 </button>
              </div>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default OrdersView;
