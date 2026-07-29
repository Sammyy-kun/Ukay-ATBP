'use client';

import React, { useState } from 'react';
import { Item, PaymentMethod } from '@/types/item';
import { X, CheckCircle, ShieldCheck, Phone, User, CreditCard, Sparkles, AlertCircle } from 'lucide-react';

interface CustomerItemModalProps {
  item: Item;
  onClose: () => void;
  onReserveSuccess: (itemId: string, customerData: { name: string; phone: string; paymentMethod: PaymentMethod }) => void;
}

export const CustomerItemModal: React.FC<CustomerItemModalProps> = ({
  item,
  onClose,
  onReserveSuccess
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('GCash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReserved, setIsReserved] = useState(false);

  const handleReserveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      setError('Please provide your name and contact phone number');
      return;
    }

    setIsSubmitting(true);
    // Simulate instant reservation
    setTimeout(() => {
      onReserveSuccess(item.id, {
        name: customerName.trim(),
        phone: customerPhone.trim(),
        paymentMethod
      });
      setIsSubmitting(false);
      setIsReserved(true);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden text-white shadow-2xl space-y-0 my-auto">
        {/* Top Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
              1-OF-1 THRIFT FIND
            </span>
            <span className="text-xs font-mono text-slate-400">{item.SKU}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[85vh] overflow-y-auto">
          {isReserved ? (
            /* Success View */
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-extrabold text-white">Item Reserved!</h3>
              <p className="text-sm text-slate-300 max-w-xs mx-auto leading-relaxed">
                Thank you <strong className="text-orange-400">{customerName}</strong>! Store staff has been notified. We will contact you at <strong className="text-white">{customerPhone}</strong> to arrange {paymentMethod}.
              </p>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400 text-left space-y-1">
                <div className="flex justify-between"><span>Reserved Item:</span> <strong className="text-white">{item.category} ({item.size})</strong></div>
                <div className="flex justify-between"><span>Total Price:</span> <strong className="text-orange-400">₱{item.price}</strong></div>
                <div className="flex justify-between"><span>Payment:</span> <strong className="text-white">{paymentMethod}</strong></div>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-lg transition"
              >
                Back to Shop Catalog
              </button>
            </div>
          ) : (
            <>
              {/* Photo Viewfinder Carousel */}
              <div className="space-y-2">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-black border border-slate-800">
                  <img
                    src={item.photos[activePhotoIdx] || item.photos[0]}
                    alt={item.category}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur px-3 py-1 rounded-xl text-lg font-extrabold text-orange-400 border border-orange-500/30">
                    ₱{item.price}
                  </div>
                </div>

                {item.photos.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {item.photos.map((src, i) => (
                      <button
                        key={i}
                        onClick={() => setActivePhotoIdx(i)}
                        className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition ${
                          activePhotoIdx === i ? 'border-orange-500 scale-105' : 'border-slate-800 opacity-60'
                        }`}
                      >
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Specs Badge Bar */}
              <div className="grid grid-cols-3 gap-2 text-center bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Category</span>
                  <p className="text-sm font-bold text-slate-100">{item.category}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Size</span>
                  <p className="text-sm font-bold text-slate-100">{item.size}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Condition</span>
                  <p className="text-sm font-bold text-slate-100">{item.condition}</p>
                </div>
              </div>

              {item.notes && (
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300">
                  <span className="font-bold text-orange-400">Notes: </span>{item.notes}
                </div>
              )}

              {/* Reservation Form */}
              <form onSubmit={handleReserveSubmit} className="space-y-4 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Reserve & Order Form
                </h4>

                <div className="space-y-3">
                  {/* Name */}
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white outline-none"
                    />
                  </div>

                  {/* Phone */}
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="GCash / Mobile Number (0917...)"
                      className="w-full bg-slate-950 border border-slate-700 focus:border-orange-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white outline-none"
                    />
                  </div>

                  {/* Payment Method selection */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400 uppercase">Payment Method</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['GCash', 'Cash on Delivery', 'In-Store Pickup'] as PaymentMethod[]).map((pm) => (
                        <button
                          type="button"
                          key={pm}
                          onClick={() => setPaymentMethod(pm)}
                          className={`p-2 rounded-xl text-[11px] font-semibold border text-center transition ${
                            paymentMethod === pm
                              ? 'bg-orange-500 text-white border-orange-400 shadow-md font-bold'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {pm === 'Cash on Delivery' ? 'COD' : pm === 'In-Store Pickup' ? 'Pickup' : pm}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-2.5 bg-red-900/40 border border-red-500/50 rounded-xl text-red-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-base rounded-xl shadow-lg shadow-orange-500/30 active:scale-[0.99] transition flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-5 h-5" />
                  {isSubmitting ? 'Reserving...' : `RESERVE ITEM NOW (₱${item.price})`}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
