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
        nextOrders.filter((order: Order) => order.status === 'pending').map((order: Order) => order._id)
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
          prev.map((order) => (order._id === updatedOrder._id ? updatedOrder : order))
        );
        setSelectedOrder((prev) => (prev?._id === updatedOrder._id ? updatedOrder : prev));
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
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className={`text-2xl font-bold ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
          {language === 'km' ? kmText.title : 'Orders Management'}
        </h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <button
            key={stat.status}
            onClick={() => setFilter(stat.status)}
            className={`p-4 rounded-2xl transition-all ${
              filter === stat.status
                ? 'bg-gradient-to-br ' + stat.color + ' text-white shadow-lg scale-105'
                : 'bg-white hover:shadow-md'
            }`}
          >
            <p className={`text-sm font-medium ${filter === stat.status ? 'text-white/90' : 'text-gray-600'}`}>
              {stat.label}
            </p>
            <p className={`text-2xl font-bold mt-1 ${filter === stat.status ? 'text-white' : 'text-gray-800'}`}>
              {orders.filter((o) => stat.status === 'all' || o.status === stat.status).length}
            </p>
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className={`px-6 py-4 text-left text-sm font-semibold text-gray-700 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? kmText.table : 'Table'}
                </th>
                <th className={`px-6 py-4 text-left text-sm font-semibold text-gray-700 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? kmText.items : 'Items'}
                </th>
                <th className={`px-6 py-4 text-left text-sm font-semibold text-gray-700 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? kmText.status : 'Status'}
                </th>
                <th className={`px-6 py-4 text-left text-sm font-semibold text-gray-700 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? kmText.time : 'Time'}
                </th>
                <th className={`px-6 py-4 text-left text-sm font-semibold text-gray-700 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? 'ទឹកប្រាក់' : 'Total'}
                </th>
                <th className={`px-6 py-4 text-center text-sm font-semibold text-gray-700 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? kmText.actions : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                      {language === 'km' ? 'កំពុងផ្ទុក...' : 'Loading...'}
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    {language === 'km' ? kmText.noOrders : 'No orders found'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className={`px-6 py-4 font-medium ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                      {getTableLabel(order)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.items.length} {language === 'km' ? 'មុខ' : 'items'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-primary font-bold">${getOrderTotal(order).toFixed(2)}</span>
                    </td>
                    <td className={`px-6 py-4 text-sm text-gray-600 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDetailsModal(true);
                          }}
                          className="px-3 py-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                        >
                          {language === 'km' ? kmText.viewDetails : 'View'}
                        </button>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'preparing')}
                            className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                          >
                            {language === 'km' ? kmText.accept : 'Accept'}
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'ready')}
                            className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                          >
                            {language === 'km' ? kmText.ready : 'Ready'}
                          </button>
                        )}
                        {order.status === 'ready' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'completed')}
                            className="px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                          >
                            {language === 'km' ? kmText.complete : 'Complete'}
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
              <h3 className={`text-xl font-bold ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                {language === 'km' ? 'ព័ត៌មានលម្អិតការបញ្ជាទិញ' : 'Order Details'}
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">{language === 'km' ? kmText.table : 'Table'}</p>
                  <p className={`font-semibold ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>{getTableLabel(selectedOrder)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{language === 'km' ? kmText.time : 'Time'}</p>
                  <p className={`font-semibold ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{language === 'km' ? kmText.status : 'Status'}</p>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{language === 'km' ? 'សរុប' : 'Total'}</p>
                  <p className="text-lg font-bold text-primary">${getOrderTotal(selectedOrder).toFixed(2)}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className={`font-semibold mb-3 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? kmText.items : 'Order Items'}
                </h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={`${selectedOrder._id}-${index}`}
                      className="flex items-center justify-between gap-3 py-2 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary-dark/10 overflow-hidden border border-primary/20 flex-shrink-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">x{item.quantity}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm truncate ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                            {language === 'km' && (item as any).nameKm ? (item as any).nameKm : item.name}
                          </p>
                          <p className="text-xs text-gray-500">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-gray-700">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                {selectedOrder.status === 'pending' && (
                  <button
                    onClick={() => {
                      updateOrderStatus(selectedOrder._id, 'preparing');
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                  >
                    {language === 'km' ? kmText.accept : 'Accept Order'}
                  </button>
                )}
                {selectedOrder.status === 'preparing' && (
                  <button
                    onClick={() => {
                      updateOrderStatus(selectedOrder._id, 'ready');
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
                  >
                    {language === 'km' ? kmText.ready : 'Mark Ready'}
                  </button>
                )}
                {selectedOrder.status === 'ready' && (
                  <button
                    onClick={() => {
                      updateOrderStatus(selectedOrder._id, 'completed');
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 transition-colors"
                  >
                    {language === 'km' ? kmText.complete : 'Complete Order'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersView;
