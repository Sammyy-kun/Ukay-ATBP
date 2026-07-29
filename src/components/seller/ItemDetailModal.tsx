'use client';

import React, { useState } from 'react';
import { Item, ItemStatus, PaymentMethod } from '@/types/item';
import { X, CheckCircle, Clock, Tag, RefreshCw, Trash2, Edit3, Lock, DollarSign, Calendar } from 'lucide-react';

interface ItemDetailModalProps {
  item: Item;
  onClose: () => void;
  onUpdateStatus: (id: string, status: ItemStatus, details?: { sold_price?: number; payment_method?: PaymentMethod }) => void;
  onSaveItem: (updated: Item) => void;
  onDeleteItem: (id: string) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onUpdateStatus,
  onSaveItem,
  onDeleteItem
}) => {
  const isSold = item.status === 'Sold';
  const [isEditing, setIsEditing] = useState(false);
  const [price, setPrice] = useState(item.price);
  const [notes, setNotes] = useState(item.notes || '');

  // Sale inputs if marking as Sold
  const [soldPriceInput, setSoldPriceInput] = useState(item.sold_price || item.price);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(item.payment_method || 'GCash');
  const [showMarkSoldModal, setShowMarkSoldModal] = useState(false);

  // Time to sell calculation
  const getTimeToSell = () => {
    if (!item.date_sold || !item.date_added) return 'N/A';
    const start = new Date(item.date_added).getTime();
    const end = new Date(item.date_sold).getTime();
    const diffHours = Math.max(1, Math.round((end - start) / (1000 * 60 * 60)));
    if (diffHours < 24) return `${diffHours} hours`;
    const days = Math.round(diffHours / 24);
    return `${days} days`;
  };

  const handleMarkSoldSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStatus(item.id, 'Sold', {
      sold_price: Number(soldPriceInput),
      payment_method: paymentMethod
    });
    setShowMarkSoldModal(false);
    onClose();
  };

  const handleRelist = () => {
    onUpdateStatus(item.id, 'Available');
    onClose();
  };

  const handleSaveEdits = () => {
    onSaveItem({
      ...item,
      price: Number(price),
      notes: notes.trim() || undefined
    });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden text-white shadow-2xl space-y-0 my-auto">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
              {item.SKU}
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
              item.status === 'Available' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
              item.status === 'Reserved' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
              'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              {item.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Main Photo & Thumbnail Gallery */}
          <div className="space-y-2">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800">
              <img
                src={item.photos[0] || 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80'}
                alt={item.category}
                className={`w-full h-full object-cover ${isSold ? 'opacity-50 grayscale' : ''}`}
              />
              {isSold && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="bg-slate-950/90 text-slate-300 border border-slate-700 text-sm font-extrabold px-4 py-2 rounded-xl shadow-xl uppercase tracking-widest">
                    ITEM SOLD
                  </span>
                </div>
              )}
            </div>

            {item.photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {item.photos.map((p, i) => (
                  <img
                    key={i}
                    src={p}
                    alt=""
                    className="w-14 h-14 rounded-lg object-cover border border-slate-800"
                  />
                ))}
              </div>
            )}
          </div>

          {/* IF ITEM IS SOLD: Read-only Sale Summary */}
          {isSold ? (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sale Summary</span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Read Only
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-400 block">Sold Price</span>
                  <span className="text-xl font-extrabold text-orange-400">₱{item.sold_price ?? item.price}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Payment Method</span>
                  <span className="text-sm font-bold text-slate-200">{item.payment_method || 'GCash'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Time to Sell</span>
                  <span className="text-sm font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5" /> {getTimeToSell()}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Date Sold</span>
                  <span className="text-xs text-slate-300 font-mono mt-0.5 block">
                    {item.date_sold ? new Date(item.date_sold).toLocaleDateString() : 'Recently'}
                  </span>
                </div>
              </div>

              {/* Relist Option */}
              <div className="pt-2">
                <button
                  onClick={handleRelist}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-orange-400 font-bold text-sm rounded-xl border border-slate-700 transition flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  RELIST ITEM TO SHOP
                </button>
              </div>
            </div>
          ) : (
            /* IF ITEM IS AVAILABLE OR RESERVED: Editable details */
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Category</span>
                  <p className="text-sm font-bold text-slate-200">{item.category}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Size</span>
                  <p className="text-sm font-bold text-slate-200">{item.size}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Condition</span>
                  <p className="text-sm font-bold text-slate-200">{item.condition}</p>
                </div>
              </div>

              {/* Price & Edit controls */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-slate-400 uppercase font-semibold">Price & Notes</label>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-xs text-orange-400 hover:underline flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  ) : (
                    <button
                      onClick={handleSaveEdits}
                      className="text-xs text-emerald-400 hover:underline font-bold"
                    >
                      Save Changes
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-slate-400 block mb-1">Price (₱)</span>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-lg font-bold text-orange-400 outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block mb-1">Notes / Flaws</span>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="text-2xl font-extrabold text-orange-400">₱{item.price}</span>
                    {item.notes && <p className="text-xs text-slate-400 mt-1">{item.notes}</p>}
                  </div>
                )}
              </div>

              {/* Status Action Buttons */}
              <div className="space-y-2">
                <span className="text-xs text-slate-400 uppercase font-semibold">Update Status</span>
                <div className="grid grid-cols-2 gap-2">
                  {item.status === 'Available' ? (
                    <button
                      onClick={() => onUpdateStatus(item.id, 'Reserved')}
                      className="py-3 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Clock className="w-4 h-4" /> Mark Reserved
                    </button>
                  ) : (
                    <button
                      onClick={() => onUpdateStatus(item.id, 'Available')}
                      className="py-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" /> Mark Available
                    </button>
                  )}

                  <button
                    onClick={() => setShowMarkSoldModal(true)}
                    className="py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-orange-600/20"
                  >
                    <CheckCircle className="w-4 h-4" /> Mark as SOLD
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Option */}
          <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this listing permanently?')) {
                  onDeleteItem(item.id);
                  onClose();
                }
              }}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Item
            </button>
            <span className="text-[10px] text-slate-500">
              Added: {new Date(item.date_added).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Mark Sold Dialog */}
      {showMarkSoldModal && (
        <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4">
          <form onSubmit={handleMarkSoldSubmit} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-4 text-white shadow-2xl">
            <h3 className="text-lg font-bold text-orange-400 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> Record Sale Details
            </h3>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold">Final Sold Price (₱)</label>
              <input
                type="number"
                value={soldPriceInput}
                onChange={(e) => setSoldPriceInput(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl p-3 text-lg font-bold text-white outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-semibold">Payment Method</label>
              <div className="grid grid-cols-1 gap-2">
                {(['GCash', 'Cash on Delivery', 'In-Store Pickup'] as PaymentMethod[]).map((pm) => (
                  <button
                    type="button"
                    key={pm}
                    onClick={() => setPaymentMethod(pm)}
                    className={`p-2.5 rounded-xl text-xs font-semibold border text-left transition ${
                      paymentMethod === pm
                        ? 'bg-orange-500 text-white border-orange-400 font-bold'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {pm}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowMarkSoldModal(false)}
                className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow"
              >
                Confirm Sale
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
