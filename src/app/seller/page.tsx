'use client';

import React, { useState, useEffect } from 'react';
import { Item, ItemStatus, PaymentMethod } from '@/types/item';
import { 
  getStoredItems, 
  addItem, 
  updateItemStatus, 
  updateItem, 
  deleteItem, 
  resetInventoryToDefault 
} from '@/lib/storage';

import { InventoryDashboard } from '@/components/seller/InventoryDashboard';
import { GuidedCameraCapture } from '@/components/camera/GuidedCameraCapture';
import { TaggingForm } from '@/components/seller/TaggingForm';
import { ItemDetailModal } from '@/components/seller/ItemDetailModal';

import { Camera, LayoutDashboard, Store, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SellerPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [sellerSubView, setSellerSubView] = useState<'dashboard' | 'camera' | 'tagging'>('dashboard');
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [selectedSellerItem, setSelectedSellerItem] = useState<Item | null>(null);

  useEffect(() => {
    setItems(getStoredItems());

    const handleStorageUpdate = (e: CustomEvent<Item[]>) => {
      setItems(e.detail);
    };

    window.addEventListener('ukay_storage_update', handleStorageUpdate as EventListener);
    return () => {
      window.removeEventListener('ukay_storage_update', handleStorageUpdate as EventListener);
    };
  }, []);

  const handlePhotosCaptured = (photos: string[]) => {
    setCapturedPhotos(photos);
    setSellerSubView('tagging');
  };

  const handlePublishItem = (itemData: Omit<Item, 'id' | 'date_added'>) => {
    const newItem: Item = {
      ...itemData,
      id: `item-${Date.now()}`,
      date_added: new Date().toISOString()
    };
    const updated = addItem(newItem);
    setItems(updated);
    setSellerSubView('dashboard');
    setCapturedPhotos([]);
  };

  const handleUpdateItemStatus = (
    id: string, 
    status: ItemStatus, 
    details?: { sold_price?: number; payment_method?: PaymentMethod }
  ) => {
    const updated = updateItemStatus(id, status, details);
    setItems(updated);
    if (selectedSellerItem && selectedSellerItem.id === id) {
      setSelectedSellerItem(updated.find(i => i.id === id) || null);
    }
  };

  const handleSaveItem = (updatedItem: Item) => {
    const updated = updateItem(updatedItem);
    setItems(updated);
    setSelectedSellerItem(updatedItem);
  };

  const handleDeleteItem = (id: string) => {
    const updated = deleteItem(id);
    setItems(updated);
    setSelectedSellerItem(null);
  };

  const handleResetData = () => {
    if (confirm('Reset inventory to default sample thrift items?')) {
      const updated = resetInventoryToDefault();
      setItems(updated);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-extrabold text-white flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-orange-500" /> Seller Staff Dashboard
            </h1>
            <p className="text-xs text-slate-400">Mobile-First Inventory & Quick Capture</p>
          </div>
        </div>

        <Link
          href="/"
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
        >
          <Store className="w-4 h-4 text-orange-400" />
          Customer Shop View
        </Link>
      </div>

      {/* Subview Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setSellerSubView('dashboard')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            sellerSubView === 'dashboard'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Inventory Grid
        </button>
        <button
          onClick={() => setSellerSubView('camera')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            sellerSubView === 'camera' || sellerSubView === 'tagging'
              ? 'bg-orange-600 text-white shadow-md'
              : 'bg-slate-900 text-orange-400 border border-slate-800 hover:bg-slate-800'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          + Snap & List Item (&lt;60s)
        </button>
      </div>

      {/* Views */}
      {sellerSubView === 'camera' && (
        <div className="max-w-md mx-auto">
          <GuidedCameraCapture
            onPhotosCaptured={handlePhotosCaptured}
            onCancel={() => setSellerSubView('dashboard')}
          />
        </div>
      )}

      {sellerSubView === 'tagging' && (
        <div className="max-w-xl mx-auto">
          <TaggingForm
            photos={capturedPhotos}
            onPublish={handlePublishItem}
            onBackToCamera={() => setSellerSubView('camera')}
          />
        </div>
      )}

      {sellerSubView === 'dashboard' && (
        <InventoryDashboard
          items={items}
          onSelectItem={(item) => setSelectedSellerItem(item)}
          onNewListing={() => setSellerSubView('camera')}
          onResetData={handleResetData}
        />
      )}

      {selectedSellerItem && (
        <ItemDetailModal
          item={selectedSellerItem}
          onClose={() => setSelectedSellerItem(null)}
          onUpdateStatus={handleUpdateItemStatus}
          onSaveItem={handleSaveItem}
          onDeleteItem={handleDeleteItem}
        />
      )}
    </div>
  );
}
