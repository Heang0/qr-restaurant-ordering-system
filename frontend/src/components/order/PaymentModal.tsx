import React, { useState, useEffect } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  storeId: string;
  amount: number;
  language: 'en' | 'km';
  t: (key: string) => string;
  onPaymentSuccess: () => void;
  generateUrl?: string;
  verifyUrl?: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  orderId,
  storeId,
  amount,
  language,
  t,
  onPaymentSuccess,
  generateUrl = '/api/payment/generate-khqr',
  verifyUrl = '/api/payment/verify-khqr'
}) => {
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [md5, setMd5] = useState<string | null>(null);
  const [merchantName, setMerchantName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'pending' | 'success'>('pending');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes countdown

  useEffect(() => {
    if (isOpen && storeId && amount) {
      generateQR();
      setTimeLeft(180);
      setShowCancelConfirm(false);
    } else {
      setQrImage(null);
      setMd5(null);
      setStatus('pending');
      setError(null);
    }
  }, [isOpen, storeId, amount]);

  // Countdown Timer
  useEffect(() => {
    if (!isOpen || status === 'success' || timeLeft <= 0 || showCancelConfirm) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, status, timeLeft, showCancelConfirm]);

  // Polling
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (md5 && status === 'pending' && !showCancelConfirm) {
      interval = setInterval(verifyPayment, 5000);
    }
    return () => clearInterval(interval);
  }, [md5, status, showCancelConfirm]);

  const generateQR = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(generateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, amount, orderId })
      });
      const data = await response.json();
      if (response.ok) {
        setQrImage(data.qrImage);
        setMd5(data.md5);
        setMerchantName(data.merchantName || 'Restaurant Name');
      } else {
        setError(data.message || 'Failed to generate KHQR');
      }
    } catch (err) {
      setError('An error occurred while generating KHQR');
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async () => {
    if (!md5) return;
    try {
      const response = await fetch(verifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ md5, storeId })
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setStatus('success');
        onPaymentSuccess();
        setTimeout(onClose, 3000);
      } else if (response.status === 500 && data.message?.includes('Server Configuration Error')) {
        setError(data.message);
        setMd5(null); // Stop polling
      }
    } catch (err) {
      console.error('Verification error:', err);
    }
  };

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      
      {/* 2. The Core KHQR Card Asset */}
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
            onClick={() => setShowCancelConfirm(true)} 
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
          
          {/* 3. Internal Typography & Alignment */}
          {loading ? (
             <div className="flex-1 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#E1232E] border-t-transparent"></div>
             </div>
          ) : error ? (
             <div className="flex-1 flex flex-col items-center justify-center text-center text-[#E1232E]">
                <span className="font-bold text-sm">{error}</span>
             </div>
          ) : (
            <>
              {/* Text Data */}
              <div className="w-full text-left flex flex-col items-start justify-start">
                <div className="text-[14px] font-normal text-[#000000] leading-none mb-[8px] whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                  {merchantName}
                </div>
                <div className="flex items-baseline gap-[6px]">
                  <span className="text-[31px] font-bold text-[#000000] tracking-[0px] leading-none">
                    {amount.toFixed(2)}
                  </span>
                  <span className="text-[14px] font-normal text-[#000000] leading-none">
                    USD
                  </span>
                </div>
              </div>

              {/* 4. The QR Code & Coin Badge */}
              <div className="flex-1 flex items-end justify-center w-full mt-4">
                <div className="relative" style={{ width: '234px', height: '234px' }}>
                  {qrImage && (
                    <img src={qrImage} alt="QR Code" className="w-full h-full object-contain" />
                  )}
                  {/* Center Badge */}
                  {qrImage && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[42px] h-[42px] bg-[#000000] rounded-full border-[3px] border-[#FFFFFF] flex items-center justify-center shadow-none">
                      <span className="text-white font-bold text-lg leading-none mt-0.5">$</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Success Modal Overlay */}
        {status === 'success' && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center z-50 animate-scaleIn">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-500/30">
               <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
               </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">Payment Successful!</span>
          </div>
        )}

        {/* Cancel Confirmation Overlay */}
        {showCancelConfirm && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center z-50 p-6 text-center animate-fadeIn">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Cancel Payment?</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to cancel this payment?</p>
            <div className="flex gap-4 w-full">
               <button 
                 onClick={() => setShowCancelConfirm(false)}
                 className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-xl transition-colors"
               >
                 No
               </button>
               <button 
                 onClick={() => { setShowCancelConfirm(false); onClose(); }}
                 className="flex-1 py-3 bg-[#E1232E] hover:bg-red-700 text-white font-bold rounded-xl transition-colors"
               >
                 Yes
               </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Visual Exclusions (Floating Details) */}
      <div className="w-[330px] mt-6 flex flex-col items-center gap-4 animate-slideUp">
         {/* Timer & Refresh */}
         <div className="flex items-center justify-center gap-4">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white/90 text-sm font-bold flex items-center gap-2 border border-white/5">
               <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               {formatTime(timeLeft)}
            </div>
            <button 
              onClick={generateQR}
              className="bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md p-2 rounded-full text-white/90 border border-white/5"
            >
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
               </svg>
            </button>
         </div>

         {/* Expiration Message & ID */}
         <div className="text-center">
            <p className="text-white/70 text-xs mb-1">QR code expires in 3 minutes.</p>
            <p className="text-white/50 text-[10px] font-mono">Order ID: {orderId}</p>
         </div>
      </div>

    </div>
  );
};

export default PaymentModal;
