'use client';

import React, { useState } from 'react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (remark: string, selectedOptions: any[]) => void;
  imageUrl: string;
  itemName: string;
  itemNameKm?: string;
  description?: string;
  descriptionKm?: string;
  price: number;
  language: 'en' | 'km';
  options?: Array<{ name: string; nameKm: string; price: number }>;
}

const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
  imageUrl,
  itemName,
  itemNameKm,
  description,
  descriptionKm,
  price,
  language,
  options = [],
}) => {
  const [quantity, setQuantity] = useState(1);
  const [remark, setRemark] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);

  if (!isOpen) return null;

  const toggleOption = (idx: number) => {
    setSelectedOptions(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const calculateTotalPrice = () => {
    const optionsTotal = selectedOptions.reduce((sum, idx) => sum + (options[idx]?.price || 0), 0);
    return (price + optionsTotal) * quantity;
  };

  const handleAddToCart = () => {
    const selected = selectedOptions.map(idx => options[idx]);
    onAddToCart(remark, selected);
    setRemark('');
    setQuantity(1);
    setSelectedOptions([]);
  };

  return (
    <div
      className="fixed inset-0 bg-gray-900/40 backdrop-blur-md z-[9999] flex items-end justify-center sm:items-center sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white sm:rounded-[2.5rem] rounded-t-[2.5rem] shadow-2xl animate-slideUp overflow-hidden flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Step 2: Hero Image (Full Bleed) */}
        <div className="relative w-full aspect-[4/3] sm:aspect-video overflow-hidden">
          <img
            src={imageUrl}
            alt={itemName}
            className="w-full h-full object-cover"
          />
          <button 
            onClick={onClose}
            className="absolute top-6 left-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/40 transition-all shadow-xl"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Detail Card - Floating Overlay Effect */}
        <div className="relative -mt-10 bg-white rounded-t-[2.5rem] px-8 pt-8 pb-10 flex-1 overflow-y-auto">
          {/* Rating & Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
              <svg className="w-3.5 h-3.5 text-amber-500 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-[11px] font-black text-amber-700 uppercase tracking-widest">4.8 (120+)</span>
            </div>
            <div className="text-2xl font-black text-primary tracking-tighter">${calculateTotalPrice().toFixed(2)}</div>
          </div>

          <div className="mb-6">
            <h2 className={`text-2xl font-black text-gray-900 mb-2 leading-tight ${language === 'km' ? 'font-khmer font-medium text-3xl' : 'font-sans'}`}>
              {language === 'km' && itemNameKm ? itemNameKm : itemName}
            </h2>
            <p className={`text-sm text-gray-400 leading-relaxed line-clamp-3 ${language === 'km' ? 'font-khmer font-medium' : 'font-sans'}`}>
              {language === 'km' && descriptionKm ? descriptionKm : description || 'Delicate and fresh ingredients prepared with passion.'}
            </p>
          </div>

          {/* Real Add-Ons / Customization Section */}
          {options && options.length > 0 && (
            <div className="space-y-4 mb-8">
              <h4 className={`text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] ${language === 'km' ? 'font-khmer' : ''}`}>
                {language === 'km' ? 'ជម្រើសបន្ថែម' : 'Order Options'}
              </h4>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {options.map((opt, idx) => {
                  const isActive = selectedOptions.includes(idx);
                  return (
                    <button 
                      key={idx} 
                      onClick={() => toggleOption(idx)}
                      className={`px-5 py-3 rounded-2xl border text-[11px] font-bold whitespace-nowrap transition-all flex flex-col items-start gap-0.5 ${
                        isActive 
                          ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                          : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-primary/30'
                      }`}
                    >
                      <span className={`${language === 'km' ? 'font-khmer' : ''}`}>
                        {language === 'km' && opt.nameKm ? opt.nameKm : opt.name}
                      </span>
                      {opt.price > 0 && (
                        <span className={`text-[9px] opacity-70 ${isActive ? 'text-white' : 'text-primary'}`}>
                          +${opt.price.toFixed(2)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes Section */}
          <div className="mb-8">
            <div className="relative group">
              <div className="absolute left-4 top-4 text-gray-300 group-focus-within:text-primary transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder={language === 'km' ? 'បន្ថែមចំណាំនៅទីនេះ...' : 'Add special instructions here...'}
                className={`w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-primary outline-none transition-all text-sm font-medium text-gray-700 resize-none ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
                rows={2}
              />
            </div>
          </div>

          {/* Bottom Actions: Quantity & Add */}
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-100 rounded-2xl p-1.5 h-14">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-gray-900"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
              </button>
              <span className="w-10 text-center font-black text-gray-900">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-gray-900"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              </button>
            </div>
            
            <button
              onClick={handleAddToCart}
              className={`flex-1 h-14 bg-primary text-white rounded-2xl font-black text-[13px] uppercase tracking-widest shadow-xl shadow-primary/25 active:scale-95 transition-all flex items-center justify-center gap-3 ${language === 'km' ? 'font-khmer font-medium' : 'font-sans'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {language === 'km' ? 'បន្ថែមទៅកញ្ចប់' : 'Add to Bag'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
