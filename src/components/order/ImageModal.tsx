'use client';

import React, { useState } from 'react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (notes: string) => void;
  imageUrl: string;
  itemName: string;
  itemNameKm?: string;
  description?: string;
  descriptionKm?: string;
  price: number;
  language: 'en' | 'km';
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
}) => {
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleAddToCart = () => {
    onAddToCart(notes);
    setNotes('');
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl animate-scaleIn bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative w-full aspect-square">
          <img
            src={imageUrl}
            alt={language === 'km' && itemNameKm ? itemNameKm : itemName}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <div>
            <h2 className={`text-lg font-bold ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
              {language === 'km' && itemNameKm ? itemNameKm : itemName}
            </h2>
            {language === 'km' && itemNameKm && (
              <p className="text-xs text-gray-500 font-sans mt-0.5">{itemName}</p>
            )}
          </div>

          {/* Price */}
          <div className="text-xl font-bold text-primary">
            ${price.toFixed(2)}
          </div>

          {/* Description */}
          {(description || descriptionKm) && (
            <div>
              <p className={`text-xs text-gray-600 leading-relaxed ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
                {language === 'km' && descriptionKm ? descriptionKm : description}
              </p>
            </div>
          )}

          {/* Notes/Remarks Field */}
          <div>
            <label className={`block text-xs font-medium text-gray-600 mb-1 ${language === 'km' ? 'font-khmer' : 'font-sans'}`}>
              {language === 'km' ? 'ចំណាំ' : 'Notes'} <span className="text-gray-400">(Optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={language === 'km' ? 'ឧ. មិនយកស្ករ...' : 'e.g. No sugar...'}
              className={`w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all resize-none ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
              rows={2}
            />
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={onClose}
              className={`px-4 py-2.5 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-all text-sm ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
            >
              {language === 'km' ? 'បិទ' : 'Close'}
            </button>
            <button
              onClick={handleAddToCart}
              className={`px-4 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-1.5 text-sm ${language === 'km' ? 'font-khmer' : 'font-sans'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {language === 'km' ? 'បន្ថែម' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
