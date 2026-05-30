'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.role, data.userId, data.storeId, data.profile_image);

        // Fetch store details to get slug
        if (data.storeId) {
          try {
            const storeResponse = await fetch(`/api/stores?id=${data.storeId}`);
            if (storeResponse.ok) {
              const store = await storeResponse.json();
              if (store.slug) {
                localStorage.setItem('storeSlug', store.slug);
              }
            }
          } catch (error) {
            console.error('Failed to fetch store:', error);
          }
        }

        if (data.role === 'superadmin') {
          router.push('/superadmin');
        } else if (data.role === 'admin') {
          router.push('/admin');
        } else {
          setError(t('login.unknownRole'));
        }
      } else {
        setError(data.message || t('login.errorMessage'));
      }
    } catch (err: any) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
      
      <div className="w-full max-w-lg relative z-10">
        {/* Brand Identity */}
        <div className="text-center mb-12 animate-fadeIn">
          <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
            <div className="w-14 h-14 bg-gray-900 text-white rounded-[1.25rem] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div className="flex flex-col items-start">
               <span className="text-3xl font-black text-gray-900 tracking-tighter uppercase">OrderHey!</span>
               <span className="text-[10px] font-black text-primary tracking-[0.3em] uppercase">Control Center</span>
            </div>
          </Link>
        </div>

        {/* Authentication Card */}
        <div className="card-premium p-10 md:p-12 animate-slideUp">
          <div className="mb-10">
            <h1 className={`text-3xl font-black text-gray-900 tracking-tight ${language === 'km' ? 'font-khmer font-normal' : 'font-sans'}`}>
              {t('login.title')}
            </h1>
            <p className={`text-sm font-bold text-gray-400 mt-2 ${language === 'km' ? 'font-khmer font-normal' : 'font-sans'}`}>
              {language === 'km' ? 'សូមបញ្ចូលព័ត៌មានសម្ងាត់របស់អ្នក' : 'Access your restaurant management console'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input Group */}
            <div className="space-y-2">
              <label htmlFor="email" className={`text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 ${language === 'km' ? 'font-khmer font-normal' : 'font-sans'}`}>
                {t('login.email')}
              </label>
              <div className="relative group">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" /></svg>
                 </div>
                 <input
                   type="email"
                   id="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   required
                   className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"
                   placeholder="admin@restaurant.com"
                 />
              </div>
            </div>

            {/* Password Input Group */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                 <label htmlFor="password" className={`text-[10px] font-black text-gray-400 uppercase tracking-widest ${language === 'km' ? 'font-khmer font-normal' : 'font-sans'}`}>
                   {t('login.password')}
                 </label>
                 <button type="button" className="text-[10px] font-black text-primary uppercase tracking-widest hover:text-primary-dark">Forgot?</button>
              </div>
              <div className="relative group">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                 </div>
                 <input
                   type="password"
                   id="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   required
                   className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-gray-900 placeholder:text-gray-300"
                   placeholder="••••••••"
                 />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-shake">
                {error}
              </div>
            )}

            {/* Login Action */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-5 rounded-2xl flex items-center justify-center gap-3 group relative overflow-hidden"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                   <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
                   <span className="font-black uppercase tracking-widest text-xs">Verifying Credentials...</span>
                </div>
              ) : (
                <>
                  <span className={`font-black uppercase tracking-widest text-xs ${language === 'km' ? 'font-khmer font-normal' : 'font-sans'}`}>{t('login.loginButton')}</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </>
              )}
            </button>
          </form>

          {/* Social Proof/Divider */}
          <div className="mt-12 pt-8 border-t border-gray-50 flex flex-col items-center justify-between gap-4">
             <Link href="/register" className="text-[10px] font-black text-primary uppercase tracking-widest hover:text-primary-dark transition-colors flex items-center gap-2 border border-primary/20 px-4 py-2 rounded-xl">
                Become a Partner (Register)
             </Link>
             <div className="w-full flex items-center justify-between">
               <Link href="/" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  {language === 'km' ? 'ត្រឡប់ទៅទំព័រដើម' : 'Back to Home'}
               </Link>
               <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Powered by OrderHey!</p>
             </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <p className="text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-10 opacity-50">
          © {new Date().getFullYear()} OrderHey. System restricted to authorized personnel only.
        </p>
      </div>
    </div>
  );
}
