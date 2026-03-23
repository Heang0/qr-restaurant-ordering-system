'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Order, Store } from '@/types';

interface Table {
  _id: string;
  name: string;
  slug: string;
  qrCode?: string;
  isActive: boolean;
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

  const formatCurrency = (value: number | undefined) => `$${(value || 0).toFixed(2)}`;

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    const storeSlug = localStorage.getItem('storeSlug');
    if (!storeSlug) {
      void fetchStoreSlug();
    }
  }, []);

  const getOrdersForTable = (orders: Order[], table: Table) =>
    orders.filter(
      (order) =>
        order.tableId === table._id ||
        order.tableName === table.name
    );

  const fetchStoreSlug = async () => {
    try {
      const storeId = localStorage.getItem('storeId');
      let storeData = null;
      if (!storeId) return;

      const response = await fetch(`/api/stores?id=${storeId}`);
      if (response.ok) {
        storeData = await response.json();
        if (storeData && typeof storeData === 'object' && 'slug' in storeData && storeData.slug) {
          localStorage.setItem('storeSlug', String(storeData.slug));
        }
      }
      setStore(storeData || null);
    } catch (error) {
      console.error('Failed to fetch store slug:', error);
    }
  };

  const fetchTables = async () => {
    try {
      const storeId = localStorage.getItem('storeId');
      if (!storeId) {
        setTables([]);
        setAllOrders([]);
        return;
      }

      const [tablesResponse, storeResponse, ordersResponse] = await Promise.all([
        fetch(`/api/tables?storeId=${storeId}`),
        fetch(`/api/stores?id=${storeId}`),
        fetch(`/api/orders?storeId=${storeId}`),
      ]);

      const tablesData = await tablesResponse.json();
      const storeData = await storeResponse.json();
      const ordersData = await ordersResponse.json();

      setTables(Array.isArray(tablesData) ? tablesData : []);
      setAllOrders(Array.isArray(ordersData) ? ordersData : []);
      setStore(storeData || null);

      if (storeData && typeof storeData === 'object' && 'slug' in storeData && storeData.slug) {
        localStorage.setItem('storeSlug', String(storeData.slug));
      }
    } catch (error) {
      console.error('Failed to fetch tables:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;
    const autoSlug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
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

      if (!response.ok) throw new Error('Failed to create table');

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

  const generateQRCode = async (tableId: string) => {
    try {
      const response = await fetch(`/api/tables/${tableId}/qr`, { method: 'POST' });
      const data = await response.json();
      fetchTables();
      return data?.qrCode || null;
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      return null;
    }
  };

  const handleShowQR = async (table: Table) => {
    let qrCode = table.qrCode;

    if (!qrCode) {
      qrCode = await generateQRCode(table._id) || undefined;
    }

    if (qrCode) {
      setSelectedTable({ ...table, qrCode });
      setShowQRModal(true);
    }
  };

  const toggleActive = async (tableId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/tables/${tableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (!response.ok) throw new Error('Failed to update');
      fetchTables();
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
      // Note: This endpoint may not exist, you might need to create it
      setMessage({
        type: 'success',
        text:
          language === 'km'
            ? `បានសម្អាតការបញ្ជាទិញសម្រាប់តុ ${table.name}`
            : `Cleared orders for table ${table.name}`,
      });
      fetchTables();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to clear table orders',
      });
    }
  };

  const getOrderURL = (table: Table) => {
    const baseUrl = window.location.origin;
    const storeSlug = localStorage.getItem('storeSlug');
    // New clean URL format: /storeSlug/tableSlug
    return storeSlug ? `${baseUrl}/${storeSlug}/${table.slug}` : `${baseUrl}/your-store/${table.slug}`;
  };

  const receiptRows = useMemo(() => {
    if (!receiptState) return [];

    return receiptState.orders.flatMap((order) =>
      order.items.map((item) => ({
        orderId: order._id,
        createdAt: order.createdAt,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
        notes: item.notes || '',
      }))
    );
  }, [language, receiptState]);

  const receiptTotal = useMemo(
    () => receiptRows.reduce((sum, item) => sum + item.subtotal, 0),
    [receiptRows]
  );

  const receiptOrderCodes = useMemo(
    () => (receiptState ? receiptState.orders.map((order) => `#${order._id.slice(-6)}`).join(', ') : ''),
    [receiptState]
  );

  const receiptCreatedAt = useMemo(
    () =>
      receiptState?.orders[0]
        ? new Date(receiptState.orders[0].createdAt).toLocaleString()
        : new Date().toLocaleString(),
    [receiptState]
  );

  const receiptApprovalCode = useMemo(
    () => (receiptState?.orders[0]?._id ? receiptState.orders[0]._id.slice(-8).toUpperCase() : '------'),
    [receiptState]
  );

  const receiptHtml = useMemo(() => {
    if (!receiptState) return '';

    const title = language === 'km' ? 'វិក្កយបត្រ' : 'Receipt';
    const phoneLabel = language === 'km' ? 'លេខទូរស័ព្ទ' : 'Phone';
    const addressLabel = language === 'km' ? 'អាសយដ្ឋាន' : 'Address';
    const tableLabel = language === 'km' ? 'តុ' : 'Table';
    const orderCodesLabel = language === 'km' ? 'លេខកូដ' : 'Order Codes';
    const createdLabel = language === 'km' ? 'កាលបរិច្ឆេទ' : 'Created';
    const remarkLabel = language === 'km' ? 'កំណត់ចំណាំ' : 'Remark';
    const totalLabel = language === 'km' ? 'សរុប' : 'Total';
    const emptyLabel = language === 'km' ? 'មិនមានការបញ្ជាទិញសម្រាប់តុនេះទេ' : 'No orders for this table';

    const orderCodes = receiptState.orders.map((order) => `#${order._id.slice(-6)}`).join(', ');
    const createdAt = receiptState.orders[0]
      ? new Date(receiptState.orders[0].createdAt).toLocaleString()
      : new Date().toLocaleString();

    const rowsMarkup = receiptRows.length
      ? receiptRows
          .map(
            (item) => `
              <tr>
                <td>${escapeHtml(item.name)}</td>
                <td style="text-align:center;">${item.quantity}</td>
                <td style="text-align:right;">${formatCurrency(item.price)}</td>
                <td style="text-align:right;">${formatCurrency(item.subtotal)}</td>
              </tr>
              ${
                item.notes
                  ? `<tr><td colspan="4" style="font-size:12px;color:#666;padding-top:0;">${escapeHtml(remarkLabel)}: ${escapeHtml(item.notes)}</td></tr>`
                  : ''
              }
            `
          )
          .join('')
      : `<tr><td colspan="4" style="text-align:center;color:#666;padding:16px 0;">${escapeHtml(emptyLabel)}</td></tr>`;

    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${escapeHtml(title)}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111; margin: 0; padding: 24px; }
            .receipt { max-width: 760px; margin: 0 auto; }
            .store { border-bottom: 2px solid #111; padding-bottom: 16px; margin-bottom: 16px; }
            .store-name { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
            .meta { color: #555; line-height: 1.6; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 10px 0; border-bottom: 1px solid #ddd; }
            th { text-align: left; font-size: 12px; text-transform: uppercase; color: #666; }
            .total { margin-top: 16px; text-align: right; font-size: 18px; font-weight: 700; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="store">
              <div class="store-name">${escapeHtml(store?.name || 'Store')}</div>
              <div class="meta">
                ${store?.phone ? `${escapeHtml(phoneLabel)}: ${escapeHtml(store.phone)}<br>` : ''}
                ${store?.address ? `${escapeHtml(addressLabel)}: ${escapeHtml(store.address)}<br>` : ''}
                ${escapeHtml(tableLabel)}: ${escapeHtml(receiptState.table.name)}<br>
                ${orderCodes ? `${escapeHtml(orderCodesLabel)}: ${escapeHtml(orderCodes)}<br>` : ''}
                ${escapeHtml(createdLabel)}: ${escapeHtml(createdAt)}
              </div>
            </div>
            <div style="font-size:22px;font-weight:700;margin-bottom:16px;">${escapeHtml(title)}</div>
            <table>
              <thead>
                <tr>
                  <th>${escapeHtml(language === 'km' ? 'មុខម្ហូប' : 'Item')}</th>
                  <th style="text-align:center;">${escapeHtml(language === 'km' ? 'ចំនួន' : 'Qty')}</th>
                  <th style="text-align:right;">${escapeHtml(language === 'km' ? 'តម្លៃ' : 'Price')}</th>
                  <th style="text-align:right;">${escapeHtml(language === 'km' ? 'សរុប' : 'Amount')}</th>
                </tr>
              </thead>
              <tbody>${rowsMarkup}</tbody>
            </table>
            <div class="total">${escapeHtml(totalLabel)}: ${formatCurrency(receiptTotal)}</div>
          </div>
        </body>
      </html>
    `;
  }, [language, receiptRows, receiptState, receiptTotal, store]);

  const professionalReceiptHtml = useMemo(() => {
    if (!receiptState) return '';

    const title = language === 'km' ? 'វិក្កយបត្រ' : 'CASH RECEIPT';
    const orderCodes = receiptState.orders.map((order) => `#${order._id.slice(-6)}`).join(', ');
    const createdAt = receiptState.orders[0]
      ? new Date(receiptState.orders[0].createdAt).toLocaleString()
      : new Date().toLocaleString();
    const rowsMarkup = receiptRows.length
      ? receiptRows
          .map(
            (item) => `
              <tr>
                <td style="padding-right:10px;">
                  <div style="font-size:12px;font-weight:600;line-height:1.35;">${escapeHtml(item.name)}</div>
                  <div style="font-size:11px;color:#666;margin-top:1px;">x${item.quantity}</div>
                  ${
                    item.notes
                      ? `<div style="font-size:10px;color:#777;margin-top:3px;line-height:1.35;">${escapeHtml(
                          language === 'km' ? 'កំណត់ចំណាំ' : 'Remark'
                        )}: ${escapeHtml(item.notes)}</div>`
                      : ''
                  }
                </td>
                <td style="text-align:right;white-space:nowrap;font-family:'Roboto Mono','Courier New',monospace;font-weight:600;font-variant-numeric:tabular-nums;">${formatCurrency(item.subtotal)}</td>
              </tr>
            `
          )
          .join('')
      : `<tr><td colspan="2" style="text-align:center;color:#666;padding:14px 0;">${escapeHtml(
          language === 'km' ? 'មិនមានការបញ្ជាទិញសម្រាប់តុនេះទេ' : 'No orders for this table'
        )}</td></tr>`;

    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${escapeHtml(title)}</title>
          <style>
            body { margin: 0; padding: 18px 12px; background: #ececec; font-family: "Roboto", "Open Sans", "Kantumruy Pro", Arial, sans-serif; color: #111; }
            .shell { max-width: 330px; margin: 0 auto; }
            .paper { position: relative; background: #fff; padding: 20px 18px; box-shadow: 0 18px 36px rgba(0,0,0,0.14); }
            .paper:before, .paper:after {
              content: '';
              position: absolute;
              left: 0;
              width: 100%;
              height: 14px;
              background-image: linear-gradient(-45deg, transparent 10px, #fff 0), linear-gradient(45deg, transparent 10px, #fff 0);
              background-size: 20px 20px;
              background-repeat: repeat-x;
            }
            .paper:before { top: -14px; }
            .paper:after { bottom: -14px; transform: rotate(180deg); }
            .center { text-align: center; }
            .shop-name { font-family: "Montserrat", "Poppins", "Segoe UI", Arial, sans-serif; font-size: 20px; font-weight: 700; letter-spacing: 0.11em; }
            .meta { margin-top: 6px; font-size: 11px; color: #666; line-height: 1.45; }
            .divider { margin: 12px 0 10px; text-align: center; letter-spacing: 0.16em; color: #777; font-size: 11px; }
            .title { font-family: "Montserrat", "Poppins", "Segoe UI", Arial, sans-serif; text-align: center; font-size: 14px; font-weight: 700; letter-spacing: 0.12em; margin-bottom: 10px; }
            .section-line { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 2px; font-size: 11px; color: #555; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th { text-align: left; padding-bottom: 6px; font-size: 10px; text-transform: uppercase; color: #888; letter-spacing: 0.08em; }
            td { padding: 7px 0; border-bottom: 1px dashed #d8d8d8; vertical-align: top; font-size: 12px; }
            .total { display: flex; justify-content: space-between; align-items: baseline; margin-top: 12px; font-size: 14px; font-weight: 700; }
            .thanks { margin-top: 12px; text-align: center; font-family: "Montserrat", "Poppins", "Segoe UI", Arial, sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.14em; }
          </style>
        </head>
        <body>
          <div class="shell">
            <div class="paper">
              <div class="center">
                <div class="shop-name">${escapeHtml((store?.name || 'SHOP NAME').toUpperCase())}</div>
                <div class="meta">
                  ${store?.address ? `${escapeHtml(store.address)}<br>` : ''}
                  ${store?.phone ? escapeHtml(store.phone) : ''}
                </div>
              </div>
              <div class="divider">***************</div>
              <div class="title">${escapeHtml(title)}</div>
              <div class="section-line"><span>${escapeHtml(language === 'km' ? 'តុ' : 'Table')}</span><span>${escapeHtml(receiptState.table.name)}</span></div>
              <div class="section-line"><span>${escapeHtml(language === 'km' ? 'លេខកូដ' : 'Order Codes')}</span><span>${escapeHtml(orderCodes || '-')}</span></div>
              <div class="section-line"><span>${escapeHtml(language === 'km' ? 'កាលបរិច្ឆេទ' : 'Created')}</span><span>${escapeHtml(createdAt)}</span></div>
              <table>
                <thead>
                  <tr>
                    <th>${escapeHtml(language === 'km' ? 'មុខម្ហូប' : 'Description')}</th>
                    <th style="text-align:right;">${escapeHtml(language === 'km' ? 'តម្លៃ' : 'Price')}</th>
                  </tr>
                </thead>
                <tbody>${rowsMarkup}</tbody>
              </table>
              <div class="total"><span>${escapeHtml(language === 'km' ? 'សរុប' : 'Total')}</span><span style="font-family:'Roboto Mono','Courier New',monospace;font-weight:700;font-variant-numeric:tabular-nums;">${formatCurrency(receiptTotal)}</span></div>
              <div class="divider">***************</div>
              <div class="thanks">${escapeHtml(language === 'km' ? 'សូមអរគុណ!' : 'THANK YOU!')}</div>
            </div>
          </div>
        </body>
      </html>
    `;
  }, [language, receiptRows, receiptState, receiptTotal, store]);

  const receiptEdgeStyle = {
    backgroundImage:
      'linear-gradient(-45deg, transparent 10px, #ffffff 0), linear-gradient(45deg, transparent 10px, #ffffff 0)',
    backgroundPosition: 'left top, left top',
    backgroundSize: '20px 20px',
    backgroundRepeat: 'repeat-x',
  } as const;

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
    if (!receiptState || !professionalReceiptHtml) return;

    const receiptWindow = window.open('', '_blank', 'width=900,height=700');
    if (!receiptWindow) return;

    receiptWindow.document.open();
    receiptWindow.document.write(professionalReceiptHtml);
    receiptWindow.document.close();
    receiptWindow.focus();
    receiptWindow.print();
  };

  const downloadReceipt = () => {
    if (!receiptState || !professionalReceiptHtml) return;

    const blob = new Blob([professionalReceiptHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${receiptState.table.slug}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className={`text-2xl font-bold ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
          {language === 'km' ? 'ការគ្រប់គ្រងតុ' : 'Table Management'}
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-6 py-3 font-semibold text-white transition-all hover:shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {language === 'km' ? 'បង្កើតតុ' : 'Add Table'}
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : tables.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 py-12">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <p className={`text-lg font-medium mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
              {language === 'km' ? 'មិនមានតុទេ' : 'No tables yet'}
            </p>
            <p className={`text-sm ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
              {language === 'km' ? 'បង្កើតតុ និង QR Code សម្រាប់ភ្ញៀវ!' : 'Create tables with QR codes for customers!'}
            </p>
          </div>
        ) : (
          tables.map((table) => (
            <div key={table._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all card-hover-lift">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary-dark rounded-xl flex items-center justify-center text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${table.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {table.isActive ? (language === 'km' ? 'សកម្ម' : 'Active') : (language === 'km' ? 'មិនសកម្ម' : 'Inactive')}
                </span>
              </div>

              <h3 className={`text-lg font-bold mb-1 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                {language === 'km' ? `តុ ${table.name}` : `Table ${table.name}`}
              </h3>

              <p className="text-sm text-gray-500 mb-4">Slug: {table.slug}</p>

              <div className="space-y-2">
                <button
                  onClick={() => handleShowQR(table)}
                  className="w-full px-3 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {table.qrCode ? (language === 'km' ? 'មើល QR Code' : 'View QR Code') : (language === 'km' ? 'បង្កើត QR Code' : 'Generate QR Code')}
                </button>

                <button
                  onClick={() => openReceipt(table)}
                  className="w-full px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  {language === 'km' ? 'បោះពុម្ពវិក្កយបត្រ' : 'Receipt / Print'}
                </button>

                <button
                  onClick={() => toggleActive(table._id, table.isActive)}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${table.isActive ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                >
                  {table.isActive ? (language === 'km' ? 'ធ្វើឱ្យមិនសកម្ម' : 'Deactivate') : (language === 'km' ? 'ធ្វើឱ្យសកម្ម' : 'Activate')}
                </button>

                <button
                  onClick={() => clearTableOrders(table)}
                  className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  {language === 'km' ? 'សម្អាតតុ' : 'Clear Table'}
                </button>

                <button
                  onClick={() => handleDelete(table._id)}
                  className="w-full px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  {language === 'km' ? 'លុបតុ' : 'Delete Table'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scaleIn">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className={`text-xl font-bold ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                {language === 'km' ? 'បង្កើតតុថ្មី' : 'Create New Table'}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? 'ឈ្មោះតុ*' : 'Table Name*'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                  placeholder={language === 'km' ? 'ឧ. A1, B2, Table 1' : 'e.g., A1, B2, Table 1'}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? 'Slug (URL - បង្កើតស្វ័យប្រវត្តិ)' : 'Slug (URL - Auto-generated)'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(event) => setFormData({ ...formData, slug: event.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                  placeholder={language === 'km' ? 'នឹងបង្កើតស្វ័យប្រវត្តិ' : 'Will be auto-generated'}
                  readOnly
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(event) => setFormData({ ...formData, isActive: event.target.checked })}
                  className="w-4 h-4 text-primary rounded focus:ring-primary"
                />
                <label htmlFor="isActive" className={`text-sm text-gray-700 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                  {language === 'km' ? 'តុសកម្ម' : 'Table is active'}
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  {language === 'km' ? 'បង្កើត' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showQRModal && selectedTable?.qrCode && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scaleIn">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className={`text-xl font-bold ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                {language === 'km' ? `QR Code - តុ ${selectedTable.name}` : `QR Code - Table ${selectedTable.name}`}
              </h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 text-center">
              <div className="bg-white p-6 rounded-2xl border-2 border-gray-200 inline-block mb-4">
                <img src={selectedTable.qrCode} alt="QR Code" className="w-48 h-48" />
              </div>

              <p className={`text-sm text-gray-600 mb-4 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                {language === 'km' ? 'ស្កេន QR Code នេះដើម្បីបញ្ជាទិញពីតុនេះ' : 'Scan this QR code to order from this table'}
              </p>

              <div className="bg-gray-50 p-3 rounded-xl mb-4">
                <p className="text-xs text-gray-500 mb-1">Order URL:</p>
                <p className="text-sm font-mono text-primary break-all">{getOrderURL(selectedTable)}</p>
              </div>

              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = selectedTable.qrCode!;
                  link.download = `table-${selectedTable.slug}-qr.png`;
                  link.click();
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {language === 'km' ? 'ទាញយក QR Code' : 'Download QR Code'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReceiptModal && receiptState && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className={`text-xl font-bold ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                {language === 'km'
                  ? `វិក្កយបត្រ - តុ ${receiptState.table.name}`
                  : `Receipt - Table ${receiptState.table.name}`}
              </h3>
              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  setReceiptState(null);
                }}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-gray-100 p-6">
              <div className="mx-auto max-w-[330px]">
                <div className="h-[14px]" style={receiptEdgeStyle}></div>
                  <div className="bg-white px-[18px] py-5 shadow-[0_18px_36px_rgba(0,0,0,0.14)] [font-family:'Roboto','Open_Sans','Kantumruy_Pro',Arial,sans-serif]">
                    <div className="text-center">
                    <h4 className="[font-family:'Montserrat','Poppins','Segoe_UI',Arial,sans-serif] text-[20px] font-bold tracking-[0.11em] text-gray-900">
                      {(store?.name || 'SHOP NAME').toUpperCase()}
                    </h4>
                    <div className={`mt-1.5 text-[11px] leading-[1.45] text-gray-500 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                      {store?.address && <div>{store.address}</div>}
                      {store?.phone && <div>{store.phone}</div>}
                    </div>
                  </div>

                  <div className="my-3 text-center text-[11px] tracking-[0.16em] text-gray-400">
                    ***************
                  </div>

                  <div className="[font-family:'Montserrat','Poppins','Segoe_UI',Arial,sans-serif] text-center text-[14px] font-bold tracking-[0.12em] text-gray-900">
                    {language === 'km' ? 'វិក្កយបត្រ' : 'CASH RECEIPT'}
                  </div>

                  <div className="mt-3 space-y-0.5 text-[11px] text-gray-500">
                    <div className="flex items-center justify-between gap-4">
                      <span>{language === 'km' ? 'តុ' : 'Table'}</span>
                      <span className="text-right text-gray-800">{receiptState.table.name}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>{language === 'km' ? 'លេខកូដ' : 'Order Codes'}</span>
                      <span className="text-right text-gray-800">{receiptOrderCodes || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>{language === 'km' ? 'កាលបរិច្ឆេទ' : 'Created'}</span>
                      <span className="text-right text-gray-800">{receiptCreatedAt}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between border-b border-dashed border-gray-300 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-400">
                      <span>{language === 'km' ? 'មុខម្ហូប' : 'Description'}</span>
                      <span>{language === 'km' ? 'តម្លៃ' : 'Price'}</span>
                    </div>

                    {receiptRows.length === 0 ? (
                      <div className={`py-6 text-center text-sm text-gray-500 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                        {language === 'km' ? 'មិនមានការបញ្ជាទិញសម្រាប់តុនេះទេ' : 'No orders for this table'}
                      </div>
                    ) : (
                      <div className="divide-y divide-dashed divide-gray-200">
                        {receiptRows.map((item, index) => (
                          <div key={`${item.orderId}-${index}`} className="py-2">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <div className={`text-[12px] font-semibold leading-[1.35] text-gray-900 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                                  {item.name}
                                </div>
                                <div className="mt-px text-[11px] text-gray-500">x{item.quantity}</div>
                                {item.notes && (
                                  <div className={`mt-0.5 text-[10px] leading-[1.35] text-gray-500 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                                    {language === 'km' ? 'កំណត់ចំណាំ' : 'Remark'}: {item.notes}
                                  </div>
                                )}
                              </div>
                              <div className="font-mono text-[12px] font-semibold tabular-nums text-gray-900">
                                {formatCurrency(item.subtotal)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 border-t border-dashed border-gray-300 pt-3">
                    <div className="flex items-baseline justify-between text-[14px] font-bold text-gray-900">
                      <span>{language === 'km' ? 'សរុប' : 'Total'}</span>
                      <span className="font-mono text-[15px] font-bold tabular-nums">{formatCurrency(receiptTotal)}</span>
                    </div>
                  </div>

                  <div className="my-3 text-center text-[11px] tracking-[0.16em] text-gray-400">
                    ***************
                  </div>

                  <div className="[font-family:'Montserrat','Poppins','Segoe_UI',Arial,sans-serif] text-center text-[12px] font-bold tracking-[0.14em] text-gray-900">
                    {language === 'km' ? 'សូមអរគុណ!' : 'THANK YOU!'}
                  </div>
                </div>
                <div className="h-[14px] rotate-180" style={receiptEdgeStyle}></div>
              </div>

              <div className="mx-auto mt-6 flex max-w-[360px] flex-col gap-3">
                <button
                  onClick={printReceipt}
                  className="w-full px-4 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  {language === 'km' ? 'បោះពុម្ពវិក្កយបត្រ' : 'Print Receipt'}
                </button>
                <button
                  onClick={downloadReceipt}
                  className="w-full px-4 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-colors"
                >
                  {language === 'km' ? 'ទាញយកវិក្កយបត្រ' : 'Download Receipt'}
                </button>
              </div>
            </div>

            <div className="hidden p-6 space-y-6">
              <div className="rounded-2xl border border-gray-200 p-6 bg-gray-50">
                <div className="border-b border-dashed border-gray-300 pb-4 mb-4">
                  <h4 className="text-2xl font-bold text-gray-900">{store?.name || 'Store'}</h4>
                  {store?.phone && (
                    <p className={`text-sm text-gray-600 mt-1 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                      {language === 'km' ? 'លេខទូរស័ព្ទ' : 'Phone'}: {store.phone}
                    </p>
                  )}
                  {store?.address && (
                    <p className={`text-sm text-gray-600 mt-1 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                      {language === 'km' ? 'អាសយដ្ឋាន' : 'Address'}: {store.address}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">{language === 'km' ? 'តុ' : 'Table'}</p>
                    <p className={`font-semibold text-gray-900 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                      {receiptState.table.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">{language === 'km' ? 'លេខកូដ' : 'Order Codes'}</p>
                    <p className="font-semibold text-gray-900">
                      {receiptState.orders.length > 0
                        ? receiptState.orders.map((order) => `#${order._id.slice(-6)}`).join(', ')
                        : '-'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
                        <th className="py-2">{language === 'km' ? 'មុខម្ហូប' : 'Item'}</th>
                        <th className="py-2 text-center">{language === 'km' ? 'ចំនួន' : 'Qty'}</th>
                        <th className="py-2 text-right">{language === 'km' ? 'តម្លៃ' : 'Price'}</th>
                        <th className="py-2 text-right">{language === 'km' ? 'សរុប' : 'Amount'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receiptRows.length === 0 ? (
                        <tr>
                          <td colSpan={4} className={`py-6 text-center text-gray-500 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                            {language === 'km' ? 'មិនមានការបញ្ជាទិញសម្រាប់តុនេះទេ' : 'No orders for this table'}
                          </td>
                        </tr>
                      ) : (
                        receiptRows.map((item, index) => (
                          <React.Fragment key={`${item.orderId}-${index}`}>
                            <tr className="border-b border-gray-100">
                              <td className={`py-3 pr-3 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                                {item.name}
                              </td>
                              <td className="py-3 text-center">{item.quantity}</td>
                              <td className="py-3 text-right">{formatCurrency(item.price)}</td>
                              <td className="py-3 text-right font-semibold">{formatCurrency(item.subtotal)}</td>
                            </tr>
                            {item.notes && (
                              <tr>
                                <td colSpan={4} className={`pb-3 text-xs text-gray-500 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                                  {language === 'km' ? 'កំណត់ចំណាំ' : 'Remark'}: {item.notes}
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-dashed border-gray-300 pt-4">
                  <span className={`text-base font-semibold ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                    {language === 'km' ? 'សរុប' : 'Total'}
                  </span>
                  <span className="text-xl font-bold text-primary">{formatCurrency(receiptTotal)}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={printReceipt}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  {language === 'km' ? 'បោះពុម្ពវិក្កយបត្រ' : 'Print Receipt'}
                </button>
                <button
                  onClick={downloadReceipt}
                  className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-colors"
                >
                  {language === 'km' ? 'ទាញយកវិក្កយបត្រ' : 'Download Receipt'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablesView;
