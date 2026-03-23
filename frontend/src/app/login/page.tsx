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
        login(data.token, data.role, data.storeId);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 flex items-center justify-center p-4">
      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">O</span>
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              OrderHey!
            </span>
          </Link>
          <p className={`text-gray-600 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
            {language === 'km' ? 'សូមចូលទៅកាន់គណនីរបស់អ្នក' : 'Sign in to your account'}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100">
          <h1 className={`text-2xl font-bold text-center mb-8 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
            {t('login.title')}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className={`block text-sm font-semibold text-gray-700 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                {t('login.email')}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-300 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                placeholder={language === 'km' ? 'បញ្ចូលអ៊ីមែល' : 'Enter your email'}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className={`block text-sm font-semibold text-gray-700 mb-2 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                {t('login.password')}
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all duration-300 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                placeholder={language === 'km' ? 'បញ្ចូលពាក្យសម្ងាត់' : 'Enter your password'}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-fadeIn">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 btn-hover-lift disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('common.loading')}
                </span>
              ) : (
                t('login.loginButton')
              )}
            </button>
          </form>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <Link href="/" className="text-gray-600 hover:text-primary transition-colors text-sm font-medium">
              ← {language === 'km' ? 'ត្រឡប់ទៅទំព័រដើម' : 'Back to Home'}
            </Link>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-gray-500 text-sm mt-8">
          © {new Date().getFullYear()} OrderHey. {t('footer.rights')}
        </p>
      </div>
    </div>
  );
}
