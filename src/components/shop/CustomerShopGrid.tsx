'use client';

import React, { useState } from 'react';
import { Item, ItemCategory, ItemSize } from '@/types/item';
import { Search, Filter, Sparkles, ShoppingBag, Eye, ArrowRight, Tag, ShieldCheck } from 'lucide-react';

interface CustomerShopGridProps {
  items: Item[];
  onSelectItem: (item: Item) => void;
}

const CATEGORIES: ('All' | ItemCategory)[] = [
  'All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Bags', 'Shoes', 'Accessories'
];

const SIZES: ('All' | ItemSize)[] = ['All', 'XS', 'S', 'M', 'L', 'XL', 'Free Size'];

export const CustomerShopGrid: React.FC<CustomerShopGridProps> = ({
  items,
  onSelectItem
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSize, setSelectedSize] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // INSTANT AVAILABILITY FILTER: Only show Available items to public customers
  const availableItems = items.filter(i => i.status === 'Available');

  const filteredItems = availableItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSize = selectedSize === 'All' || item.size === selectedSize;
    const matchesPrice = item.price <= maxPrice;
    const matchesSearch = 
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.size.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSize && matchesPrice && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Store Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 p-6 sm:p-8 text-white shadow-2xl border border-orange-500/30">
        <div className="relative z-10 space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-bold text-orange-100">
            <Sparkles className="w-3.5 h-3.5" /> 1-of-1 Thrift Finds • Daily Fresh Drops
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            UKAY-UKAY <span className="text-amber-200">CURATED SHOP</span>
          </h1>
          <p className="text-sm text-orange-100 leading-relaxed">
            Every item is unique and one-of-a-kind. Reserve items instantly with GCash or Cash on Delivery before they sell out!
          </p>
        </div>

        {/* Decorative background overlay */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-lg">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tops, dresses, outerwear..."
            className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white outline-none"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Category</span>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition chip-btn ${
                  selectedCategory === cat
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Size Filter & Price Slider Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
          {/* Sizes */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Size</span>
            <div className="flex flex-wrap gap-1.5">
              {SIZES.map(sz => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    selectedSize === sz
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-400 uppercase tracking-wider">Max Price</span>
              <span className="font-extrabold text-orange-400">₱{maxPrice}</span>
            </div>
            <input
              type="range"
              min="100"
              max="1500"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-orange-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Available Items Counter */}
      <div className="flex justify-between items-center text-xs text-slate-400 px-1">
        <span>Showing <strong className="text-white">{filteredItems.length}</strong> available item{filteredItems.length === 1 ? '' : 's'}</span>
        <span className="text-emerald-400 font-medium flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Instant Live Catalog
        </span>
      </div>

      {/* Product Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">No thrift items found</h3>
          <p className="text-xs text-slate-400">Try adjusting your filters or price slider to see more items!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="group bg-slate-900 border border-slate-800 hover:border-orange-500/60 rounded-2xl overflow-hidden transition cursor-pointer flex flex-col shadow-lg"
            >
              {/* Image & Price Overlay */}
              <div className="relative aspect-square bg-black overflow-hidden">
                <img
                  src={item.photos[0] || 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80'}
                  alt={item.category}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />

                {/* 1-of-1 Tag */}
                <div className="absolute top-2 left-2 bg-orange-600/90 backdrop-blur text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                  1 OF 1
                </div>

                {/* Size pill */}
                <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur text-slate-200 text-xs font-bold px-2 py-0.5 rounded-md border border-slate-800">
                  {item.size}
                </div>

                {/* Price tag */}
                <div className="absolute bottom-2 right-2 bg-slate-950/90 backdrop-blur px-2.5 py-1 rounded-xl text-sm font-extrabold text-orange-400 border border-orange-500/30">
                  ₱{item.price}
                </div>
              </div>

              {/* Info */}
              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-100 group-hover:text-orange-400 transition">
                    {item.category}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                    {item.notes || `${item.condition} condition vintage item`}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-400 font-medium">{item.condition}</span>
                  <span className="text-xs font-bold text-orange-400 group-hover:translate-x-1 transition flex items-center gap-1">
                    Reserve <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
