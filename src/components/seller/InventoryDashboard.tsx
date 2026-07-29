'use client';

import React, { useState } from 'react';
import { Item, ItemStatus } from '@/types/item';
import { Search, Filter, Plus, PackageCheck, ShoppingBag, Clock, DollarSign, RefreshCw } from 'lucide-react';

interface InventoryDashboardProps {
  items: Item[];
  onSelectItem: (item: Item) => void;
  onNewListing: () => void;
  onResetData: () => void;
}

export const InventoryDashboard: React.FC<InventoryDashboardProps> = ({
  items,
  onSelectItem,
  onNewListing,
  onResetData
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ItemStatus>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Dashboard Statistics
  const liveCount = items.filter(i => i.status === 'Available').length;
  const reservedCount = items.filter(i => i.status === 'Reserved').length;
  const soldCount = items.filter(i => i.status === 'Sold').length;
  const totalRevenue = items
    .filter(i => i.status === 'Sold')
    .reduce((acc, i) => acc + (i.sold_price ?? i.price), 0);

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.SKU.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* 4-Column Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Live Listings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden shadow-lg">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live Listings</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-extrabold text-emerald-400">{liveCount}</span>
            <span className="text-xs text-slate-500 ml-2">items online</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"></div>
        </div>

        {/* Metric 2: Reserved */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden shadow-lg">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reserved</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-extrabold text-amber-400">{reservedCount}</span>
            <span className="text-xs text-slate-500 ml-2">pending pickup</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500"></div>
        </div>

        {/* Metric 3: Sold Items */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden shadow-lg">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sold</span>
            <div className="p-2 bg-slate-700/30 text-slate-300 rounded-xl">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-extrabold text-slate-300">{soldCount}</span>
            <span className="text-xs text-slate-500 ml-2">items completed</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-600"></div>
        </div>

        {/* Metric 4: Revenue */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden shadow-lg">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</span>
            <div className="p-2 bg-orange-500/10 text-orange-400 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-orange-400">₱{totalRevenue.toLocaleString()}</span>
            <span className="text-xs text-slate-500 block sm:inline sm:ml-2">PHP</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500"></div>
        </div>
      </div>

      {/* Control Bar & Filters */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center bg-slate-900 p-4 rounded-2xl border border-slate-800">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by SKU, category, or notes..."
            className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white outline-none transition"
          />
        </div>

        {/* Status Pills Filter */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto no-scrollbar">
          {(['All', 'Available', 'Reserved', 'Sold'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-orange-500 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* New Listing Button */}
        <div className="flex gap-2">
          <button
            onClick={onNewListing}
            className="flex-1 md:flex-none py-2.5 px-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition"
          >
            <Plus className="w-5 h-5" />
            New Item
          </button>
          
          <button
            onClick={onResetData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-700 transition"
            title="Reset to Sample Demo Inventory"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid of Item Cards */}
      {filteredItems.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-300">No items match your filter</h3>
          <p className="text-sm">Try clearing your search query or snap a new thrift item!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const isSold = item.status === 'Sold';
            const isReserved = item.status === 'Reserved';

            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-orange-500/50 transition cursor-pointer flex flex-col shadow-lg"
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-square bg-slate-950 overflow-hidden">
                  <img
                    src={item.photos[0] || 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80'}
                    alt={item.category}
                    className={`w-full h-full object-cover group-hover:scale-105 transition duration-300 ${
                      isSold ? 'opacity-40 grayscale' : ''
                    }`}
                  />

                  {/* Status Badge in Top-Left Corner */}
                  <div className="absolute top-2 left-2 z-10">
                    {item.status === 'Available' && (
                      <span className="bg-emerald-500/90 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                        Available
                      </span>
                    )}
                    {isReserved && (
                      <span className="bg-amber-500/90 backdrop-blur text-slate-950 text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                        Reserved
                      </span>
                    )}
                    {isSold && (
                      <span className="bg-slate-800/90 backdrop-blur text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-700">
                        Sold
                      </span>
                    )}
                  </div>

                  {/* Price Tag in Bottom-Right */}
                  <div className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded-lg border border-slate-800 text-sm font-extrabold text-orange-400">
                    ₱{item.price}
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-3 flex-1 flex flex-col justify-between space-y-1">
                  <div>
                    <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
                      <span>{item.category}</span>
                      <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">{item.size}</span>
                    </div>
                    <p className="text-xs font-mono text-slate-500 mt-1 truncate">{item.SKU}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex justify-between items-center text-[11px] text-slate-400">
                    <span className="truncate max-w-[100px]">{item.condition}</span>
                    <span className="text-orange-400 group-hover:underline">Edit &rarr;</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
