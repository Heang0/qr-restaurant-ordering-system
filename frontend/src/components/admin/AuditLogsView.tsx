'use client';

import React, { useState, useEffect } from 'react';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: any;
  ip_address: string;
  created_at: string;
  user_email?: string;
  users?: { email: string; full_name?: string; role?: string } | null;
}

interface AuditLogsViewProps {
  language: 'en' | 'km';
  t: (key: string) => string;
}

const AuditLogsView: React.FC<AuditLogsViewProps> = ({ language, t }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Use absolute URL to avoid rewrite issues
  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/audit`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const logList = Array.isArray(data) ? data : (data.logs || []);
        setLogs(logList);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Pagination Logic
  const totalPages = Math.ceil((logs || []).length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = (logs || []).slice(startIndex, startIndex + itemsPerPage);

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return 'bg-green-50 text-green-600 border-green-100';
    if (action.includes('UPDATE')) return 'bg-blue-50 text-blue-600 border-blue-100';
    if (action.includes('DELETE')) return 'bg-red-50 text-red-600 border-red-100';
    if (action.includes('LOGIN')) return 'bg-purple-50 text-purple-600 border-purple-100';
    return 'bg-gray-50 text-gray-600 border-gray-100';
  };

  // SKELETON ROW COMPONENT
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-8 py-5">
        <div className="space-y-2">
          <div className="h-3 w-16 bg-gray-50 rounded-full"></div>
          <div className="h-4 w-20 bg-gray-100 rounded-full"></div>
        </div>
      </td>
      <td className="px-8 py-5">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-100 rounded-full"></div>
          <div className="h-3 w-24 bg-gray-50 rounded-full"></div>
        </div>
      </td>
      <td className="px-8 py-5">
        <div className="h-6 w-24 bg-gray-50 rounded-xl"></div>
      </td>
      <td className="px-8 py-5">
        <div className="h-4 w-20 bg-gray-50 rounded-full"></div>
      </td>
      <td className="px-8 py-5">
        <div className="h-4 w-48 bg-gray-50 rounded-full"></div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className={`text-xl font-bold text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}>
            {language === 'km' ? 'កំណត់ត្រាសកម្មភាព' : 'Audit Logs'}
          </h2>
        </div>
        <button 
          onClick={fetchLogs}
          disabled={isLoading}
          className="p-3 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-primary hover:border-primary transition-all active:scale-95 shadow-sm disabled:opacity-50"
        >
          <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>
      </div>

      {/* Logs Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className={`px-8 py-6 text-[11px] text-gray-400 uppercase tracking-widest ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>
                  {language === 'km' ? 'ពេលវេលា' : 'Time'}
                </th>
                <th className={`px-8 py-6 text-[11px] text-gray-400 uppercase tracking-widest ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>
                  {language === 'km' ? 'អ្នកអនុវត្ត' : 'Performer'}
                </th>
                <th className={`px-8 py-6 text-[11px] text-gray-400 uppercase tracking-widest ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>
                  {language === 'km' ? 'សកម្មភាព' : 'Action'}
                </th>
                <th className={`px-8 py-6 text-[11px] text-gray-400 uppercase tracking-widest ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>
                  {language === 'km' ? 'មុខងា' : 'Entity'}
                </th>
                <th className={`px-8 py-6 text-[11px] text-gray-400 uppercase tracking-widest ${language === 'km' ? 'font-khmer font-normal' : 'font-black'}`}>
                  {language === 'km' ? 'ព័ត៌មានលម្អិត' : 'Details'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <>{[...Array(itemsPerPage)].map((_, i) => <SkeletonRow key={i} />)}</>
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-gray-400 font-bold">No activity logs found</td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <p className="text-[11px] font-black text-gray-400">{new Date(log.created_at).toLocaleDateString()}</p>
                      <p className="text-xs font-bold text-gray-900">{new Date(log.created_at).toLocaleTimeString()}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">
                          {log.users?.email || log.user_email || 'System'}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 tracking-tight capitalize">
                          {log.users?.role || log.ip_address || ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-black text-gray-500 uppercase tracking-widest">{log.entity_type}</span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-bold text-gray-600 truncate max-w-[300px]">
                        {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-8">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          
          <div className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${
                  currentPage === i + 1 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' 
                    : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default AuditLogsView;
