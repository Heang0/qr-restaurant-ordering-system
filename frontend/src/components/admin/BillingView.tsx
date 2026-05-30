import React, { useState, useEffect } from 'react';
import PaymentModal from '../order/PaymentModal';

interface BillingViewProps {
  language: 'en' | 'km';
  t: (key: string) => string;
}

const BillingView: React.FC<BillingViewProps> = ({ language, t }) => {
  const [currentPlan, setCurrentPlan] = useState<'free' | 'pro' | 'pro_max'>('free');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [storeId, setStoreId] = useState('');
  const [targetPlan, setTargetPlan] = useState<'pro' | 'pro_max'>('pro');

  useEffect(() => {
    const fetchStore = async () => {
      const sid = localStorage.getItem('storeId');
      if (sid) {
        setStoreId(sid);
        try {
          const response = await fetch(`/api/stores?id=${sid}`);
          if (response.ok) {
            const data = await response.json();
            if (data.plan === 'pro') {
              setCurrentPlan('pro');
            } else if (data.plan === 'pro_max') {
              setCurrentPlan('pro_max');
            }
          }
        } catch (error) {
          console.error('Failed to fetch store plan:', error);
        }
      }
    };
    fetchStore();
  }, []);

  const handlePaymentSuccess = () => {
    setCurrentPlan(targetPlan);
    // We could also show a success toast here
  };

  const handleUpgradeClick = (plan: 'pro' | 'pro_max') => {
    setTargetPlan(plan);
    setIsPaymentOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className={`text-xl font-bold text-gray-900 ${language === 'km' ? 'font-khmer' : ''}`}>
          {language === 'km' ? 'កញ្ចប់សេវាកម្ម & វិក័យប័ត្រ' : 'Subscription & Billing'}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        
        {/* Free Plan Card */}
        <div className={`relative p-6 rounded-2xl bg-white border-2 transition-all ${currentPlan === 'free' ? 'border-primary shadow-sm' : 'border-gray-200'}`}>
          {currentPlan === 'free' && (
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
              Current Plan
            </div>
          )}
          <div className="mb-6">
            <h3 className="text-xl font-black text-gray-900">Free Tier</h3>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-black text-gray-900">$0</span>
              <span className="text-sm font-bold text-gray-400">/ forever</span>
            </div>
          </div>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3 text-sm font-medium text-gray-600">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
              Up to 10 Tables
            </li>
            <li className="flex items-center gap-3 text-sm font-medium text-gray-600">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
              Up to 10 Categories
            </li>
            <li className="flex items-center gap-3 text-sm font-medium text-gray-600">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
              Up to 30 Products
            </li>
            <li className="flex items-center gap-3 text-sm font-medium text-gray-400">
              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
              Basic Features
            </li>
            <li className="flex items-center gap-3 text-sm font-medium text-gray-400">
              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
              No Customer Insights
            </li>
          </ul>

          <button 
            disabled
            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-colors ${currentPlan === 'free' ? 'bg-gray-100 text-gray-400' : 'bg-transparent text-transparent'}`}
          >
            {currentPlan === 'free' ? 'Active Plan' : ''}
          </button>
        </div>

        {/* Pro Plan Card */}
        <div className={`relative p-6 rounded-2xl bg-gray-900 border-2 transition-all ${currentPlan === 'pro' ? 'border-primary shadow-lg shadow-primary/10' : 'border-transparent'}`}>
          {currentPlan === 'pro' && (
             <div className="absolute top-0 right-8 -translate-y-1/2 bg-green-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-green-500/30">
               Active Plan
             </div>
          )}
          {currentPlan === 'free' && (
             <div className="absolute top-0 right-8 -translate-y-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-orange-500/30 animate-pulse">
               Recommended
             </div>
          )}
          <div className="mb-6">
            <h3 className="text-xl font-black text-white">Pro Tier</h3>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-black text-white">$3.99</span>
              <span className="text-sm font-bold text-gray-400">/ month</span>
            </div>
          </div>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3 text-sm font-medium text-gray-300">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
              Up to 30 Tables
            </li>
            <li className="flex items-center gap-3 text-sm font-medium text-gray-300">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
              Up to 30 Categories
            </li>
            <li className="flex items-center gap-3 text-sm font-medium text-gray-300">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
              Up to 100 Products
            </li>
            <li className="flex items-center gap-3 text-sm font-medium text-gray-300">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
              Priority Support
            </li>
          </ul>

          <button 
            onClick={() => handleUpgradeClick('pro')}
            disabled={currentPlan === 'pro' || currentPlan === 'pro_max'}
            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-colors ${currentPlan === 'pro' || currentPlan === 'pro_max' ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 hover:shadow-primary/50'}`}
          >
            {currentPlan === 'pro' ? 'Active Plan' : currentPlan === 'pro_max' ? 'Included' : 'Upgrade to Pro'}
          </button>
        </div>

        {/* Pro Max Plan Card */}
        <div className={`relative p-6 rounded-2xl bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 border-2 transition-all ${currentPlan === 'pro_max' ? 'border-purple-400 shadow-lg shadow-purple-500/10' : 'border-transparent'}`}>
          {currentPlan === 'pro_max' && (
             <div className="absolute top-0 right-8 -translate-y-1/2 bg-green-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-green-500/30">
               Active Plan
             </div>
          )}
          <div className="mb-6">
            <h3 className="text-xl font-black text-white">Pro Max</h3>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-black text-white">$19.99</span>
              <span className="text-sm font-bold text-gray-400">/ month</span>
            </div>
          </div>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3 text-sm font-medium text-purple-200">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
              Unlimited Tables
            </li>
            <li className="flex items-center gap-3 text-sm font-medium text-purple-200">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
              Unlimited Categories
            </li>
            <li className="flex items-center gap-3 text-sm font-medium text-purple-200">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
              Unlimited Products
            </li>
            <li className="flex items-center gap-3 text-sm font-medium text-purple-200">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
              24/7 Premium Support
            </li>
          </ul>

          <button 
            onClick={() => handleUpgradeClick('pro_max')}
            disabled={currentPlan === 'pro_max'}
            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-colors ${currentPlan === 'pro_max' ? 'bg-purple-900/50 text-purple-300 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-400 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50'}`}
          >
            {currentPlan === 'pro_max' ? 'Active Plan' : 'Upgrade to Pro Max'}
          </button>
        </div>

      </div>

      {/* Accepted Payment Methods */}
      <div className="pt-8">
        <div>
          <h3 className={`text-xl font-bold text-gray-900 mb-1 ${language === 'km' ? 'font-khmer' : ''}`}>
            {language === 'km' ? 'វិធីសាស្ត្រទូទាត់' : 'Payment Methods'}
          </h3>
          <p className={`text-sm text-gray-500 font-medium mb-4 ${language === 'km' ? 'font-khmer' : ''}`}>
            {language === 'km' ? 'វិធីសាស្ត្រទូទាត់ដែលទទួលយក' : 'Accepted Payment Methods'}
          </p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center justify-between transition-all hover:border-primary/30 hover:shadow-md cursor-pointer group max-w-xl">
          <div className="flex items-center gap-5">
            {/* Logo Box */}
            <div className="w-14 h-14 bg-[#E1232E] rounded-lg flex items-center justify-center shrink-0 shadow-sm">
              <img src="/images/KHQR Logo.png" alt="KHQR" className="w-10 h-10 object-contain" />
            </div>
            {/* Content */}
            <div className="flex flex-col">
              <span className="text-primary text-[10px] font-black uppercase tracking-widest">KHQR</span>
              <span className="text-gray-900 text-lg font-bold uppercase tracking-tight">Bakong KHQR</span>
              <span className={`text-gray-500 text-sm font-medium mt-0.5 ${language === 'km' ? 'font-khmer' : ''}`}>
                {language === 'km' ? 'ទូទាត់តាមរយៈប្រព័ន្ធទូទាត់ Bakong KHQR របស់កម្ពុជា' : 'Pay via Cambodia\'s Bakong KHQR system'}
              </span>
            </div>
          </div>
          {/* Selected Indicator */}
          <div className="w-8 h-8 bg-primary/10 border border-primary text-primary rounded-full flex items-center justify-center shrink-0 transition-colors group-hover:bg-primary group-hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>

      <PaymentModal 
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        orderId={`SUB-${targetPlan.toUpperCase()}`}
        storeId={storeId}
        amount={0.15}
        language={language}
        t={t}
        onPaymentSuccess={handlePaymentSuccess}
        generateUrl={`/api/payment/generate-plan-khqr?planType=${targetPlan}`}
        verifyUrl={`/api/payment/verify-plan-khqr?planType=${targetPlan}`}
      />
    </div>
  );
};

export default BillingView;
