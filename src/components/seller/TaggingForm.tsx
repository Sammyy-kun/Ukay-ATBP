'use client';

import React, { useState } from 'react';
import { Item, ItemCategory, ItemSize, ItemCondition } from '@/types/item';
import { generateSKU } from '@/lib/storage';
import { Tag, Check, Sparkles, AlertCircle, Lock } from 'lucide-react';

interface TaggingFormProps {
  photos: string[];
  onPublish: (itemData: Omit<Item, 'id' | 'date_added'>) => void;
  onBackToCamera?: () => void;
}

const CATEGORIES: ItemCategory[] = [
  'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Bags', 'Shoes', 'Accessories', 'Other'
];

const SIZES: ItemSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

const CONDITIONS: { label: ItemCondition; badge: string; color: string }[] = [
  { label: 'Like New', badge: 'Mint Condition', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { label: 'Good', badge: 'Normal Wash Wear', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  { label: 'Fair', badge: 'Visible Thrift Vintage', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { label: 'With Flaws', badge: 'Stain/Hole Noted', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
];

const QUICK_PRICES = [150, 200, 250, 300, 350, 450, 500];

export const TaggingForm: React.FC<TaggingFormProps> = ({
  photos,
  onPublish,
  onBackToCamera
}) => {
  const [category, setCategory] = useState<ItemCategory>('Tops');
  const [size, setSize] = useState<ItemSize>('M');
  const [condition, setCondition] = useState<ItemCondition>('Good');
  const [price, setPrice] = useState<number | ''>(250);
  const [sku, setSku] = useState<string>(() => generateSKU('Tops'));
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleCategorySelect = (cat: ItemCategory) => {
    setCategory(cat);
    setSku(generateSKU(cat));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || Number(price) <= 0) {
      setError('Please enter a valid price');
      return;
    }
    if (photos.length === 0) {
      setError('At least one photo is required');
      return;
    }

    onPublish({
      photos,
      category,
      size,
      condition,
      price: Number(price),
      status: 'Available',
      SKU: sku,
      notes: notes.trim() || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 text-white space-y-6 shadow-xl">
      {/* Photos Carousel Preview */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Item Photos ({photos.length})</label>
          {onBackToCamera && (
            <button
              type="button"
              onClick={onBackToCamera}
              className="text-xs text-orange-400 hover:underline"
            >
              + Edit / Retake Photos
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {photos.map((src, i) => (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700 flex-shrink-0 bg-slate-950">
              <img src={src} alt={`Item preview ${i}`} className="w-full h-full object-cover" />
              <span className="absolute bottom-1 right-1 bg-black/70 text-[10px] px-1.5 py-0.5 rounded text-slate-300">
                #{i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Chip Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-orange-500" /> Category
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat;
            return (
              <button
                type="button"
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`py-2.5 px-3 rounded-xl text-sm font-semibold border transition chip-btn flex items-center justify-between ${
                  isSelected
                    ? 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-600/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700/80 hover:bg-slate-750'
                }`}
              >
                <span>{cat}</span>
                {isSelected && <Check className="w-4 h-4 text-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Size Selector (Tap Chips) */}
      <div className="space-y-2">
        <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Size</label>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((sz) => {
            const isSelected = size === sz;
            return (
              <button
                type="button"
                key={sz}
                onClick={() => setSize(sz)}
                className={`py-2 px-3.5 rounded-xl text-sm font-bold border transition chip-btn ${
                  isSelected
                    ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/20 scale-105'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {sz}
              </button>
            );
          })}
        </div>
      </div>

      {/* Condition Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Condition</label>
        <div className="grid grid-cols-2 gap-2">
          {CONDITIONS.map((cond) => {
            const isSelected = condition === cond.label;
            return (
              <button
                type="button"
                key={cond.label}
                onClick={() => setCondition(cond.label)}
                className={`p-3 rounded-xl text-left border transition chip-btn flex flex-col justify-between ${
                  isSelected
                    ? `${cond.color} border-2 font-bold shadow-md`
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-sm font-semibold">{cond.label}</span>
                  {isSelected && <Check className="w-4 h-4" />}
                </div>
                <span className="text-[11px] opacity-75 mt-1">{cond.badge}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pricing & Quick Price Chips */}
      <div className="space-y-2">
        <label className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Price (PHP ₱)</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-orange-400">₱</span>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
            placeholder="0"
            className="w-full bg-slate-950 border-2 border-slate-700 focus:border-orange-500 rounded-xl py-3 pl-10 pr-4 text-xl font-bold text-white outline-none transition"
          />
        </div>
        
        {/* Quick price tap chips */}
        <div className="flex gap-1.5 overflow-x-auto pt-1 pb-1 no-scrollbar">
          <span className="text-xs text-slate-500 self-center mr-1">Quick:</span>
          {QUICK_PRICES.map((p) => (
            <button
              type="button"
              key={p}
              onClick={() => setPrice(p)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg border border-slate-700 transition font-medium"
            >
              ₱{p}
            </button>
          ))}
        </div>
      </div>

      {/* Auto-generated SKU & Optional Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1">
            <Lock className="w-3 h-3 text-slate-500" /> Auto SKU
          </label>
          <input
            type="text"
            value={sku}
            readOnly
            className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-400 cursor-not-allowed"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase">Flaws / Notes</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. minor wash wear, neck tag missing"
            className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-900/40 border border-red-500/50 rounded-xl text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* One-Tap Publish */}
      <button
        type="submit"
        className="w-full py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-lg rounded-xl shadow-lg shadow-orange-500/30 active:scale-[0.99] transition flex items-center justify-center gap-2 tracking-wide"
      >
        <Sparkles className="w-5 h-5 fill-white/20" />
        ONE-TAP PUBLISH LIVE
      </button>
    </form>
  );
};
