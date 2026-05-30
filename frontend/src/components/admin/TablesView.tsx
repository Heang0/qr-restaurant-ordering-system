'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '@/contexts/ToastContext';
import ModalPortal from '@/components/Portal';
import { Order, Store } from '@/types';
import { EmptyState } from '@/components/admin/EmptyState';

interface Table {
  id: string;
  name: string;
  slug: string;
  qrCode?: string;
  isActive: boolean;
  bill_requested?: boolean;
}

interface TablesViewProps {
  language: 'en' | 'km';
  t: (key: string) => string;
}

interface ReceiptState {
  table: Table;
  orders: Order[];
}

const TablesView: React.FC<TablesViewProps> = ({ language, t }) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [store, setStore] = useState<Store | null>(null);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [receiptState, setReceiptState] = useState<ReceiptState | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    isActive: true,
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  
  
  // Track tables that have already triggered the TTS so we don't spam it every 5s
  const announcedBillRequestsRef = useRef<Set<string>>(new Set());
  // Pre-loaded static audio — works exactly like the order notification sound
  const billAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio('/sounds/bill-request.mp3');
    audio.preload = 'auto';
    audio.volume = 0.9;
    billAudioRef.current = audio;
    return () => { billAudioRef.current = null; };
  }, []);

  const playTTS = async (tableName: string) => {
    try {
      if (!billAudioRef.current) return;
      billAudioRef.current.currentTime = 0;
      await billAudioRef.current.play();
    } catch (error) {
      console.error('Failed to play bill-request sound:', error);
    }
  };
  
  // KHQR Payment State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentKHQR, setPaymentKHQR] = useState<{ qr: string, md5: string, table: Table, amount: number } | null>(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success'>('pending');

  // KHQR Polling
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const verifyPayment = async () => {
      if (!paymentKHQR?.md5) return;
      try {
        const response = await fetch('/api/payment/verify-khqr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ md5: paymentKHQR.md5, storeId: store?.id })
        });
        const data = await response.json();
        if (response.ok && data.status === 'success') {
          setPaymentStatus('success');
          // Automatically confirm and clear table
          setTimeout(() => {
            handleConfirmPayment(paymentKHQR.table);
          }, 1500);
        }
      } catch (err) {
        console.error('Verification error:', err);
      }
    };

    if (showPaymentModal && paymentKHQR?.md5 && paymentStatus === 'pending') {
      interval = setInterval(verifyPayment, 3000); // Check every 3 seconds
    }
    return () => clearInterval(interval);
  }, [showPaymentModal, paymentKHQR, paymentStatus, store]);

  // Always-current ref so getOrderURL never reads stale closure state
  const storeSlugRef = useRef<string>('');

  const formatCurrency = (value: number | undefined) => `$${(value || 0).toFixed(2)}`;

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
      
  useEffect(() => {
    const isAnyModalOpen = showCreateModal || showQRModal || showReceiptModal || showPaymentModal;
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
  }, [showCreateModal, showQRModal, showReceiptModal, showPaymentModal]);

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 5000);
    return () => clearInterval(interval);
  }, []);

  const getOrdersForTable = (orders: Order[], table: Table) =>
    orders.filter(
      (order: any) => {
        const tableId = order.tableId || order.table_id;
        const tableName = order.tableName || order.table_name || order.tables?.name;
        
        // Match by ID or Name
        const matchesTable = tableId === table.id || tableName === table.name;
        
        // Only include active orders (not cancelled or completed)
        const isActive = ['pending', 'preparing', 'ready'].includes(order.status);
        
        return matchesTable && isActive;
      }
    );

  const fetchTables = async () => {
    try {
      const storeId = localStorage.getItem('storeId');
      if (!storeId) {
        setTables([]);
        setAllOrders([]);
        return;
      }

      const [tablesResponse, storeResponse, ordersResponse] = await Promise.all([
        fetch(`/api/tables?storeId=${storeId}`, { cache: 'no-store' }),
        fetch(`/api/stores?id=${storeId}`, { cache: 'no-store' }),
        fetch(`/api/orders?storeId=${storeId}`, { cache: 'no-store' }),
      ]);

      const tablesData = await tablesResponse.json();
      const storeData = await storeResponse.json();
      const ordersData = await ordersResponse.json();

      const currentBillRequests = new Set<string>();
      
      const mappedTables = Array.isArray(tablesData) ? tablesData.map((t: any) => {
        if (t.bill_requested) {
          currentBillRequests.add(t.id);
          // Only play sound if we haven't announced it yet
          if (!announcedBillRequestsRef.current.has(t.id)) {
            playTTS(t.name);
          }
        }
        return {
          ...t,
          isActive: localStorage.getItem(`table_active_${t.id}`) === 'false' ? false : true
        };
      }) : [];

      announcedBillRequestsRef.current = currentBillRequests;
      setTables(mappedTables);
      setAllOrders(Array.isArray(ordersData) ? ordersData : []);
      setStore(storeData || null);

      if (storeData?.slug && storeData.slug !== 'undefined') {
        storeSlugRef.current = storeData.slug;
        localStorage.setItem('storeSlug', storeData.slug);
      }
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value.toUpperCase();
    const autoSlug = name
      .replace(/\s+/g, '-')
      .replace(/[^A-Z0-9-]/g, '')
      .replace(/-+/g, '-');

    setFormData({ ...formData, name, slug: autoSlug });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const storeId = localStorage.getItem('storeId');
      const response = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, storeId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message === 'PLAN_LIMIT_REACHED') {
          const limitMsg = language === 'km' ? 'ឈានដល់ដែនកំណត់! សូមដំឡើងកញ្ចប់សេវាកម្មរបស់អ្នក។' : 'Limit Reached! Please upgrade your plan in the Billing tab.';
          setMessage({ type: 'error', text: limitMsg });
          throw new Error(limitMsg);
        }
        setMessage({
          type: 'error',
          text: errorData.message || (language === 'km' ? 'មិនអាចបង្កើតតុបានទេ!' : 'Failed to create table!')
        });
        throw new Error(errorData.message || 'Failed to create table');
      }

      setMessage({
        type: 'success',
        text: language === 'km' ? 'តុត្រូវបានបង្កើត!' : 'Table created!',
      });
      setShowCreateModal(false);
      setFormData({ name: '', slug: '', isActive: true });
      fetchTables();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to create table',
      });
    }
  };

  const handleDelete = async (tableId: string) => {
    if (!confirm(language === 'km' ? 'តើអ្នកចង់លុបមែនទេ?' : 'Are you sure?')) return;

    try {
      const response = await fetch(`/api/tables/${tableId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      setMessage({
        type: 'success',
        text: language === 'km' ? 'តុត្រូវបានលុប!' : 'Table deleted!',
      });
      fetchTables();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to delete table',
      });
    }
  };

  const handleShowQR = async (table: Table) => {
    const baseUrl = window.location.origin;
    const slugFromRef = storeSlugRef.current || localStorage.getItem('storeSlug');
    const storeSlug = slugFromRef && slugFromRef !== 'undefined' ? slugFromRef : 'your-store';
    const cleanTableSlug = table.name.toLowerCase().replace(/\s+/g, '-');
    const url = `${baseUrl}/${storeSlug}/${cleanTableSlug}`;
    
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
    setSelectedTable({ ...table, qrCode });
    setShowQRModal(true);
  };

  const toggleActive = async (tableId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      localStorage.setItem(`table_active_${tableId}`, String(newStatus));
      
      setTables(prevTables => 
        prevTables.map(t => 
          t.id === tableId ? { ...t, isActive: newStatus } : t
        )
      );
      
      await fetch(`/api/tables/${tableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus })
      });
    } catch (error) {
      console.error('Failed to update table:', error);
    }
  };

  const clearTableOrders = async (table: Table) => {
    const confirmed = confirm(
      language === 'km'
        ? `លុបការបញ្ជាទិញទាំងអស់សម្រាប់តុ ${table.name}?`
        : `Clear all orders for table ${table.name}?`
    );

    if (!confirmed) return;

    try {
      await fetch(`/api/tables/${table.id}/clear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId: store?.id })
      });

      fetchTables();
      setMessage({ type: 'success', text: language === 'km' ? 'សម្អាតតុបានជោគជ័យ' : 'Table cleared successfully' });
    } catch (error) {
      console.error('Failed to clear orders:', error);
    }
  };

  const handleGeneratePaymentQR = async (table: Table) => {
    const tableOrders = getOrdersForTable(allOrders, table);
    if (tableOrders.length === 0) {
       alert(language === 'km' ? 'មិនមានការកុម្ម៉ង់សម្រាប់តុនេះទេ' : 'No active orders for this table');
       return;
    }
    
    setIsGeneratingQR(true);
    try {
      // Calculate amount for display
      const amount = tableOrders.reduce((sum, order) => {
        const orderAmount = Number(order.totalAmount || 0);
        if (!isNaN(orderAmount) && orderAmount > 0) return sum + orderAmount;
        return sum + order.items.reduce((itemSum, item) => itemSum + (Number(item.price || 0) * item.quantity), 0);
      }, 0);

      const response = await fetch('/api/payment/generate-khqr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store?.id,
          tableId: table.id,
          amount
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate QR');
      }
      
      const data = await response.json();
      
      setPaymentKHQR({ qr: data.qrImage, md5: data.md5, table, amount });
      setShowPaymentModal(true);
    } catch (error: any) {
       alert(error.message || 'Error generating KHQR');
    } finally {
       setIsGeneratingQR(false);
    }
  };

  const handleConfirmPayment = async (tableContext?: Table) => {
    const tableToClear = tableContext || paymentKHQR?.table;
    if (!tableToClear) return;
    try {
      await fetch(`/api/tables/${tableToClear.id}/clear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId: store?.id })
      });
      
      setShowPaymentModal(false);
      setPaymentKHQR(null);
      setPaymentStatus('pending');
      fetchTables();
      
      alert(language === 'km' ? 'ការទូទាត់ជោគជ័យ!' : 'Payment confirmed!');
    } catch (error) {
      console.error('Confirm payment error:', error);
    }
  };

  const getOrderURL = (table: Table) => {
    const baseUrl = window.location.origin;
    const slugFromRef = storeSlugRef.current || localStorage.getItem('storeSlug');
    const storeSlug = slugFromRef && slugFromRef !== 'undefined' ? slugFromRef : 'your-store';
    const cleanTableSlug = table.name.toLowerCase().replace(/\s+/g, '-');
    return `${baseUrl}/${storeSlug}/${cleanTableSlug}`;
  };

  const receiptRows = useMemo(() => {
    if (!receiptState) return [];

    return receiptState.orders.flatMap((order: any) =>
      order.items.map((item: any) => {
        const qty = Number(item.quantity || 0);
        const price = Number(item.price || 0);
        const subtotal = item.subtotal || (qty * price);
        
        return {
          orderId: order.id || order._id,
          createdAt: order.createdAt || order.created_at,
          name: item.name,
          quantity: qty,
          price: price,
          subtotal: subtotal,
          remark: item.remark || item.notes || '',
          options: item.options || [],
        };
      })
    );
  }, [receiptState]);

  const receiptTotal = useMemo(
    () => receiptRows.reduce((sum, item) => sum + item.subtotal, 0),
    [receiptRows]
  );

  const openReceipt = async (table: Table) => {
    const storeId = localStorage.getItem('storeId');
    let latestOrders = allOrders;

    if (storeId) {
      try {
        const response = await fetch(`/api/orders?storeId=${storeId}`);
        const data = await response.json();
        latestOrders = Array.isArray(data) ? data : [];
        setAllOrders(latestOrders);
      } catch (error) {
        console.error('Failed to refresh orders for receipt:', error);
      }
    }

    setReceiptState({
      table,
      orders: getOrdersForTable(latestOrders, table),
    });
    setShowReceiptModal(true);
  };

  const printReceipt = () => {
    if (!receiptState) return;
    // ... existing professional receipt HTML logic inside printReceipt
    // We will just call the print functionality
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-6">
        <div>
          <h2 className={`text-xl font-bold text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}>
            {language === 'km' ? 'ការគ្រប់គ្រងតុ' : 'Table Management'}
          </h2>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)} 
          className={`bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto ${language === 'km' ? 'font-khmer' : ''}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          <span className="hidden sm:inline">{language === 'km' ? 'បង្កើតតុ' : 'Add Table'}</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-primary border-t-transparent"></div>
          </div>
        ) : tables.length === 0 ? (
          <EmptyState type="tables" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className={`px-6 py-4 ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'ឈ្មោះតុ' : 'Table Name'}</th>
                  <th className={`px-6 py-4 ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'ស្ថានភាព' : 'Status'}</th>
                  <th className={`px-6 py-4 ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'សកម្មភាពរហ័ស' : 'Quick Actions'}</th>
                  <th className={`px-6 py-4 text-right ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'គ្រប់គ្រង' : 'Manage'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tables.map((table) => (
                  <tr key={table.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                        </div>
                        <h3 className={`text-sm font-bold text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}>
                          {language === 'km' ? `តុ ${table.name}` : `Table ${table.name}`}
                        </h3>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <button
                         onClick={() => toggleActive(table.id, table.isActive)}
                         className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${
                           table.isActive
                             ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                             : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                         }`}
                       >
                         <span className={`w-1.5 h-1.5 rounded-full ${table.isActive ? 'bg-emerald-500' : 'bg-gray-500'}`}></span>
                         {table.isActive ? (language === 'km' ? 'សកម្ម' : 'Active') : (language === 'km' ? 'បិទ' : 'Inactive')}
                       </button>
                       {table.bill_requested && (
                         <span className={`ml-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-orange-100 text-orange-600 animate-pulse ${language === 'km' ? 'font-khmer font-normal' : ''}`}>
                           🔔 {language === 'km' ? 'ស្នើសុំគិតលុយ' : 'Bill Requested'}
                         </span>
                       )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleShowQR(table)}
                          title="Table QR URL"
                          className={`px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${language === 'km' ? 'font-khmer' : ''}`}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                          Link QR
                        </button>
                        <button
                          onClick={() => handleGeneratePaymentQR(table)}
                          title="Generate Payment KHQR"
                          className={`px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${language === 'km' ? 'font-khmer' : ''}`}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                          Pay QR
                        </button>
                        <button
                          onClick={() => openReceipt(table)}
                          title="Print Receipt"
                          className={`px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md text-xs font-semibold transition-colors ${language === 'km' ? 'font-khmer' : ''}`}
                        >
                          {language === 'km' ? 'វិក្កយបត្រ' : 'Receipt'}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => clearTableOrders(table)}
                            className={`px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-md text-xs font-semibold transition-colors ${language === 'km' ? 'font-khmer' : ''}`}
                          >
                            {language === 'km' ? 'សម្អាត' : 'Clear'}
                          </button>
                          <button
                            onClick={() => handleDelete(table.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tables View Modals */}
      {showCreateModal && (
        <ModalPortal>
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm animate-fadeIn" onClick={() => setShowCreateModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4 relative pointer-events-none">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col animate-scaleIn pointer-events-auto overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
                <h3 className={`text-lg font-bold text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}>
                  {language === 'km' ? 'បង្កើតតុថ្មី' : 'New Table'}
                </h3>
                <button type="button" onClick={() => setShowCreateModal(false)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-200 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                <div className="p-6 space-y-4">
                   <div className="space-y-1">
                      <label className={`block text-xs font-semibold text-gray-600 ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'ឈ្មោះតុ' : 'Table Name'}</label>
                      <input type="text" required value={formData.name} onChange={handleNameChange} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm" placeholder="1, 2, VIP, etc." />
                   </div>
                </div>
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3 flex-shrink-0">
                  <button type="button" onClick={() => setShowCreateModal(false)} className={`flex-1 py-2.5 rounded-xl text-gray-700 bg-white border border-gray-300 font-semibold hover:bg-gray-50 text-sm transition-colors ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'បោះបង់' : 'Cancel'}</button>
                  <button type="submit" className={`flex-1 py-2.5 rounded-xl text-white bg-primary font-semibold hover:bg-primary/90 text-sm transition-colors ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'រក្សាទុក' : 'Save'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedTable?.qrCode && (
        <ModalPortal>
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm animate-fadeIn" onClick={() => setShowQRModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4 relative pointer-events-none">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col animate-scaleIn pointer-events-auto overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
                <h3 className={`text-lg font-bold text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}>
                   QR - {selectedTable.name}
                </h3>
                <button type="button" onClick={() => setShowQRModal(false)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-200 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-8 text-center flex flex-col items-center justify-center space-y-6">
                 <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <img src={selectedTable.qrCode} alt="QR" className="w-48 h-48" />
                 </div>
                 <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 w-full text-left">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Direct URL:</p>
                    <p className="text-xs font-mono text-primary break-all">{getOrderURL(selectedTable)}</p>
                 </div>
              </div>
              <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3 flex-shrink-0">
                <button type="button" onClick={() => setShowQRModal(false)} className={`flex-1 py-2.5 rounded-xl text-gray-700 bg-white border border-gray-300 font-semibold hover:bg-gray-50 text-sm transition-colors ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'បិទ' : 'Close'}</button>
                <button type="button" onClick={() => {
                   const link = document.createElement('a');
                   link.href = selectedTable.qrCode!;
                   link.download = `table-${selectedTable.slug}-qr.png`;
                   link.click();
                 }} className={`flex-1 py-2.5 rounded-xl text-white bg-gray-900 font-semibold hover:bg-gray-800 text-sm transition-colors shadow-sm ${language === 'km' ? 'font-khmer' : ''}`}>{language === 'km' ? 'ទាញយក' : 'Download'}</button>
              </div>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && receiptState && (
        <ModalPortal>
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm animate-fadeIn" onClick={() => setShowReceiptModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4 relative pointer-events-none">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col animate-scaleIn pointer-events-auto overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
                <h3 className={`text-lg font-bold text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}>
                  {language === 'km' ? 'វិក្កយបត្រតុ' : 'Table Receipt'} - {receiptState.table.name}
                </h3>
                <button type="button" onClick={() => setShowReceiptModal(false)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-200 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-6 sm:p-10 bg-gray-50/50 custom-scrollbar overflow-y-auto">
                 <div className="bg-white shadow-sm border border-gray-200 mx-auto max-w-[80mm] relative">
                    {/* Thermal Paper Jagged Top */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-repeat-x print:hidden" style={{ backgroundImage: 'radial-gradient(circle at 4px 0, transparent 4px, white 5px)', backgroundSize: '8px 8px' }}></div>
                    
                    <div id="printable-receipt" className="p-4 pt-6 pb-6 font-mono text-black bg-white" style={{ fontFamily: '"Courier New", Courier, monospace' }}>
                      <div className="text-center mb-4">
                        <h4 className="text-lg font-bold uppercase tracking-wider">{store?.name || 'ORDERYHEY!'}</h4>
                        <div className="text-xs mt-1 space-y-0.5">
                          <p>{store?.address || 'City Center, Phnom Penh'}</p>
                          <p>Tel: {store?.phone || '012 345 678'}</p>
                        </div>
                      </div>

                      <div className="text-xs border-y border-dashed border-black py-2 mb-3">
                        <div className="flex justify-between">
                          <span>Date:</span>
                          <span>{new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Table:</span>
                          <span className="font-bold">{receiptState.table.name}</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs mb-3">
                        {receiptRows.length === 0 ? (
                          <p className="text-center py-2 italic">Empty Transaction</p>
                        ) : (
                          receiptRows.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start">
                              <div className="flex-1 pr-2">
                                <span>{item.quantity}x {item.name}</span>
                              </div>
                              <span>${item.subtotal.toFixed(2)}</span>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="border-t border-dashed border-black pt-2 mb-4">
                        <div className="flex justify-between items-center text-sm font-bold">
                          <span>TOTAL:</span>
                          <span>${receiptTotal.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="text-center text-xs mt-4">
                        <p>*** THANK YOU ***</p>
                        <p className="mt-1 text-[10px]">Powered by OrderHey</p>
                      </div>
                    </div>
                    
                    {/* Thermal Paper Jagged Bottom */}
                    <div className="absolute bottom-0 left-0 w-full h-2 bg-repeat-x print:hidden" style={{ backgroundImage: 'radial-gradient(circle at 4px 8px, transparent 4px, white 5px)', backgroundSize: '8px 8px' }}></div>
                 </div>
              </div>
              <div className="shrink-0 p-8 border-t border-gray-50 bg-gray-50/50">
                 <button onClick={() => {
                   const printContent = document.getElementById('printable-receipt');
                   if (printContent) {
                     const originalBody = document.body.innerHTML;
                     document.body.innerHTML = `
                       <style>
                         @page { margin: 0; }
                         body { margin: 0; padding: 10px; font-family: monospace; width: 100%; max-width: 80mm; background: white; color: black; }
                       </style>
                       ${printContent.outerHTML}
                     `;
                     window.print();
                     window.location.reload();
                   } else {
                     window.print();
                   }
                 }} className="w-full py-4 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-black transition-colors flex justify-center items-center gap-2">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                   {language === 'km' ? 'បោះពុម្ព' : 'Print Receipt'}
                 </button>
              </div>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* Payment KHQR Modal */}
      {showPaymentModal && paymentKHQR && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            
            {/* The Core KHQR Card Asset */}
            <div 
              className="relative bg-white rounded-2xl flex flex-col shadow-[0_0_16px_rgba(0,0,0,0.1)]"
              style={{ width: '330px', height: '479px', fontFamily: '"Nunito Sans", sans-serif' }}
            >
              {/* Header */}
              <div 
                className="relative w-full bg-[#E1232E] rounded-t-2xl flex items-center justify-center" 
                style={{ height: '57px' }}
              >
                {/* Logo */}
                <img src="/images/KHQR Logo.png" alt="KHQR" className="h-[28px] object-contain" />
                
                {/* X Button */}
                <button 
                  onClick={() => setShowPaymentModal(false)} 
                  className="absolute right-4 text-white hover:opacity-75 transition-opacity p-1"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                {/* Downward Tail */}
                <div className="absolute top-full right-0 border-t-[20px] border-t-[#E1232E] border-l-[28px] border-l-transparent pointer-events-none"></div>
              </div>

              {/* Card Body Padding */}
              <div className="flex-1 flex flex-col w-full pt-[38px] pb-[38px] px-[48px]">
                {isGeneratingQR ? (
                   <div className="flex-1 flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#E1232E] border-t-transparent"></div>
                   </div>
                ) : (
                  <>
                    {/* Text Data */}
                    <div className="w-full text-left flex flex-col items-start justify-start">
                      <div className="text-[14px] font-normal text-[#000000] leading-none mb-[8px] whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                        {store?.name || 'Restaurant'} - {paymentKHQR.table.name}
                      </div>
                      <div className="flex items-baseline gap-[6px]">
                        <span className="text-[31px] font-bold text-[#000000] tracking-[0px] leading-none">
                          {paymentKHQR.amount.toFixed(2)}
                        </span>
                        <span className="text-[14px] font-normal text-[#000000] leading-none">
                          USD
                        </span>
                      </div>
                    </div>

                    {/* The QR Code & Coin Badge */}
                    <div className="flex-1 flex items-end justify-center w-full mt-4">
                      <div className="relative" style={{ width: '234px', height: '234px' }}>
                        {paymentKHQR.qr && (
                          <img src={paymentKHQR.qr} alt="QR Code" className="w-full h-full object-contain" />
                        )}
                        {/* Center Badge */}
                        {paymentKHQR.qr && (
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[42px] h-[42px] bg-[#000000] rounded-full border-[3px] border-[#FFFFFF] flex items-center justify-center shadow-none">
                            <span className="text-white font-bold text-lg leading-none mt-0.5">$</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Success Modal Overlay */}
                    {paymentStatus === 'success' && (
                      <div className="absolute inset-0 bg-white/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center z-50 animate-scaleIn">
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-500/30">
                           <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                           </svg>
                        </div>
                        <span className="text-xl font-bold text-gray-900">
                          {language === 'km' ? 'ទូទាត់ប្រាក់ជោគជ័យ!' : 'Payment Successful!'}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Actions for Cashier (Cash only) */}
            <div className="w-[330px] mt-6 flex flex-col gap-3 animate-slideUp">
              <button 
                onClick={() => handleConfirmPayment()}
                className={`w-full py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-colors ${language === 'km' ? 'font-khmer' : ''}`}
              >
                {language === 'km' ? 'បង់ជាសាច់ប្រាក់ (Cash)' : 'Mark as Cash Paid'}
              </button>
            </div>

          </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default TablesView;
